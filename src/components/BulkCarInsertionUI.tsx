import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { bulkInsertCars, CarData, BulkInsertResult } from '@/utils/bulkCarInsertion';
import { validateCarData } from '@/utils/carDataValidation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const BulkCarInsertionUI = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BulkInsertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Example data for users to reference
  const exampleJSON = `[
  {
    "brand": "BMW",
    "model": "3 Series",
    "variant": "330i Sport",
    "price_min": 4230000,
    "price_max": 4859555,
    "fuel_type": "Petrol",
    "transmission": "Automatic",
    "engine_capacity": "1998 cc",
    "mileage": "16.13 kmpl",
    "body_type": "Sedan",
    "seating_capacity": 5,
    "images": ["https://example.com/image1.jpg"],
    "specifications": {
      "engine": "1998 cc, 4 Cylinders",
      "max_power": "255 bhp @ 5000 rpm"
    },
    "features": ["ABS", "Airbags", "Climate Control"],
    "status": "active"
  }
]`;

  const validateJSON = (text: string): { valid: boolean; errors: string[]; data?: CarData[] } => {
    const errors: string[] = [];

    if (!text.trim()) {
      errors.push('Input is empty');
      return { valid: false, errors };
    }

    try {
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        errors.push('Input must be a JSON array');
        return { valid: false, errors };
      }

      if (parsed.length === 0) {
        errors.push('Array is empty');
        return { valid: false, errors };
      }

      // Validate each car object using centralized validation
      parsed.forEach((car, index) => {
        // Basic type checks
        if (car.price_min && typeof car.price_min !== 'number') {
          errors.push(`Car ${index + 1}: "price_min" must be a number`);
        }
        if (car.seating_capacity && typeof car.seating_capacity !== 'number') {
          errors.push(`Car ${index + 1}: "seating_capacity" must be a number`);
        }

        // Use centralized validation for brand/model/variant/prices
        const validation = validateCarData(car, index);
        errors.push(...validation.errors);
        // Note: warnings are not blocking, but could be displayed to user
      });

      return { valid: errors.length === 0, errors, data: parsed };
    } catch (e) {
      errors.push(`Invalid JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return { valid: false, errors };
    }
  };

  const handleImport = async () => {
    setError(null);
    setValidationErrors([]);
    setResult(null);

    // Validate input
    const validation = validateJSON(jsonInput);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (!validation.data) {
      setError('No data to import');
      return;
    }

    setIsProcessing(true);

    try {
      // Call bulk insert function
      const importResult = await bulkInsertCars(validation.data);
      setResult(importResult);

      if (importResult.success) {
        // Clear input on success
        if (importResult.inserted_count > 0) {
          setJsonInput('');
        }
      } else {
        setError('Bulk import failed. Check the details below.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearInput = () => {
    setJsonInput('');
    setError(null);
    setValidationErrors([]);
    setResult(null);
  };

  const handleLoadExample = () => {
    setJsonInput(exampleJSON);
    setError(null);
    setValidationErrors([]);
    setResult(null);
  };

  const progressPercentage = result
    ? (result.total_processed > 0 ? ((result.inserted_count + result.skipped_count) / result.total_processed) * 100 : 0)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Car Insertion
        </CardTitle>
        <CardDescription>
          Import multiple cars at once with automatic duplicate detection. Cars with the same brand, model, and variant will be skipped.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import Cars</TabsTrigger>
            <TabsTrigger value="help">Help & Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            {/* Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Car Data (JSON Array)</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadExample}
                    disabled={isProcessing}
                  >
                    Load Example
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearInput}
                    disabled={isProcessing}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your JSON array of cars here..."
                className="font-mono text-sm min-h-[300px]"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Enter a JSON array of car objects. Each car must have at least "brand" and "model" fields.
              </p>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Validation Errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* General Error */}
            {error && !validationErrors.length && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={isProcessing || !jsonInput.trim()}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
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
                          .map((detail, index) => (
                            <div key={index} className="text-sm p-2 bg-green-50 rounded border border-green-200">
                              <span className="font-medium">{detail.brand} {detail.model}</span>
                              {detail.variant && <span className="text-muted-foreground"> - {detail.variant}</span>}
                            </div>
                          ))}
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
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {result.details
                          .filter(d => d.action === 'SKIPPED')
                          .map((detail, index) => (
                            <div key={index} className="text-sm p-2 bg-yellow-50 rounded border border-yellow-200">
                              <span className="font-medium">{detail.brand} {detail.model}</span>
                              {detail.variant && <span className="text-muted-foreground"> - {detail.variant}</span>}
                              <div className="text-xs text-muted-foreground mt-1">{detail.message}</div>
                            </div>
                          ))}
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
                      <div className="space-y-2 max-h-48 overflow-y-auto">
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
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <div className="space-y-6">
              {/* JSON Format */}
              <div>
                <h3 className="font-semibold mb-2">JSON Format</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The input must be a JSON array of car objects. Each object can have the following fields:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">{exampleJSON}</pre>
                </div>
              </div>

              {/* Required Fields */}
              <div>
                <h3 className="font-semibold mb-2">Required Fields</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><code className="bg-muted px-1 rounded">brand</code> - Car manufacturer (string)</li>
                  <li><code className="bg-muted px-1 rounded">model</code> - Car model name (string)</li>
                </ul>
              </div>

              {/* Optional Fields */}
              <div>
                <h3 className="font-semibold mb-2">Optional Fields</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div><code className="bg-muted px-1 rounded">variant</code> - Variant name</div>
                  <div><code className="bg-muted px-1 rounded">price_min</code> - Minimum price (number)</div>
                  <div><code className="bg-muted px-1 rounded">price_max</code> - Maximum price (number)</div>
                  <div><code className="bg-muted px-1 rounded">fuel_type</code> - Fuel type</div>
                  <div><code className="bg-muted px-1 rounded">transmission</code> - Transmission type</div>
                  <div><code className="bg-muted px-1 rounded">engine_capacity</code> - Engine size</div>
                  <div><code className="bg-muted px-1 rounded">mileage</code> - Fuel efficiency</div>
                  <div><code className="bg-muted px-1 rounded">body_type</code> - Body type</div>
                  <div><code className="bg-muted px-1 rounded">seating_capacity</code> - Seats (number)</div>
                  <div><code className="bg-muted px-1 rounded">images</code> - Array of image URLs</div>
                  <div><code className="bg-muted px-1 rounded">specifications</code> - Object with specs</div>
                  <div><code className="bg-muted px-1 rounded">features</code> - Array of features</div>
                  <div><code className="bg-muted px-1 rounded">status</code> - active/draft</div>
                </div>
              </div>

              {/* Duplicate Detection */}
              <div>
                <h3 className="font-semibold mb-2">Duplicate Detection</h3>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Cars are considered duplicates if they have the same <strong>brand</strong>, <strong>model</strong>, and <strong>variant</strong> (case-insensitive).
                    Duplicate cars will be automatically skipped and not inserted.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Tips */}
              <div>
                <h3 className="font-semibold mb-2">Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Test with a small batch first (2-3 cars)</li>
                  <li>Validate your JSON using an online validator if needed</li>
                  <li>Import in batches of 50-100 cars for best performance</li>
                  <li>Price values should be in rupees (e.g., 1500000 for ₹15 Lakh)</li>
                  <li>Seating capacity should be a number, not string</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
