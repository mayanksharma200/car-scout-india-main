import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, XCircle, AlertCircle, Loader2, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';
import { bulkInsertCarsWithTracking, CarData, BulkInsertResult, parsePrice } from '@/utils/bulkCarInsertion';
import { shouldSkipCarEntry, INVALID_CAR_NAMES } from '@/utils/carDataValidation';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export const CSVFileUploader = () => {
  const { getAuthHeaders } = useAdminAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BulkInsertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseInfo, setParseInfo] = useState<{ totalRows: number; validRows: number } | null>(null);
  const [rawJsonData, setRawJsonData] = useState<any[] | null>(null);

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
      if (row.length < 2) {
        return null;
      }

      let sourceUrl = row[0]?.trim();
      let make = row[1]?.trim();
      let model = row[2]?.trim();
      let version = row[3]?.trim();
      let notes = row[4]?.trim();
      let columnOffset = 0; // Track if columns are shifted

      // Check if the URL is in column 0 (expected position)
      if (sourceUrl && sourceUrl.includes('carwale.com')) {
        const urlMatch = sourceUrl.match(/carwale\.com\/([^-]+)-cars\/([^\/]+)\/([^\/]+)/);
        if (urlMatch) {
          // URL is in the correct position, use it to extract data
          make = urlMatch[1].charAt(0).toUpperCase() + urlMatch[1].slice(1);
          model = urlMatch[2].replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          version = urlMatch[3].replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          columnOffset = 0; // No offset needed
          console.log(`Row ${index}: Extracted from URL (col 0) - Brand: ${make}, Model: ${model}, Variant: ${version}`);
        }
      }
      // Check if columns are shifted and URL is in the brand column
      else if (make && make.includes('carwale.com')) {
        sourceUrl = make;
        columnOffset = 1; // Columns are shifted by 1
        // Extract brand and model from CarWale URL pattern:
        // https://www.carwale.com/{brand}-cars/{model}/{variant}/
        const urlMatch = sourceUrl.match(/carwale\.com\/([^-]+)-cars\/([^\/]+)\/([^\/]+)/);
        if (urlMatch) {
          make = urlMatch[1].charAt(0).toUpperCase() + urlMatch[1].slice(1); // Capitalize brand
          model = urlMatch[2].replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          version = urlMatch[3].replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          console.log(`Row ${index}: Extracted from URL (col 1) - Brand: ${make}, Model: ${model}, Variant: ${version}`);
        } else {
          console.log(`Row ${index}: Skipping - Could not parse CarWale URL`);
          return null;
        }
      } else if (model && model.includes('carwale.com')) {
        sourceUrl = model;
        columnOffset = 2; // Columns are shifted by 2
        const urlMatch = sourceUrl.match(/carwale\.com\/([^-]+)-cars\/([^\/]+)\/([^\/]+)/);
        if (urlMatch) {
          make = urlMatch[1].charAt(0).toUpperCase() + urlMatch[1].slice(1);
          model = urlMatch[2].replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          version = urlMatch[3].replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          console.log(`Row ${index}: Extracted from URL (col 2) - Brand: ${make}, Model: ${model}, Variant: ${version}`);
        } else {
          console.log(`Row ${index}: Skipping - Could not parse CarWale URL`);
          return null;
        }
      }

      // If we still don't have make or model from URL parsing, use direct column values
      if (!make || !model) {
        // Try reading brand/model directly from columns (for non-URL data)
        make = row[2]?.trim(); // Column C (index 2): Make
        model = row[3]?.trim(); // Column D (index 3): Model
        version = row[4]?.trim(); // Column E (index 4): Version
        columnOffset = 0; // No offset when reading directly

        if (!make || !model) {
          console.log(`Row ${index}: Skipping - No brand/model found`);
          return null;
        }
        console.log(`Row ${index}: Using direct columns - Brand: ${make}, Model: ${model}, Variant: ${version}`);
      }

      // Adjust column indices based on offset
      // CORRECTED Excel structure from actual data:
      // Column 7 (index 7): Image URL
      // Column 8 (index 8): PRICE (base price "₹ 50.88 Lakh") ← THIS IS EXACT_PRICE
      // Column 9 (index 9): On-road price Delhi
      // Column 10 (index 10): PRICE (key_price - alternative display price)
      // Column 11 (index 11): MILEAGE (ARAI)
      // Column 12 (index 12): ENGINE
      // Column 13 (index 13): TRANSMISSION
      // Column 14 (index 14): FUEL TYPE
      // Column 15 (index 15): SEATING
      // Log columnOffset for debugging
      if (index <= 5) {
        console.log(`Row ${index}: columnOffset = ${columnOffset}`);
      }

      const exactPrice = row[8]?.trim(); // Column 8: Base "Price" from Excel (NO offset)
      const onRoadPriceDelhi = row[9]?.trim(); // Column 9: On-road Delhi (NO offset)
      const price = exactPrice || row[10]?.trim(); // Fallback to Column 10 (NO offset)
      const mileage = row[11]?.trim();      // Column 11: Mileage (ARAI) (NO offset)
      const engine = row[12]?.trim();       // Column 12: Engine (NO offset)
      const transmission = row[13]?.trim(); // Column 13: Transmission (NO offset)
      const fuelType = row[14]?.trim();     // Column 14: Fuel Type (NO offset)
      const seating = row[15]?.trim();      // Column 15: Seating (NO offset)

      // Debug logging - Show RAW column values
      if (index <= 5) {
        console.log(`\n📊 Row ${index} RAW COLUMNS (first 20):`, {
          'Col 0': row[0],
          'Col 1': row[1],
          'Col 2': row[2],
          'Col 3': row[3],
          'Col 4': row[4],
          'Col 5': row[5],
          'Col 6': row[6],
          'Col 7': row[7],
          'Col 8': row[8],
          'Col 9': row[9],
          'Col 10': row[10],
          'Col 11': row[11],
          'Col 12': row[12],
          'Col 13': row[13],
          'Col 14': row[14],
          'Col 15': row[15],
          'Col 16': row[16],
          'Col 17': row[17],
          'Col 18': row[18],
          'Col 19': row[19],
          columnOffset
        });
        console.log(`📦 Row ${index} FINAL Variables:`, {
          brand: make,
          model,
          variant: version,
          exactPrice: exactPrice,
          exactPriceCol: 9 + columnOffset,
          onRoadPriceDelhi: onRoadPriceDelhi,
          onRoadCol: 10 + columnOffset,
          mileage: mileage,
          mileageCol: 12 + columnOffset,
          engine: engine,
          engineCol: 13 + columnOffset,
          transmission: transmission,
          transmissionCol: 14 + columnOffset,
          fuelType: fuelType,
          fuelTypeCol: 15 + columnOffset
        });
      }

      // Use centralized validation to check if this entry should be skipped
      // Skip URL checking since we're extracting from URLs
      const skipCheck = {
        skip: false,
        reason: undefined
      };

      // Only check for invalid names, not URLs
      if (INVALID_CAR_NAMES.includes(make) || INVALID_CAR_NAMES.includes(model)) {
        console.log(`Row ${index}: Skipping - Invalid brand or model name`);
        return null;
      }

      if (notes?.toLowerCase().includes('discontinued')) {
        console.log(`Row ${index}: Skipping - Car is discontinued`);
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

      // Build specifications object with ALL available data from the row
      const specifications: Record<string, any> = {
        engine: engine || undefined,
        transmission: transmission || undefined,
        fuel_type: fuelType || undefined,
        mileage: mileage || undefined
      };

      // Add all other column data to specifications
      // This captures ALL the data from the Excel file
      if (row.length > 14) {
        // Store all additional columns in specifications
        for (let i = 0; i < row.length; i++) {
          const value = row[i]?.trim();
          if (value && value !== '' && i !== 1 && i !== 2 && i !== 3) {
            // Skip brand, model, variant columns
            specifications[`column_${i}`] = value;
          }
        }
      }

      // Build car data
      const carData: CarData = {
        external_id: uniqueKey,
        brand: make,
        model: model,
        variant: version || undefined,
        price_min: priceNum,
        price_max: priceNum,
        exact_price: exactPrice || undefined,      // Column 6: Base "Price" from Excel
        fuel_type: fuelType || undefined,         // Row 12: Fuel Type (Petrol/Diesel/CNG)
        transmission: transmission || undefined,   // Row 11: Transmission (Manual/Automatic)
        engine_capacity: engine || undefined,      // Row 10: Engine (1199 cc, 1497 cc)
        mileage: mileage || undefined,             // Row 9: Mileage (18.2 kmpl, 22 kmpl)
        body_type: 'Car',
        seating_capacity: seatingCapacity,
        images: [],
        specifications: specifications,
        features: [],
        status: 'active',
        api_source: 'csv_import'
      };

      // DETAILED DEBUG LOGGING - Log what we're about to send to database
      if (index <= 5) {
        console.log(`\n🔍 Row ${index} - FINAL carData object being sent to DB:`, {
          brand: carData.brand,
          model: carData.model,
          variant: carData.variant,
          'exact_price (should be "₹ XX.XX Lakh")': carData.exact_price,
          'fuel_type (should be Petrol/Diesel)': carData.fuel_type,
          'transmission (should be Manual/Automatic)': carData.transmission,
          'engine_capacity (should be 1199 cc)': carData.engine_capacity,
          'mileage (should be 18.2 kmpl)': carData.mileage,
          'price_min (should be number)': carData.price_min
        });
      }

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

      // Parse all rows first
      const parsedLines = lines.map(line => line.trim()).filter(line => line).map(line => parseCSVLine(line));

      // Store raw JSON data with proper column structure
      if (parsedLines.length > 0) {
        const headers = parsedLines[0];
        const formattedData = parsedLines.slice(1).map((row) => {
          const rowObj: any = {};
          headers.forEach((header, index) => {
            const headerName = header || `Column_${index}`;
            rowObj[headerName] = row[index];
          });
          return rowObj;
        });
        setRawJsonData(formattedData);
      }

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
   * Parse Excel/XLSX file (legacy - kept for CSV parsing)
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

          // Convert to JSON with headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Store raw JSON data with proper column structure
          if (jsonData.length > 0) {
            const headers = jsonData[0] as any[];
            const formattedData = jsonData.slice(1).map((row: any) => {
              const rowObj: any = {};
              headers.forEach((header, index) => {
                const headerName = header || `Column_${index}`;
                rowObj[headerName] = row[index];
              });
              return rowObj;
            });
            setRawJsonData(formattedData);
          }

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
   * Parse file immediately to extract raw JSON data
   */
  const parseFileForJSON = async (file: File) => {
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel file for JSON
        return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (e) => {
            try {
              const data = e.target?.result;
              // Read workbook with raw values to preserve everything
              const workbook = XLSX.read(data, {
                type: 'array',
                raw: true,
                cellDates: false,
                cellNF: false,
                cellStyles: false
              });

              // Get first sheet
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];

              // Get the range of the worksheet to ensure we capture ALL columns
              const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
              console.log('Excel file range:', range);
              console.log('Total columns:', range.e.c + 1);
              console.log('Total rows:', range.e.r + 1);

              // Convert to array of arrays with defval to preserve empty cells
              const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: null,  // Use null for empty cells instead of undefined
                raw: true,
                blankrows: true  // Include blank rows
              });

              console.log('Parsed rows:', rawData.length);
              console.log('First row (headers):', rawData[0]);

              // Store raw JSON data with proper column structure
              if (rawData.length > 0 && rawData[0]) {
                // First row is headers
                const headers = rawData[0].map((header: any, index: number) => {
                  // If header is empty or null, generate a column name
                  if (header === null || header === undefined || header === '') {
                    return `Column_${index}`;
                  }
                  return String(header);
                });

                console.log('Headers:', headers);
                console.log('Number of columns detected:', headers.length);

                // Map all subsequent rows to objects
                const formattedData = rawData.slice(1).map((row: any[]) => {
                  const rowObj: any = {};

                  // Ensure we iterate through ALL columns from headers
                  headers.forEach((headerName: string, colIndex: number) => {
                    // Get value from row, use null if undefined
                    const cellValue = row[colIndex] !== undefined ? row[colIndex] : null;
                    rowObj[headerName] = cellValue;
                  });

                  return rowObj;
                });

                console.log('Formatted data rows:', formattedData.length);
                console.log('Sample first row:', formattedData[0]);

                setRawJsonData(formattedData);
                resolve(formattedData);
              } else {
                resolve([]);
              }
            } catch (err) {
              console.error('Error parsing Excel:', err);
              reject(err);
            }
          };

          reader.onerror = () => {
            reject(new Error('Failed to read file'));
          };

          reader.readAsArrayBuffer(file);
        });
      } else {
        // Parse CSV file for JSON
        const content = await file.text();
        const lines = content.split(/\r?\n/);
        const parsedLines = lines.map(line => line.trim()).filter(line => line).map(line => parseCSVLine(line));

        console.log('CSV parsed lines:', parsedLines.length);

        // Store raw JSON data with proper column structure
        if (parsedLines.length > 0) {
          const headers = parsedLines[0].map((header: string, index: number) => {
            if (!header || header.trim() === '') {
              return `Column_${index}`;
            }
            return header;
          });

          console.log('CSV Headers:', headers);
          console.log('Number of columns detected:', headers.length);

          const formattedData = parsedLines.slice(1).map((row) => {
            const rowObj: any = {};
            headers.forEach((headerName: string, index: number) => {
              rowObj[headerName] = row[index] !== undefined ? row[index] : null;
            });
            return rowObj;
          });

          console.log('CSV Formatted data rows:', formattedData.length);
          setRawJsonData(formattedData);
          return formattedData;
        }
        return [];
      }
    } catch (err) {
      console.error('Error parsing file for JSON:', err);
      setError('Failed to parse file for JSON export');
      return [];
    }
  };

  /**
   * Handle file selection
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Immediately parse file for JSON download
      await parseFileForJSON(selectedFile);
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
        // Parse Excel file with ALL column data
        console.log('Parsing Excel file with ALL columns...');
        cars = await parseExcelFileWithAllData(file);
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

      console.log(`Parsed ${cars.length} cars, importing with update tracking...`);

      // Get current session token from AdminAuthContext
      const authHeaders = getAuthHeaders();
      const token = authHeaders['Authorization']?.replace('Bearer ', '');

      if (!token) {
        throw new Error("Authentication required. Please reload the page and log in again.");
      }

      // Import cars with duplicate checking and update tracking
      const importResult = await bulkInsertCarsWithTracking(cars, token);
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

  /**
   * Parse Excel file with ALL column data for import
   */
  const parseExcelFileWithAllData = async (file: File): Promise<CarData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array', raw: true });

          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to array of arrays
          const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: true,
            blankrows: true
          });

          console.log('Excel file has', rawData.length, 'rows');

          // Get column headers from row 2 (third row has the actual column names like Mumbai, Delhi, etc.)
          const headers = rawData[2] || [];

          console.log('📊 Total rows in Excel:', rawData.length);
          console.log('📊 Row 0 - First 10 columns:', rawData[0]?.slice(0, 10));
          console.log('📊 Row 0 - Columns 231-240:', rawData[0]?.slice(231, 241));
          console.log('📊 Row 1 - First 10 columns:', headers.slice(0, 10));
          console.log('📊 Row 1 - Columns 231-240:', headers.slice(231, 241));
          console.log('📊 Row 2 - First 10 columns:', rawData[2]?.slice(0, 10));
          console.log('📊 Row 2 - Columns 231-240:', rawData[2]?.slice(231, 241));
          console.log('📊 Row 3 - Columns 231-240:', rawData[3]?.slice(231, 241));
          console.log('📊 Row 4 - Columns 231-240:', rawData[4]?.slice(231, 241));
          console.log('📊 Row 5 - Columns 231-240:', rawData[5]?.slice(231, 241));

          const cars: CarData[] = [];
          let totalRows = 0;

          // Process actual car data rows (skip first 6 rows: headers + metadata)
          for (let i = 6; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            totalRows++;

            // Convert row to string array
            const rowStrings = row.map(cell => (cell === null || cell === undefined) ? '' : String(cell));

            // DEBUG: Log first few rows and row 15 to see structure
            if (i <= 10 || i === 15) {
              console.log(`📍 Row ${i}: Brand="${rowStrings[2]}" Model="${rowStrings[3]}" Variant="${rowStrings[4]}" Mumbai(231)="${row[231]}" Delhi(233)="${row[233]}" rowLength=${row.length}`);
            }

            // Parse basic car data
            const carData = parseCSVRow(rowStrings, i + 1);

            if (carData && carData.brand && carData.model) {
              // Add ALL column data to specifications with proper column names
              const allColumnData: Record<string, any> = {};

              for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const columnName = headers[colIndex];
                const cellValue = row[colIndex];

                if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
                  // Use actual column name if available, otherwise use Column_X
                  const keyName = columnName && String(columnName).trim() !== ''
                    ? String(columnName).trim()
                    : `Column_${colIndex}`;

                  allColumnData[keyName] = cellValue;
                }
              }

              // Enhanced debug logging for first car
              if (i === 6) {
                console.log('🚗 First car data (Row 6):');
                console.log('  Brand:', carData.brand);
                console.log('  Model:', carData.model);
                console.log('  Variant:', carData.variant);
                console.log('  Raw row length:', row.length);
                console.log('  Headers length:', headers.length);
              }

              // Merge all column data into specifications
              carData.specifications = {
                ...carData.specifications,
                ...allColumnData
              };

              // DEBUG: Log headers and data for city price columns
              if (i === 6) { // Only log for first data row
                console.log('\n🔍 DEBUG: Detailed column analysis for columns 231-240:');
                for (let idx = 231; idx <= 240; idx++) {
                  const header = headers[idx];
                  const value = row[idx];
                  const headerStr = header !== null && header !== undefined ? String(header) : 'undefined';
                  const valueStr = value !== null && value !== undefined ? String(value) : 'undefined';
                  console.log(`  [${idx}] header="${headerStr}" | value="${valueStr}"`);
                }

                console.log('\n🔍 DEBUG: Keys in allColumnData (showing all keys):');
                const allKeys = Object.keys(allColumnData);
                console.log('  Total keys:', allKeys.length);
                console.log('  First 20 keys:', allKeys.slice(0, 20));
                console.log('  Last 20 keys:', allKeys.slice(-20));

                // Check if city names exist as keys
                const cityKeys = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];
                console.log('\n🔍 DEBUG: Looking for city name keys in allColumnData:');
                cityKeys.forEach(city => {
                  console.log(`  "${city}": ${allColumnData[city] !== undefined ? `"${allColumnData[city]}"` : 'NOT FOUND'}`);
                });

                // Check Column_XXX format
                console.log('\n🔍 DEBUG: Looking for Column_XXX keys:');
                [231, 232, 233, 234, 236, 237, 238, 239].forEach(idx => {
                  const key = `Column_${idx}`;
                  console.log(`  "${key}": ${allColumnData[key] !== undefined ? `"${allColumnData[key]}"` : 'NOT FOUND'}`);
                });
              }

              // Helper function to safely get value and filter out "None" and "null"
              const getValue = (value: any): string | undefined => {
                if (value === null || value === undefined || value === '' || value === 'None' || value === 'null') {
                  return undefined;
                }
                return String(value);
              };

              // ALSO extract important fields to dedicated columns (data exists in BOTH places)
              // City prices - try header name first, then column index, then Column_X format
              const mumbaiPrice = getValue(allColumnData['Mumbai']) || getValue(allColumnData['Column_231']) || getValue(row[231]);
              const bangalorePrice = getValue(allColumnData['Bangalore']) || getValue(allColumnData['Column_232']) || getValue(row[232]);
              const delhiPrice = getValue(allColumnData['Delhi']) || getValue(allColumnData['Column_233']) || getValue(row[233]);
              const punePrice = getValue(allColumnData['Pune']) || getValue(allColumnData['Column_234']) || getValue(row[234]);
              const hyderabadPrice = getValue(allColumnData['Hyderabad']) || getValue(allColumnData['Column_236']) || getValue(row[236]);
              const chennaiPrice = getValue(allColumnData['Chennai']) || getValue(allColumnData['Column_238']) || getValue(row[238]);
              const kolkataPrice = getValue(allColumnData['Kolkata']) || getValue(allColumnData['Column_239']) || getValue(row[239]);
              const ahmedabadPrice = getValue(allColumnData['Ahmedabad']) || getValue(allColumnData['Column_237']) || getValue(row[237]);

              // Colors
              const colors = getValue(allColumnData['Color Name']) || getValue(allColumnData['Colors']) || getValue(allColumnData['Column_223']) || getValue(row[223]);
              const colorCodes = getValue(allColumnData['Color RGB']) || getValue(allColumnData['Column_224']) || getValue(row[224]);

              // Warranty
              const warrantyYears = getValue(allColumnData['Warranty (Years)']) || getValue(allColumnData['Column_219']) || getValue(row[219]);
              const warrantyKm = getValue(allColumnData['Warranty (Kilometres)']) || getValue(allColumnData['Column_220']) || getValue(row[220]);
              const batteryWarrantyYears = getValue(allColumnData['Battery Warranty (Years)']) || getValue(allColumnData['Column_221']) || getValue(row[221]);
              const batteryWarrantyKm = getValue(allColumnData['Battery Warranty (Kilometres)']) || getValue(allColumnData['Column_222']) || getValue(row[222]);

              // Price values - Column J (index 9) from Excel
              const exactPrice = getValue(allColumnData['Price']) || getValue(allColumnData['Column_9']) || getValue(row[9]);

              // Price breakdown
              const exShowroomPrice = getValue(allColumnData['Ex-Showroom price']) || getValue(allColumnData['Column_225']) || getValue(row[225]);
              const rtoCharges = getValue(allColumnData['RTO']) || getValue(allColumnData['Column_226']) || getValue(row[226]);
              const insuranceCost = getValue(allColumnData['Insurance']) || getValue(allColumnData['Column_227']) || getValue(row[227]);

              // Safety
              const airbags = getValue(allColumnData['Airbags']) || getValue(allColumnData['Column_74']) || getValue(row[74]);
              const ncapRating = getValue(allColumnData['NCAP Rating']) || getValue(allColumnData['Column_69']) || getValue(row[69]);
              const abs = getValue(allColumnData['ABS']) || getValue(allColumnData['Anti-lock Braking System (ABS)']) || getValue(allColumnData['Column_71']) || getValue(row[71]);
              const esc = getValue(allColumnData['ESC']) || getValue(allColumnData['Electronic Stability Control (ESC)']) || getValue(allColumnData['Column_72']) || getValue(row[72]);

              // Comfort
              const sunroof = getValue(allColumnData['Sunroof / Moonroof']) || getValue(allColumnData['Sunroof']) || getValue(allColumnData['Column_162']) || getValue(row[162]);
              const acType = getValue(allColumnData['Air Conditioner']) || getValue(allColumnData['Column_95']) || getValue(row[95]);
              const cruiseControl = getValue(allColumnData['Cruise Control']) || getValue(allColumnData['Column_102']) || getValue(row[102]);

              // Engine details
              const engineType = getValue(allColumnData['Engine Type']) || getValue(allColumnData['Column_17']) || getValue(row[17]);
              const maxPower = getValue(allColumnData['Max Power']) || getValue(allColumnData['Power']) || getValue(allColumnData['Column_21']) || getValue(row[21]);
              const maxTorque = getValue(allColumnData['Max Torque']) || getValue(allColumnData['Torque']) || getValue(allColumnData['Column_22']) || getValue(row[22]);
              const topSpeed = getValue(allColumnData['Top Speed']) || getValue(allColumnData['Column_18']) || getValue(row[18]);
              const acceleration = getValue(allColumnData['Acceleration (0-100 kmph)']) || getValue(allColumnData['Column_19']) || getValue(row[19]);

              // Dimensions
              const lengthMm = getValue(allColumnData['Length']) || getValue(allColumnData['Column_40']) || getValue(row[40]);
              const widthMm = getValue(allColumnData['Width']) || getValue(allColumnData['Column_41']) || getValue(row[41]);
              const heightMm = getValue(allColumnData['Height']) || getValue(allColumnData['Column_42']) || getValue(row[42]);
              const wheelbaseMm = getValue(allColumnData['Wheelbase']) || getValue(allColumnData['Column_43']) || getValue(row[43]);
              const groundClearanceMm = getValue(allColumnData['Ground Clearance']) || getValue(allColumnData['Column_44']) || getValue(row[44]);
              const bootspaceLitres = getValue(allColumnData['Bootspace']) || getValue(allColumnData['Column_49']) || getValue(row[49]);

              // Description
              const description = getValue(allColumnData['Description']) || getValue(allColumnData['Column_240']) || getValue(row[240]);

              // DEBUG: Log extracted values for rows 128-140 (Tata Nexon range)
              if (i >= 128 && i <= 140) {
                console.log(`\n🔍 DEBUG Row ${i} (${carData.brand} ${carData.model} ${carData.variant}):`);
                console.log('  row[231] raw value:', row[231], 'type:', typeof row[231]);
                console.log('  row[233] raw value:', row[233], 'type:', typeof row[233]);
                console.log('  row[223] raw value (colors):', row[223], 'type:', typeof row[223]);
                console.log('  allColumnData has Mumbai?:', 'Mumbai' in allColumnData);
                console.log('  allColumnData["Mumbai"]:', allColumnData['Mumbai']);
                console.log('  getValue(row[231]):', getValue(row[231]));
                console.log('  Final mumbaiPrice:', mumbaiPrice);
                console.log('  Final delhiPrice:', delhiPrice);
                console.log('  Final colors:', colors);
              }

              // Add extracted fields to carData (they will be in BOTH dedicated columns AND specifications)
              Object.assign(carData, {
                exact_price: exactPrice,
                mumbai_price: mumbaiPrice,
                bangalore_price: bangalorePrice,
                delhi_price: delhiPrice,
                pune_price: punePrice,
                hyderabad_price: hyderabadPrice,
                chennai_price: chennaiPrice,
                kolkata_price: kolkataPrice,
                ahmedabad_price: ahmedabadPrice,
                colors: colors,
                color_codes: colorCodes,
                warranty_years: warrantyYears ? parseInt(String(warrantyYears)) : undefined,
                warranty_km: warrantyKm ? parseInt(String(warrantyKm)) : undefined,
                battery_warranty_years: batteryWarrantyYears ? parseInt(String(batteryWarrantyYears)) : undefined,
                battery_warranty_km: batteryWarrantyKm ? parseInt(String(batteryWarrantyKm)) : undefined,
                ex_showroom_price: exShowroomPrice,
                rto_charges: rtoCharges,
                insurance_cost: insuranceCost,
                airbags: airbags,
                ncap_rating: ncapRating,
                abs: abs === 'Yes' ? true : abs === 'No' ? false : undefined,
                esc: esc === 'Yes' ? true : esc === 'No' ? false : undefined,
                sunroof: sunroof,
                ac_type: acType,
                cruise_control: cruiseControl === 'Yes' ? true : cruiseControl === 'No' ? false : undefined,
                engine_type: engineType,
                max_power: maxPower,
                max_torque: maxTorque,
                top_speed: topSpeed,
                acceleration: acceleration,
                length_mm: lengthMm,
                width_mm: widthMm,
                height_mm: heightMm,
                wheelbase_mm: wheelbaseMm,
                ground_clearance_mm: groundClearanceMm,
                bootspace_litres: bootspaceLitres,
                description: description
              });

              cars.push(carData);
            }
          }

          setParseInfo({ totalRows, validRows: cars.length });
          console.log(`Parsed ${cars.length} cars with ALL column data`);
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
   * Download JSON data from the uploaded file
   */
  const handleDownloadJSON = () => {
    if (!rawJsonData || rawJsonData.length === 0) {
      setError('No data available to download');
      return;
    }

    try {
      // Create a blob from the JSON data
      const jsonString = JSON.stringify(rawJsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file?.name.replace(/\.[^/.]+$/, '')}_data.json` || 'excel_data.json';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download JSON data');
      console.error('Download error:', err);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setResult(null);
    setParseInfo(null);
    setRawJsonData(null);
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
          Excel / CSV File Import with Smart Update
        </CardTitle>
        <CardDescription>
          Upload an Excel (.xlsx) or CSV file with car data. The system will automatically detect duplicates based on Brand + Model + Variant.
          If a car exists but has changed fields (price, specifications, etc.), it will UPDATE the record and show you what changed.
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
            <div className="space-y-1">
              <p className="text-sm text-green-600">
                ✓ Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
              {rawJsonData && rawJsonData.length > 0 && (
                <p className="text-sm text-blue-600 font-medium">
                  ✓ Ready for JSON download: {rawJsonData.length} rows parsed
                </p>
              )}
            </div>
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
              {rawJsonData && rawJsonData.length > 0 && (
                <>
                  <br />
                  <span className="text-green-600 font-medium">
                    ✓ JSON data is ready to download ({rawJsonData.length} rows)
                  </span>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          <Button
            onClick={handleDownloadJSON}
            disabled={!rawJsonData || rawJsonData.length === 0}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
        </div>

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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <div className="text-2xl font-bold text-blue-600">{result.updated_count || 0}</div>
                  <p className="text-xs text-muted-foreground">Updated</p>
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

            {result.updated_count && result.updated_count > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  Successfully Updated ({result.updated_count})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto bg-blue-50 p-3 rounded">
                  {result.details
                    .filter(d => d.action === 'UPDATED')
                    .map((detail, index) => (
                      <div key={index} className="border-b border-blue-200 pb-2 last:border-b-0">
                        <div className="text-sm font-semibold text-blue-900">
                          {detail.brand} {detail.model} {detail.variant || ''}
                        </div>
                        {detail.changed_fields && detail.changed_fields.length > 0 && (
                          <div className="mt-1 ml-4 space-y-1">
                            {detail.changed_fields.map((change, idx) => (
                              <div key={idx} className="text-xs text-blue-800">
                                <span className="font-medium">{change.field}:</span>{' '}
                                <span className="line-through text-red-600">{change.old_value}</span>{' '}
                                → <span className="text-green-600 font-medium">{change.new_value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
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

            {result.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Import Failed:</strong> {typeof result.error === 'string' ? result.error : JSON.stringify(result.error)}
                </AlertDescription>
              </Alert>
            )}

            {result.error_count > 0 && result.details.length > 0 && (
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
              <li>Click "Download JSON" to download the raw data in JSON format</li>
              <li>Click "Import Cars" to insert or update cars in the database</li>
              <li>The system will automatically detect duplicates based on Brand + Model + Variant</li>
              <li>If a car exists but has changed fields, it will be UPDATED (not skipped)</li>
              <li>After import, you'll see a detailed report of what was inserted, updated, or skipped</li>
            </ol>
            <p className="mt-2"><strong>Supported formats:</strong> Excel (.xlsx, .xls), CSV (.csv, .txt)</p>
            <p className="mt-2"><strong>Smart Update Feature:</strong> When a car exists in the database, the system compares all fields (price, fuel type, transmission, city prices, specifications, etc.). If any field has changed, the car is updated and you'll see exactly which fields were modified.</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
