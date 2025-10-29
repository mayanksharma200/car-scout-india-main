/**
 * Parse SQL Dump to JSON
 *
 * This script parses the Teoalida SQL dump and converts it to JSON format
 * for bulk car insertion
 */

import { writeFileSync } from 'fs';
import { convertSQLRowToCarData, parsePrice } from '../src/utils/bulkCarInsertion';

// Sample SQL data - replace with your actual data
const sqlDumpData = `
INSERT INTO \`india_car_database_by_teoalida_full_specs_sample\` VALUES
('https://www.carwale.com/bmw-cars/3-series/330isport/', 'BMW', '3 Series', '330i Sport', '', 'https://imgd.aeplcdn.com/664x374/cw/ec/37067/BMW-3-Series-Exterior-167583.jpg', '₹ 42.30 Lakh', '₹ 48,59,555', '₹ 42.30 Lakh', '16.13 kmpl', '1998 cc', 'Automatic (Torque Converter)', 'Petrol', '5 Seater'),
('https://www.carwale.com/bmw-cars/3-series/320dsport/', 'BMW', '3 Series', '320d Sport', '', 'https://imgd.aeplcdn.com/664x374/cw/ec/37067/BMW-3-Series-Exterior-167583.jpg', '₹ 42.80 Lakh', '₹ 50,23,930', '₹ 42.80 Lakh', '20.37 kmpl', '1995 cc', 'Automatic (Torque Converter)', 'Diesel', '5 Seater');
`;

/**
 * Parse a single SQL row into CarData
 */
function parseSQLRow(rowData: string) {
  // Remove parentheses and split by commas (handling quoted strings)
  const values = rowData.match(/(?:[^,']+|'[^']*')+/g) || [];

  // Clean each value (remove quotes)
  const cleanValues = values.map(v => v.trim().replace(/^'|'$/g, ''));

  // Map to car data structure based on column order
  // Column indices from the SQL schema:
  // 0: Source URL, 1: Make, 2: Model, 3: Version, 4: Notes, 5: Image URL,
  // 6: Price, 7: On Road Price in Delhi, 8: Key Price, 9: Key Mileage (ARAI),
  // 10: Key Engine, 11: Key Transmission, 12: Key Fuel Type, 13: Key Seating Capacity

  const make = cleanValues[1];
  const model = cleanValues[2];
  const variant = cleanValues[3];
  const priceStr = cleanValues[6] || cleanValues[8]; // Use Price or Key Price
  const mileage = cleanValues[9];
  const engine = cleanValues[10];
  const transmission = cleanValues[11];
  const fuelType = cleanValues[12];
  const seating = cleanValues[13];
  const images = cleanValues[5];

  // Skip empty rows (header rows from SQL)
  if (!make || !model || make === 'Make' || make === '') {
    return null;
  }

  return convertSQLRowToCarData(
    make,
    model,
    variant,
    priceStr,
    mileage,
    engine,
    transmission,
    fuelType,
    seating,
    images,
    'Sedan' // Default body type
  );
}

/**
 * Parse entire SQL dump
 */
function parseSQLDump(sqlContent: string) {
  // Extract VALUES section
  const valuesMatch = sqlContent.match(/VALUES\s+([\s\S]+);/i);
  if (!valuesMatch) {
    console.error('Could not find VALUES section in SQL');
    return [];
  }

  const valuesSection = valuesMatch[1];

  // Split by "),(" to get individual rows
  const rows = valuesSection.split(/\),\s*\(/);

  // Clean up first and last rows
  rows[0] = rows[0].replace(/^\(/, '');
  rows[rows.length - 1] = rows[rows.length - 1].replace(/\)$/, '');

  const cars = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const carData = parseSQLRow(rows[i]);
      if (carData && carData.brand && carData.model) {
        cars.push(carData);
      }
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error);
    }
  }

  return cars;
}

// Main execution
const cars = parseSQLDump(sqlDumpData);

console.log(`\n📊 Parsed ${cars.length} cars from SQL dump\n`);

// Output as JSON
const jsonOutput = JSON.stringify(cars, null, 2);

// Save to file
writeFileSync('parsed-cars.json', jsonOutput, 'utf-8');

console.log('✅ Saved to parsed-cars.json');
console.log('\nSample cars:');
console.log(JSON.stringify(cars.slice(0, 2), null, 2));

console.log('\n📋 Next steps:');
console.log('1. Copy the contents of parsed-cars.json');
console.log('2. Go to Admin > Manage Cars > Bulk Import tab');
console.log('3. Paste the JSON into the text area');
console.log('4. Click "Import Cars"');
