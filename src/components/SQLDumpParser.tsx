import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Database, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { bulkInsertCars, CarData, BulkInsertResult, parsePrice } from '@/utils/bulkCarInsertion';
import { shouldSkipCarEntry } from '@/utils/carDataValidation';
import { Badge } from '@/components/ui/badge';

export const SQLDumpParser = () => {
  const [sqlInput, setSqlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BulkInsertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseInfo, setParseInfo] = useState<{ totalRows: number; validRows: number } | null>(null);

  /**
   * Parse a single SQL row into CarData
   * Handles quoted strings and comma-separated values
   */
  const parseSQLRow = (rowData: string): CarData | null => {
    try {
      // Match quoted values (single quotes) or NULL values
      const valueRegex = /'(?:[^'\\]|\\.)*'|NULL/g;
      const matches = rowData.match(valueRegex);

      if (!matches || matches.length < 14) {
        return null; // Need at least basic fields
      }

      // Clean values - remove quotes and handle NULL
      const values = matches.map(v => {
        if (v === 'NULL' || v === "''") return '';
        return v.slice(1, -1).trim(); // Remove surrounding quotes
      });

      // Column indices based on the Teoalida schema
      const [
        sourceUrl,      // 0
        make,           // 1
        model,          // 2
        version,        // 3
        notes,          // 4
        imageUrl,       // 5
        price,          // 6
        onRoadPrice,    // 7
        keyPrice,       // 8
        keyMileage,     // 9
        keyEngine,      // 10
        keyTransmission,// 11
        keyFuelType,    // 12
        keySeating      // 13
      ] = values;

      // Use centralized validation to check if this entry should be skipped
      const skipCheck = shouldSkipCarEntry(make, model, notes);
      if (skipCheck.skip) {
        if (skipCheck.reason) {
          console.log(`Skipping SQL row - ${skipCheck.reason}`);
        }
        return null;
      }

      // Parse price (use Price or Key Price)
      const priceStr = price || keyPrice;
      const priceNum = parsePrice(priceStr);

      // Parse seating capacity
      const seatingStr = keySeating || values[43]; // Try key seating or full seating capacity
      const seatingMatch = seatingStr?.match(/(\d+)/);
      const seating = seatingMatch ? parseInt(seatingMatch[1]) : undefined;

      // Parse images - split by semicolon
      const images = imageUrl
        ? imageUrl.split(';')
            .map(url => url.trim())
            .filter(url => url && !url.includes('grey.gif') && url.startsWith('http'))
            .slice(0, 1) // Take first valid image
        : [];

      // Generate external_id
      const external_id = `${make}_${model}_${version}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      // Extract specifications from available fields
      const specifications: Record<string, any> = {};
      if (values[14]) specifications.engine = values[14]; // Engine
      if (values[15]) specifications.engine_type = values[15]; // Engine Type
      if (values[17]) specifications.max_power = values[17]; // Max Power
      if (values[19]) specifications.max_torque = values[19]; // Max Torque

      // Build car data object
      const carData: CarData = {
        external_id,
        brand: make,
        model: model,
        variant: version || undefined,
        price_min: priceNum,
        price_max: priceNum,
        fuel_type: keyFuelType || values[16], // Key Fuel Type or Fuel Type
        transmission: keyTransmission || values[28], // Key Transmission or Transmission
        engine_capacity: keyEngine || values[10],
        mileage: keyMileage || values[24],
        body_type: 'Sedan', // Default, could be enhanced with better detection
        seating_capacity: seating,
        images: images.length > 0 ? images : undefined,
        specifications,
        features: [], // Could be extracted from Yes/No fields if needed
        status: 'active',
        api_source: 'teoalida_import'
      };

      return carData;
    } catch (err) {
      console.error('Error parsing row:', err);
      return null;
    }
  };

  /**
   * Parse entire SQL dump and extract INSERT statements
   */
  const parseSQLDump = (sqlContent: string): CarData[] => {
    try {
      // Find the INSERT INTO statement - handle various formats
      // Pattern 1: INSERT INTO `table` (...) VALUES
      // Pattern 2: INSERT INTO table (...) VALUES
      // Check if content contains INSERT keyword at all
      if (!sqlContent.toUpperCase().includes('INSERT')) {
        throw new Error('No INSERT statement found. Please paste SQL dump containing INSERT INTO ... VALUES ...');
      }

      // Try to find INSERT INTO with VALUES
      const insertMatch = sqlContent.match(/INSERT\s+INTO\s+[`"]?[^`"(\s]+[`"]?\s*\([^)]+\)\s*VALUES\s+([\s\S]+)/i);

      if (!insertMatch) {
        // Provide more helpful error
        const hasInsert = sqlContent.match(/INSERT\s+INTO/i);
        const hasValues = sqlContent.toUpperCase().includes('VALUES');

        if (hasInsert && !hasValues) {
          throw new Error('Found INSERT INTO but no VALUES. Make sure to include the VALUES section of your SQL dump.');
        }

        throw new Error('Could not parse SQL dump format. Expected format: INSERT INTO table_name (...) VALUES (...), (...);');
      }

      const valuesSection = insertMatch[1];

      // Remove trailing semicolon and any comments
      const cleanedValues = valuesSection.replace(/;[\s\S]*$/, '').trim();

      const cars: CarData[] = [];
      let totalRows = 0;

      // Split by "),\n(" or "),(" to get individual rows
      // First, temporarily replace ),( with a unique delimiter
      let processedValues = cleanedValues;

      // Split rows - look for ),( pattern
      const rows = processedValues.split(/\),\s*\(/);

      // Clean up first and last rows
      if (rows.length > 0) {
        rows[0] = rows[0].replace(/^\(/, ''); // Remove leading (
        rows[rows.length - 1] = rows[rows.length - 1].replace(/\)$/, ''); // Remove trailing )
      }

      console.log(`Found ${rows.length} rows in SQL dump`);

      for (let i = 0; i < rows.length; i++) {
        totalRows++;
        const rowData = rows[i].trim();

        if (!rowData) continue;

        const carData = parseSQLRow(rowData);
        if (carData && carData.brand && carData.model) {
          cars.push(carData);
        }
      }

      setParseInfo({ totalRows, validRows: cars.length });
      return cars;
    } catch (err) {
      throw new Error(`Failed to parse SQL dump: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleImport = async () => {
    setError(null);
    setResult(null);
    setParseInfo(null);

    if (!sqlInput.trim()) {
      setError('Please paste your SQL dump');
      return;
    }

    setIsProcessing(true);

    try {
      // Parse SQL dump to extract car data
      console.log('Parsing SQL dump...');
      const cars = parseSQLDump(sqlInput);

      if (cars.length === 0) {
        setError('No valid car data found in SQL dump');
        setIsProcessing(false);
        return;
      }

      console.log(`Parsed ${cars.length} cars, importing...`);

      // Import cars using bulk insert with duplicate checking
      const importResult = await bulkInsertCars(cars);
      setResult(importResult);

      if (importResult.success && importResult.inserted_count > 0) {
        // Clear input on successful insert
        setSqlInput('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setSqlInput('');
    setError(null);
    setResult(null);
    setParseInfo(null);
  };

  const progressPercentage = result
    ? (result.total_processed > 0 ? ((result.inserted_count + result.skipped_count) / result.total_processed) * 100 : 0)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          SQL Dump Import
        </CardTitle>
        <CardDescription>
          Paste your SQL dump directly here. The system will automatically extract car data from INSERT statements and import with duplicate detection.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">SQL Dump (INSERT Statements)</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isProcessing}
            >
              Clear
            </Button>
          </div>
          <Textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            placeholder="Paste your SQL dump here (e.g., INSERT INTO table_name VALUES (...), (...);)"
            className="font-mono text-xs min-h-[400px]"
            disabled={isProcessing}
          />
          <p className="text-xs text-muted-foreground">
            Supports phpMyAdmin SQL dumps and standard INSERT statements. The parser will automatically extract brand, model, variant, price, and other car details.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Parse Info */}
        {parseInfo && !result && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Found {parseInfo.validRows} valid car entries out of {parseInfo.totalRows} total rows in SQL dump.
            </AlertDescription>
          </Alert>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={isProcessing || !sqlInput.trim()}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {parseInfo ? 'Importing to Database...' : 'Parsing SQL Dump...'}
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Parse & Import Cars
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Import Results</h3>
              <Badge variant={result.error_count > 0 ? 'destructive' : 'default'}>
                {result.success ? 'Completed' : 'Failed'}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {result.inserted_count + result.skipped_count} of {result.total_processed} processed
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{result.total_processed}</div>
                  <p className="text-xs text-muted-foreground">Total Processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{result.inserted_count}</div>
                  <p className="text-xs text-muted-foreground">Inserted</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">{result.skipped_count}</div>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{result.error_count}</div>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              {/* Inserted Cars */}
              {result.inserted_count > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Successfully Inserted ({result.inserted_count})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.details
                      .filter(d => d.action === 'INSERTED')
                      .slice(0, 10)
                      .map((detail, index) => (
                        <div key={index} className="text-sm p-2 bg-green-50 rounded border border-green-200">
                          <span className="font-medium">{detail.brand} {detail.model}</span>
                          {detail.variant && <span className="text-muted-foreground"> - {detail.variant}</span>}
                        </div>
                      ))}
                    {result.inserted_count > 10 && (
                      <p className="text-xs text-muted-foreground text-center">
                        ... and {result.inserted_count - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Skipped Cars */}
              {result.skipped_count > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Skipped (Already Exist) ({result.skipped_count})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {result.details
                      .filter(d => d.action === 'SKIPPED')
                      .slice(0, 5)
                      .map((detail, index) => (
                        <div key={index} className="text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
                          <span className="font-medium">{detail.brand} {detail.model}</span>
                          {detail.variant && <span className="text-muted-foreground"> - {detail.variant}</span>}
                        </div>
                      ))}
                    {result.skipped_count > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        ... and {result.skipped_count - 5} more duplicates
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.error_count > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Errors ({result.error_count})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {result.details
                      .filter(d => d.action === 'ERROR')
                      .map((detail, index) => (
                        <div key={index} className="text-sm p-2 bg-red-50 rounded border border-red-200">
                          <span className="font-medium">{detail.brand} {detail.model}</span>
                          {detail.variant && <span className="text-muted-foreground"> - {detail.variant}</span>}
                          <div className="text-xs text-red-600 mt-1">{detail.message}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help Section */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Supported Formats:</strong> phpMyAdmin SQL dumps, standard SQL INSERT statements.
            <br />
            <strong>Auto-extraction:</strong> Brand, Model, Variant, Price, Mileage, Engine, Transmission, Fuel Type, Seating, Images.
            <br />
            <strong>Duplicate Detection:</strong> Cars with same Brand + Model + Variant will be automatically skipped.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
