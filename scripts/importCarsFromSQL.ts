/**
 * Import Cars from SQL Dump Script
 *
 * This script demonstrates how to import car data from SQL dumps
 * with automatic duplicate checking and skipping.
 *
 * Usage:
 *   1. Clear existing cars (optional): clearAllCars()
 *   2. Prepare your car data array
 *   3. Run bulkInsertCars() with your data
 *
 * The script will:
 *   - Check for duplicate cars (same brand, model, variant)
 *   - Skip existing cars
 *   - Insert only new cars
 *   - Provide detailed statistics
 */

import {
  CarData,
  clearAllCars,
  bulkInsertCars,
  displayBulkInsertResults,
  parsePrice,
  parseImages
} from '../src/utils/bulkCarInsertion';

/**
 * Sample BMW 3 Series data from the SQL dump
 * This is example data - you would parse your actual SQL dump
 */
const bmw3SeriesCars: CarData[] = [
  {
    external_id: 'bmw_3series_330i_sport',
    brand: 'BMW',
    model: '3 Series',
    variant: '330i Sport',
    price_min: 4230000,
    price_max: 4859555,
    fuel_type: 'Petrol',
    transmission: 'Automatic (Torque Converter)',
    engine_capacity: '1998 cc',
    mileage: '16.13 kmpl',
    body_type: 'Sedan',
    seating_capacity: 5,
    images: [
      'https://imgd.aeplcdn.com/664x374/cw/ec/37067/BMW-3-Series-Exterior-167583.jpg?wm=0&q=85'
    ],
    specifications: {
      engine: '1998 cc, 4 Cylinders Inline, 4 Valves/Cylinder, DOHC',
      engine_type: 'B48 Turbocharged I4',
      max_power: '255 bhp @ 5000 rpm',
      max_torque: '400 Nm @ 1550 rpm',
      drivetrain: 'RWD',
      transmission_type: 'Automatic - 8 Gears, Manual Override & Paddle Shift',
      fuel_tank_capacity: '59 litres',
      boot_space: '480 litres',
      length: '4709 mm',
      width: '1827 mm',
      height: '1435 mm',
      wheelbase: '2851 mm',
      ground_clearance: '135 mm'
    },
    features: [
      '6 Airbags',
      'ABS',
      'Electronic Brake-force Distribution (EBD)',
      'Brake Assist',
      'Electronic Stability Program (ESP)',
      'Hill Hold Control',
      'Traction Control System',
      'Automatic Climate Control (Three Zone)',
      'Keyless Entry',
      'Push Button Start',
      'Cruise Control',
      'Parking Sensors (Front & Rear)',
      'Reverse Camera with Guidance',
      'LED Headlights',
      'LED DRLs',
      'Power Adjustable ORVMs',
      'Leather Seats',
      'Electric Seat Adjustment',
      'Touchscreen Infotainment',
      'Apple CarPlay',
      'Bluetooth Connectivity',
      'Steering Mounted Controls'
    ],
    status: 'active',
    api_source: 'teoalida_database'
  },
  {
    external_id: 'bmw_3series_320d_sport',
    brand: 'BMW',
    model: '3 Series',
    variant: '320d Sport',
    price_min: 4280000,
    price_max: 5023930,
    fuel_type: 'Diesel',
    transmission: 'Automatic (Torque Converter)',
    engine_capacity: '1995 cc',
    mileage: '20.37 kmpl',
    body_type: 'Sedan',
    seating_capacity: 5,
    images: [
      'https://imgd.aeplcdn.com/664x374/cw/ec/37067/BMW-3-Series-Exterior-167583.jpg?wm=0&q=85'
    ],
    specifications: {
      engine: '1995 cc, 4 Cylinders Inline, 4 Valves/Cylinder, DOHC',
      engine_type: 'B47 Turbocharged I4',
      max_power: '188 bhp @ 4000 rpm',
      max_torque: '400 Nm @ 1750 rpm',
      drivetrain: 'RWD',
      transmission_type: 'Automatic - 8 Gears, Manual Override & Paddle Shift',
      fuel_tank_capacity: '59 litres',
      boot_space: '480 litres',
      length: '4709 mm',
      width: '1827 mm',
      height: '1435 mm',
      wheelbase: '2851 mm',
      ground_clearance: '135 mm'
    },
    features: [
      '6 Airbags',
      'ABS',
      'Electronic Brake-force Distribution (EBD)',
      'Brake Assist',
      'Electronic Stability Program (ESP)',
      'Hill Hold Control',
      'Traction Control System',
      'Automatic Climate Control (Three Zone)',
      'Keyless Entry',
      'Push Button Start',
      'Cruise Control',
      'Parking Sensors (Front & Rear)',
      'Reverse Camera with Guidance',
      'LED Headlights',
      'LED DRLs',
      'Power Adjustable ORVMs',
      'Leather Seats',
      'Electric Seat Adjustment',
      'Touchscreen Infotainment',
      'Apple CarPlay',
      'Bluetooth Connectivity',
      'Steering Mounted Controls'
    ],
    status: 'active',
    api_source: 'teoalida_database'
  },
  {
    external_id: 'bmw_3series_320d_luxury_edition',
    brand: 'BMW',
    model: '3 Series',
    variant: '320d Luxury Edition',
    price_min: 4690000,
    price_max: 5501255,
    fuel_type: 'Diesel',
    transmission: 'Automatic (Torque Converter)',
    engine_capacity: '1995 cc',
    mileage: '20.37 kmpl',
    body_type: 'Sedan',
    seating_capacity: 5,
    images: [
      'https://imgd.aeplcdn.com/664x374/cw/ec/37067/BMW-3-Series-Exterior-167583.jpg?wm=0&q=85'
    ],
    specifications: {
      engine: '1995 cc, 4 Cylinders Inline, 4 Valves/Cylinder, DOHC',
      engine_type: 'B47 Turbocharged I4',
      max_power: '188 bhp @ 4000 rpm',
      max_torque: '400 Nm @ 1750 rpm',
      drivetrain: 'RWD',
      transmission_type: 'Automatic - 8 Gears, Manual Override & Paddle Shift',
      fuel_tank_capacity: '59 litres',
      boot_space: '480 litres'
    },
    features: [
      '6 Airbags',
      'ABS',
      'Electronic Brake-force Distribution (EBD)',
      'Brake Assist',
      'Electronic Stability Program (ESP)',
      'Hill Hold Control',
      'Traction Control System',
      'Automatic Climate Control (Three Zone)',
      'Keyless Entry',
      'Push Button Start',
      'Cruise Control',
      'Parking Sensors (Front & Rear)',
      'Reverse Camera with Guidance',
      'LED Headlights',
      'Leather Seats',
      'Electric Seat Adjustment',
      'Premium Infotainment',
      'Apple CarPlay',
      'Digital Instrument Cluster'
    ],
    status: 'active',
    api_source: 'teoalida_database'
  },
  {
    external_id: 'bmw_3series_320d_luxury_line',
    brand: 'BMW',
    model: '3 Series',
    variant: '320d Luxury Line',
    price_min: 4829000,
    price_max: 5663805,
    fuel_type: 'Diesel',
    transmission: 'Automatic (Torque Converter)',
    engine_capacity: '1995 cc',
    mileage: '20.37 kmpl',
    body_type: 'Sedan',
    seating_capacity: 5,
    images: [
      'https://imgd.aeplcdn.com/664x374/cw/ec/37067/BMW-3-Series-Exterior-167583.jpg?wm=0&q=85'
    ],
    specifications: {
      engine: '1995 cc, 4 Cylinders Inline, 4 Valves/Cylinder, DOHC',
      engine_type: 'B47 Turbocharged I4',
      max_power: '188 bhp @ 4000 rpm',
      max_torque: '400 Nm @ 1750 rpm',
      drivetrain: 'RWD',
      transmission_type: 'Automatic - 8 Gears'
    },
    features: [
      '6 Airbags',
      'ABS',
      'ESP',
      'Hill Hold Control',
      'Automatic Climate Control',
      'Keyless Entry',
      'Cruise Control',
      'Parking Sensors',
      'Reverse Camera',
      'LED Headlights',
      'Leather Seats',
      'Premium Audio'
    ],
    status: 'active',
    api_source: 'teoalida_database'
  },
  {
    external_id: 'bmw_3series_330i_msport',
    brand: 'BMW',
    model: '3 Series',
    variant: '330i M Sport',
    price_min: 4928000,
    price_max: 5656805,
    fuel_type: 'Petrol',
    transmission: 'Automatic (Torque Converter)',
    engine_capacity: '1998 cc',
    mileage: '16.13 kmpl',
    body_type: 'Sedan',
    seating_capacity: 5,
    images: [
      'https://imgd.aeplcdn.com/664x374/cw/ec/37067/BMW-3-Series-Exterior-167583.jpg?wm=0&q=85'
    ],
    specifications: {
      engine: '1998 cc, 4 Cylinders Inline, 4 Valves/Cylinder, DOHC',
      engine_type: 'B48 Turbocharged I4',
      max_power: '255 bhp @ 5000 rpm',
      max_torque: '400 Nm @ 1550 rpm',
      drivetrain: 'RWD',
      transmission_type: 'Automatic - 8 Gears'
    },
    features: [
      '6 Airbags',
      'ABS',
      'ESP',
      'M Sport Package',
      'Sport Suspension',
      'M Sport Steering Wheel',
      'Sport Seats',
      'LED Headlights',
      'Digital Cockpit',
      'Premium Audio',
      'Apple CarPlay',
      'Parking Assistance'
    ],
    status: 'active',
    api_source: 'teoalida_database'
  }
];

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Car Import Process...\n');

  // Step 1: Optionally clear existing data
  // Uncomment the following lines if you want to clear all existing cars first
  /*
  console.log('⚠️  WARNING: About to clear all existing car data!');
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  const clearResult = await clearAllCars();
  if (!clearResult.success) {
    console.error('Failed to clear existing cars. Aborting.');
    process.exit(1);
  }
  */

  // Step 2: Bulk insert cars with duplicate checking
  console.log('📦 Importing BMW 3 Series cars...\n');
  const result = await bulkInsertCars(bmw3SeriesCars);

  // Step 3: Display detailed results
  displayBulkInsertResults(result);

  // Step 4: Summary
  if (result.success) {
    console.log('✅ Import completed successfully!');
    console.log(`   ${result.inserted_count} new cars added`);
    console.log(`   ${result.skipped_count} duplicates skipped`);
  } else {
    console.log('❌ Import failed!');
    console.log('   Error:', result.error);
  }
}

// Execute the script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✨ Script execution completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script execution failed:', error);
      process.exit(1);
    });
}

export { bmw3SeriesCars, main };
