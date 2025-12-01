/**
 * Test Excel Import Functionality
 * This file demonstrates and tests the comprehensive Excel import functionality
 */

import { parseExcelRowToCarData, shouldProcessExcelRow } from './excelColumnMapping';
import { bulkInsertCars } from './bulkCarInsertion';

// Sample Excel row data (based on the provided Excel structure)
const sampleExcelRow = [
  '292', // Version ID
  'https://www.carwale.com/bmw-cars/3-series/320d-luxury-edition/', // Source URL
  'BMW', // Make
  '3 Series', // Model
  '320d Luxury Edition', // Version
  'Sedan', // Body style
  '', // Status
  'https://imgd.aeplcdn.com/0x0/n/5e8u4ua_1563221.jpg', // Image URL
  '₹ 50.88 Lakh', // Price
  '₹54,68,966.00', // On-road price Delhi
  '₹ 50.88 Lakh', // Key Price
  '20.3 kmpl', // Key Mileage (ARAI)
  '1995 cc', // Key Engine
  'Automatic (TC)', // Key Transmission
  'Diesel', // Key Fuel Type
  '5 Seater', // Key Seating Capacity
  '1995 cc, 4 Cylinders Inline, 4 Valves/Cylinder, DOHC', // Engine
  'B47 Turbocharged I4', // Engine Type
  '243', // Top Speed
  '6.8', // Acceleration (0-100 kmph)
  'Diesel', // Fuel Type (Engine section)
  '188 bhp', // Max Power (bhp)
  '4000 rpm', // Max Power RPM
  '400 Nm', // Max Torque (Nm)
  '1750 rpm', // Max Torque RPM
  '', // Performance on Alternate Fuel
  '', // Max Engine Performance
  '', // Max Motor Performance
  '20.3 kmpl', // Mileage (ARAI)
  '', // Power Consumption per Mileage
  '1201.83 Km', // Driving Range
  'RWD', // Drivetrain
  'Automatic (TC) - 8 Gears, Manual Override & Paddle Shift, Sport Mode', // Transmission
  'BS 6', // Emission Standard
  'Turbocharged', // Turbocharger/Supercharger
  '', // Battery
  '', // Battery Charging
  '', // Electric Motor
  'Regenerative Braking, Idle Start/Stop', // Others
  '', // Alternate Fuel
  '4709 mm', // Length
  '1827 mm', // Width
  '1435 mm', // Height
  '2851 mm', // Wheelbase
  '135 mm', // Ground Clearance
  '', // Kerb Weight
  '4 Doors', // Doors
  '5 Person', // Seating Capacity
  '2 Rows', // No of Seating Rows
  '480 litres', // Bootspace
  '59 litres', // Fuel Tank Capacity
  'Double-joint spring strut axle, hydraulically damped torque strut bearing', // Front Suspension
  'Five-link axle', // Rear Suspension
  'Ventilated Disc', // Front Brake Type
  'Ventilated Disc', // Rear Brake Type
  '6 metres', // Minimum Turning Radius
  'Power assisted (Electric)', // Steering Type
  'Alloy Wheels', // Wheels
  'Space Saver', // Spare Wheel
  '225 / 50 R17', // Front Tyres
  '225 / 50 R17', // Rear Tyres
  'No', // Four Wheel Steering
  '', // Braking Performance
  '1 beep over 80kmph, Continuous beeps over 120kmph', // Overspeed Warning
  'No', // Lane Departure Warning
  'Yes', // Emergency Brake Light Flashing
  'No', // Forward Collision Warning (FCW)
  'No', // Automatic Emergency Braking (AEB)
  'No', // High-beam Assist
  '5 Star (Euro NCAP)', // NCAP Rating
  'No', // Blind Spot Detection
  'No', // Lane Departure Prevention
  'No', // Puncture Repair Kit
  'No', // Rear Cross-Traffic Assist
  '6 Airbags (Driver, Passenger, 2 Curtain, Driver Side, Front Passenger Side)', // Airbags
  'Yes', // Middle Rear Three-point Seatbelt
  'Yes', // Middle Rear Head Rest
  'Yes', // Tyre Pressure Monitoring System (TPMS)
  'Yes', // Child Seat Anchor Points
  'Yes', // Seat Belt Warning
  'Yes', // Anti-lock Braking System (ABS)
  'Yes', // Electronic Brake-force Distribution (EBD)
  'Yes', // Brake Assist (BA)
  'Yes', // Electronic Stability Program
  'No', // Four-Wheel-Drive
  'Yes', // Hill Hold Control
  'Yes', // Traction Control System (TC/TCS)
  'No', // Ride Height Adjustment
  'No', // Hill Descent Control
  'No', // Limited Slip Differential (LSD)
  'No', // Differential Lock
  'Yes', // Engine Immobilizer
  'Yes', // Central Locking
  'Yes', // Speed Sensing Door Lock
  'Yes', // Child Safety Lock
  'Yes', // Air Conditioner
  'Yes', // Front AC
  'Yes', // Rear AC
  'Yes', // Headlight & Ignition On Reminder
  'Yes', // Keyless Start/ Button Start
  'Yes', // Steering Adjustment
  '2', // 12V Power Outlets
  'Yes', // Cruise Control
  'Yes', // Front & Rear Parking Sensors
  'Reverse Camera with Guidance', // Parking Assist
  'Electronic - Internal & Driver', // Antiglare Mirrors
  'Driver & Co-Driver', // Vanity Mirrors on Sunvisors
  '', // Heater
  'Yes', // Cabin-Boot Access
  '', // Third Row AC
  'No', // Remote Car Light Flashing & Honking Via app
  'No', // Geo-Fence
  'No', // Remote Sunroof Open/Close Via app
  'No', // Over The Air (OTA) Updates
  'No', // Check Vehicle Status Via App
  'No', // Remote Car Lock/Unlock Via app
  'No', // Emergency Call
  'No', // Find My Car
  'No', // Remote AC On/Off Via app
  'No', // Alexa Compatibility
  '10 way electrically adjustable with 2 memory presets (seat forward / back, backrest tilt forward / back, seat height up / down, seat base angle up / down, backrest bolsters in / out) + 4 way manually adjustable (headrest up / down, extended thigh support forward / back)', // Driver Seat Adjustment
  '10 way electrically adjustable with 2 memory presets (seat forward / back, backrest tilt forward / back, seat height up / down, seat base angle up / down, backrest bolsters in / out) + 4 way manually adjustable (headrest up / down, extended thigh support forward / back)', // Front Passenger Seat Adjustment
  '2 way manually adjustable (headrest up / down)', // Rear Row Seat Adjustment
  '', // Third Row Seat Adjustment
  'Leather', // Seat Upholstery
  'Yes', // Leather-wrapped Steering Wheel
  'No', // Leather-wrapped Gear Knob
  'Yes', // Driver Armrest
  'Bench', // Rear Passenger Seats Type
  '', // Third Row Seats Type
  'No', // Ventilated Seats
  '', // Ventilated Seat Type
  'Dual Tone', // Interiors
  'Sensatec Canberra Beige/Black, Sensatec Black | Black', // Interior Colours
  'With Cup Holder', // Rear Armrest
  'Full', // Folding Rear Seat
  '40:20:40 split', // Split Rear Seat
  '', // Split Third Row Seat
  'Yes', // Front Seatback Pockets
  'Front & Rear', // Head-rests
  '', // Fourth Row Seat Adjustment
  'Yes', // Cup Holders
  'Yes', // Driver Armrest Storage
  'No', // Cooled Glove Box
  'No', // Sunglass Holder
  '', // Third Row Cup Holders
  'All', // One Touch -Down
  'All', // One Touch - Up
  'All', // Power Windows
  'Electrically Adjustable & Retractable', // Adjustable ORVM
  'Yes', // Turn Indicators on ORVM
  'Yes', // Rear Defogger
  'No', // Rear Wiper
  'Body Coloured', // Exterior Door Handles
  'No', // Rain-sensing Wipers
  'Body Coloured', // Interior Door Handles
  'Yes', // Door Pockets
  'No', // Side Window Blinds
  'Electric Tailgate Release', // Boot-lid Opener
  'No', // Rear Windshield Blind
  'Electrically Adjustable', // Outside Rearview Mirrors (ORVMs)
  'Yes', // Scuff Plates
  'No', // Sunroof / Moonroof
  'No', // Roof Rails
  'Yes', // Roof Mounted Antenna
  'Yes', // Body-Coloured Bumpers
  'No', // Chrome Finish Exhaust pipe
  'No', // Body Kit
  'No', // Rub - Strips
  'No', // Fog Lights
  'LED', // Daytime Running Lights
  'LED', // Headlights
  'Yes', // Automatic Head Lamps
  'No', // Follow me home headlamps
  'LED', // Tail Lights
  'Front and Rear', // Cabin Lamps
  'Yes', // Headlight Height Adjuster
  'No', // Glove Box Lamp
  'Driver & Co-Driver', // Lights on Vanity Mirrors
  'Yes', // Rear Reading Lamp
  'No', // Cornering Headlights
  'No', // Puddle Lamps
  'No', // Ambient Interior Lighting
  'Digital', // Instrument Cluster
  'Electronic 2 Trips', // Trip Meter
  'Yes', // Average Fuel Consumption
  'Yes', // Average Speed
  'Yes', // Distance to Empty
  'Digital', // Clock
  'Yes', // Low Fuel Level Warning
  'Yes', // Door Ajar Warning
  'Yes', // Adjustable Cluster Brightness
  'No', // Gear Indicator
  'No', // Shift Indicator
  'No', // Head Up Display (HUD)
  'No', // Tachometer
  'No', // Instantaneous Consumption
  'Android Auto (No), Apple Car Play (Yes)', // Smart Connectivity
  'Yes', // Integrated (in-dash) Music System
  'Not Available', // Head Unit Size
  'Touch-screen Display', // Display
  'No', // Display Screen for Rear Passengers
  'Yes', // GPS Navigation System
  '6+', // Speakers
  'Yes', // USB Compatibility
  'Yes', // AUX Compatibility
  'Phone & Audio Streaming', // Bluetooth Compatibility
  '', // MP3 Playback
  'No', // CD Player
  'No', // DVD Playback
  'Yes', // AM/FM Radio
  'No', // iPod Compatibility
  'No', // Internal Hard-drive
  'Yes', // Steering mounted controls
  'No', // Voice Command
  'No', // Wireless Charger
  'No', // Gesture Control
  '3', // Warranty (Years)
  '40000', // Warranty (Kilometres)
  'No', // Battery Warranty (Years)
  'No', // Battery Warranty (Kilometres)
  'Mediterranean Blue Metallic;Black Sapphire Metallic;Alpine White', // Color Name
  '064078;101410;CBCAC8', // Color RGB
  '₹46,90,000.00', // Ex-Showroom price
  '₹5,62,800.00', // RTO
  '₹1,37,066.00', // Insurance
  '₹46,900.00', // Tax collected at source tcs
  '₹95,000.00', // Handling logistic charges
  '₹500.00', // Fast tag
  '₹ 56.52 Lakh onwards', // Mumbai
  '₹ 59.86 Lakh onwards', // Bangalore
  '₹ 54.69 Lakh onwards', // Delhi
  '₹ 57.23 Lakh onwards', // Pune
  '₹ 56.52 Lakh onwards', // Navi Mumbai
  '₹ 58.20 Lakh onwards', // Hyderabad
  '₹ 53.16 Lakh onwards', // Ahmedabad
  '₹ 57.69 Lakh onwards', // Chennai
  '₹ 54.98 Lakh onwards', // Kolkata
  'BMW 3 Series 320d Luxury Edition is the diesel variant in the BMW 3 Series lineup and is priced at ₹ 50.88 Lakh.It returns a certified mileage of 20.3 kmpl. This 320d Luxury Edition variant comes with an engine putting out 188 bhp @ 4000 rpm and 400 Nm @ 1750 rpm of max power and max torque respectively. BMW 3 Series 320d Luxury Edition is available in Automatic (TC) transmission and offered in 3 colours: Mediterranean Blue Metallic, Black Sapphire Metallic and Alpine White.' // Description
];

/**
 * Test the Excel parsing functionality
 */
export const testExcelParsing = () => {
  console.log('🧪 Testing Excel Parsing Functionality...\n');
  
  // Test 1: Check if row should be processed
  console.log('📋 Test 1: Row Processing Validation');
  const shouldProcess = shouldProcessExcelRow(sampleExcelRow, 5);
  console.log(`Should process sample row: ${shouldProcess ? '✅ YES' : '❌ NO'}`);
  
  if (!shouldProcess) {
    console.log('❌ Row validation failed - cannot proceed with parsing test');
    return;
  }
  
  // Test 2: Parse the sample row
  console.log('\n📋 Test 2: Row Parsing');
  const carData = parseExcelRowToCarData(sampleExcelRow, 1);
  
  if (!carData) {
    console.log('❌ Failed to parse sample row');
    return;
  }
  
  console.log('✅ Successfully parsed sample row');
  console.log('\n📊 Parsed Car Data:');
  console.log(`  Brand: ${carData.brand}`);
  console.log(`  Model: ${carData.model}`);
  console.log(`  Variant: ${carData.variant}`);
  console.log(`  Price: ₹${carData.price_min?.toLocaleString('en-IN')}`);
  console.log(`  Fuel Type: ${carData.fuel_type}`);
  console.log(`  Transmission: ${carData.transmission}`);
  console.log(`  Engine: ${carData.engine}`);
  console.log(`  Airbags: ${carData.airbags}`);
  console.log(`  NCAP Rating: ${carData.ncap_rating}`);
  console.log(`  Length: ${carData.length_mm} mm`);
  console.log(`  Width: ${carData.width_mm} mm`);
  console.log(`  Height: ${carData.height_mm} mm`);
  console.log(`  Wheelbase: ${carData.wheelbase_mm} mm`);
  console.log(`  Ground Clearance: ${carData.groundclearance_mm} mm`);
  console.log(`  Seating Capacity: ${carData.seating_capacity}`);
  console.log(`  ABS: ${carData.antilock_braking_system_abs ? 'Yes' : 'No'}`);
  console.log(`  Air Conditioner: ${carData.air_conditioner ? 'Yes' : 'No'}`);
  console.log(`  GPS Navigation: ${carData.gps_navigation_system ? 'Yes' : 'No'}`);
  console.log(`  Bluetooth: ${carData.bluetooth_compatibility ? 'Yes' : 'No'}`);
  console.log(`  USB: ${carData.usb_compatibility ? 'Yes' : 'No'}`);
  console.log(`  Speakers: ${carData.speakers}`);
  console.log(`  Warranty Years: ${carData.warranty_years}`);
  console.log(`  Warranty KM: ${carData.warranty_kilometres}`);
  console.log(`  Colors: ${carData.color_name}`);
  
  return carData;
};

/**
 * Test bulk import functionality
 */
export const testBulkImport = async (carData: any) => {
  console.log('\n🧪 Testing Bulk Import Functionality...\n');
  
  try {
    console.log('📋 Test 3: Bulk Import to Database');
    const result = await bulkInsertCars([carData]);
    
    console.log('✅ Bulk import completed');
    console.log('\n📊 Import Results:');
    console.log(`  Success: ${result.success ? '✅ YES' : '❌ NO'}`);
    console.log(`  Total Processed: ${result.total_processed}`);
    console.log(`  Inserted: ${result.inserted_count}`);
    console.log(`  Skipped: ${result.skipped_count}`);
    console.log(`  Errors: ${result.error_count}`);
    
    if (result.details && result.details.length > 0) {
      console.log('\n📋 Detailed Results:');
      result.details.forEach((detail, index) => {
        console.log(`  ${index + 1}. ${detail.action}: ${detail.brand} ${detail.model} ${detail.variant || ''} - ${detail.message}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Bulk import failed:', error);
    return null;
  }
};

/**
 * Run all tests
 */
export const runExcelImportTests = async () => {
  console.log('🚀 Starting Excel Import Tests...\n');
  console.log('=' .repeat(60));
  
  // Test parsing
  const carData = testExcelParsing();
  
  if (!carData) {
    console.log('\n❌ Parsing tests failed - cannot proceed with import test');
    return;
  }
  
  // Test bulk import
  await testBulkImport(carData);
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Excel Import Tests Completed');
};

// Export for use in other files
export { sampleExcelRow };