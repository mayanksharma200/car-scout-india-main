import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, XCircle, AlertCircle, Loader2, FileSpreadsheet } from 'lucide-react';
import { bulkInsertCars, CarData, BulkInsertResult, parsePrice } from '@/utils/bulkCarInsertion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';

export const CSVFileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BulkInsertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseInfo, setParseInfo] = useState<{ totalRows: number; validRows: number } | null>(null);

  /**
   * Parse CSV row to CarData
   * Columns from Teoalida Excel:
   * 0: Source URL (skip)
   * 1: Make
   * 2: Model
   * 3: Version
   * 4: Notes
   * 5: Image URL (skip - will use placeholder)
   * 6: Price
   * 7: On Road Price in Delhi
   * 8: Key Price
   * 9: Key Mileage (ARAI)
   * 10: Key Engine
   * 11: Key Transmission
   * 12: Key Fuel Type
   * 13: Key Seating Capacity
   * ... more columns
   */
  const parseCSVRow = (row: string[], index: number): CarData | null => {
    try {
      // Skip if not enough columns or empty row
      if (row.length < 14 || !row[1] || !row[2]) {
        return null;
      }

      const make = row[1]?.trim();
      const model = row[2]?.trim();
      const version = row[3]?.trim();
      const notes = row[4]?.trim();
      const price = row[6]?.trim() || row[8]?.trim(); // Price or Key Price
      const mileage = row[9]?.trim();
      const engine = row[10]?.trim();
      const transmission = row[11]?.trim();
      const fuelType = row[12]?.trim();
      const seating = row[13]?.trim();

      // Skip header rows, empty rows, or discontinued cars
      if (
        !make ||
        !model ||
        make === 'Make' ||
        make === '' ||
        notes === 'discontinued' ||
        make.includes('INDIA CAR DATABASE') ||
        make.includes('Compiled in Excel') ||
        make.includes('This is a SAMPLE')
      ) {
        return null;
      }

      // Generate unique identifier for duplicate detection
      // Use brand + model + variant (case-insensitive, trimmed)
      const uniqueKey = `${make}_${model}_${version}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      // Parse price
      const priceNum = parsePrice(price);

      // Parse seating capacity
      const seatingMatch = seating?.match(/(\d+)/);
      const seatingCapacity = seatingMatch ? parseInt(seatingMatch[1]) : undefined;

      // Build car data
      const carData: CarData = {
        external_id: uniqueKey,
        brand: make,
        model: model,
        variant: version || undefined,
        price_min: priceNum,
        price_max: priceNum,
        fuel_type: fuelType || undefined,
        transmission: transmission || undefined,
        engine_capacity: engine || undefined,
        mileage: mileage || undefined,
        body_type: 'Car', // Default
        seating_capacity: seatingCapacity,
        images: [], // Skip images as requested
        specifications: {
          engine: engine || undefined,
          transmission: transmission || undefined,
          fuel_type: fuelType || undefined,
          mileage: mileage || undefined
        },
        features: [],
        status: 'active',
        api_source: 'csv_import'
      };

      return carData;
    } catch (err) {
      console.error(`Error parsing row ${index}:`, err);
      return null;
    }
  };

  /**
   * Parse CSV file content
   */
  const parseCSVFile = (content: string): CarData[] => {
    try {
      // Split into lines
      const lines = content.split(/\r?\n/);

      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const cars: CarData[] = [];
      let totalRows = 0;

      // Process each line
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        totalRows++;

        // Parse CSV row - handle quoted values
        const row = parseCSVLine(line);

        const carData = parseCSVRow(row, i + 1);
        if (carData && carData.brand && carData.model) {
          cars.push(carData);
        }
      }

      setParseInfo({ totalRows, validRows: cars.length });
      return cars;
    } catch (err) {
      throw new Error(`Failed to parse CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  /**
   * Parse a CSV line with proper quote handling
   */
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current);

    return result;
  };

  /**
   * Parse Excel/XLSX file
   */
  const parseExcelFile = async (file: File): Promise<CarData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });

          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to array of arrays
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          console.log(`Excel file has ${rows.length} rows`);

          const cars: CarData[] = [];
          let totalRows = 0;

          // Process each row (skip header)
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            totalRows++;

            // Convert row to string array
            const rowStrings = row.map(cell => (cell === null || cell === undefined) ? '' : String(cell));

            const carData = parseCSVRow(rowStrings, i + 1);
            if (carData && carData.brand && carData.model) {
              cars.push(carData);
            }
          }

          setParseInfo({ totalRows, validRows: cars.length });
          resolve(cars);
        } catch (err) {
          reject(new Error(`Failed to parse Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'csv' && fileExtension !== 'txt' && fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        setError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setResult(null);
      setParseInfo(null);
    }
  };

  /**
   * Handle import
   */
  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setError(null);
    setResult(null);
    setParseInfo(null);
    setIsProcessing(true);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let cars: CarData[];

      // Check file type and parse accordingly
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel file
        console.log('Parsing Excel file...');
        cars = await parseExcelFile(file);
      } else {
        // Parse CSV file
        console.log('Parsing CSV file...');
        const content = await file.text();
        cars = parseCSVFile(content);
      }

      if (cars.length === 0) {
        setError('No valid car data found in file');
        setIsProcessing(false);
        return;
      }

      console.log(`Parsed ${cars.length} cars, importing...`);

      // Import cars with duplicate checking
      const importResult = await bulkInsertCars(cars);
      setResult(importResult);

      if (importResult.success && importResult.inserted_count > 0) {
        // Success - can clear file
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setResult(null);
    setParseInfo(null);
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const progressPercentage = result
    ? (result.total_processed > 0 ? ((result.inserted_count + result.skipped_count) / result.total_processed) * 100 : 0)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Excel / CSV File Import
        </CardTitle>
        <CardDescription>
          Upload an Excel (.xlsx) or CSV file with car data. The system will automatically detect duplicates and skip existing cars based on Brand + Model + Variant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Excel or CSV File</label>
          <div className="flex gap-2">
            <Input
              id="csv-file-input"
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="flex-1"
            />
            {file && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isProcessing}
              >
                Clear
              </Button>
            )}
          </div>
          {file && (
            <p className="text-sm text-green-600">
              ✓ Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            <strong>Supported formats:</strong> Excel (.xlsx, .xls) and CSV (.csv, .txt) files.
            <br />
            <strong>Expected columns:</strong> Make, Model, Version, Price, Mileage, Engine, Transmission, Fuel Type, Seating.
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
              Found <strong>{parseInfo.validRows}</strong> valid car entries out of <strong>{parseInfo.totalRows}</strong> total rows in file.
            </AlertDescription>
          </Alert>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={isProcessing || !file}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {parseInfo ? 'Importing to Database...' : 'Parsing File...'}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Cars
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
                  <p className="text-xs text-muted-foreground">Total</p>
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
                  <p className="text-xs text-muted-foreground">Duplicates</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{result.error_count}</div>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results - Collapsible */}
            {result.inserted_count > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Successfully Inserted ({result.inserted_count})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto bg-green-50 p-3 rounded">
                  {result.details
                    .filter(d => d.action === 'INSERTED')
                    .slice(0, 10)
                    .map((detail, index) => (
                      <div key={index} className="text-xs">
                        • {detail.brand} {detail.model} {detail.variant || ''}
                      </div>
                    ))}
                  {result.inserted_count > 10 && (
                    <p className="text-xs text-muted-foreground italic">
                      ... and {result.inserted_count - 10} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {result.skipped_count > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Skipped Duplicates ({result.skipped_count})
                </h4>
                <p className="text-xs text-muted-foreground">
                  {result.skipped_count} cars already exist in database (same Brand + Model + Variant)
                </p>
              </div>
            )}

            {result.error_count > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Errors ({result.error_count})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto bg-red-50 p-3 rounded">
                  {result.details
                    .filter(d => d.action === 'ERROR')
                    .map((detail, index) => (
                      <div key={index} className="text-xs">
                        • {detail.brand} {detail.model}: {detail.message}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs space-y-1">
            <p><strong>How to use:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click "Choose File" and select your Excel (.xlsx) or CSV file</li>
              <li>The file will be automatically parsed and validated</li>
              <li>Click "Import Cars" to insert cars into the database</li>
              <li>Duplicate cars (same Brand + Model + Variant) will be automatically skipped</li>
            </ol>
            <p className="mt-2"><strong>Supported formats:</strong> Excel (.xlsx, .xls), CSV (.csv, .txt)</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
