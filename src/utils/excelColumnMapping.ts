/**
 * Excel Column Mapping for Car Data Import
 * Maps Excel columns to database fields based on the new comprehensive structure
 */

export interface ExcelColumnMapping {
  // Basic naming columns
  versionId: number;                    // Column 0: Version ID
  sourceUrl: string;                     // Column 1: Source URL
  make: string;                          // Column 2: Make
  model: string;                          // Column 3: Model
  version: string;                        // Column 4: Version
  bodyStyle: string;                      // Column 5: Body style
  status: string;                          // Column 6: Status
  imageUrl: string;                       // Column 7: Image URL
  
  // Key data columns
  price: string;                          // Column 8: Price
  onroadPriceDelhi_col9: string;              // Column 9: On-road price Delhi
  keyPrice: string;                       // Column 10: Key Price
  keyMileageArai: string;                // Column 11: Key Mileage (ARAI)
  keyEngine: string;                       // Column 12: Key Engine
  keyTransmission: string;                 // Column 13: Key Transmission
  keyFuelType: string;                    // Column 14: Key Fuel Type
  keySeatingCapacity: string;             // Column 15: Key Seating Capacity
  
  // Engine & Transmission
  engine: string;                         // Column 16: Engine
  engineType: string;                      // Column 17: Engine Type
  topSpeed: string;                        // Column 18: Top Speed
  acceleration0to100: string;             // Column 19: Acceleration (0-100 kmph)
  fuelTypeEngine: string;                  // Column 20: Fuel Type (Engine section)
  maxPowerBhp: string;                    // Column 21: Max Power (bhp)
  maxpowerRpm: string;                    // Column 22: Max Power RPM
  maxTorqueNm: string;                    // Column 23: Max Torque (Nm)
  maxtorqueRpm: string;                   // Column 24: Max Torque RPM
  performanceOnAlternateFuel: string;      // Column 25: Performance on Alternate Fuel
  maxEnginePerformance: string;            // Column 26: Max Engine Performance
  maxMotorPerformance: string;             // Column 27: Max Motor Performance
  mileageArai: string;                    // Column 28: Mileage (ARAI)
  powerconsumptionPerMileage: string;      // Column 29: Power Consumption per Mileage
  drivingRange: string;                    // Column 30: Driving Range
  drivetrain: string;                      // Column 31: Drivetrain
  transmission: string;                    // Column 32: Transmission
  emissionStandard: string;                // Column 33: Emission Standard
  turbochargerSupercharger: string;         // Column 34: Turbocharger/Supercharger
  battery: string;                         // Column 35: Battery
  batteryCharging: string;                 // Column 36: Battery Charging
  electricMotor: string;                   // Column 37: Electric Motor
  others: string;                          // Column 38: Others
  alternateFuel: string;                   // Column 39: Alternate Fuel
  
  // Dimensions & Weight
  length: string;                          // Column 40: Length
  width: string;                           // Column 41: Width
  height: string;                          // Column 42: Height
  wheelbase: string;                        // Column 43: Wheelbase
  groundClearance: string;                  // Column 44: Ground Clearance
  kerbWeight: string;                      // Column 45: Kerb Weight
  
  // Capacity
  doors: string;                            // Column 46: Doors
  seatingCapacity: string;                  // Column 47: Seating Capacity
  noOfSeatingRows: string;                // Column 48: No of Seating Rows
  bootspace: string;                        // Column 49: Bootspace
  fuelTankCapacity: string;                 // Column 50: Fuel Tank Capacity
  
  // Suspension, Brakes, Steering & Tyres
  frontSuspension: string;                  // Column 51: Front Suspension
  rearSuspension: string;                   // Column 52: Rear Suspension
  frontBrakeType: string;                 // Column 53: Front Brake Type
  rearBrakeType: string;                  // Column 54: Rear Brake Type
  minimumTurningRadius: string;             // Column 55: Minimum Turning Radius
  steeringType: string;                    // Column 56: Steering Type
  wheels: string;                           // Column 57: Wheels
  spareWheel: string;                       // Column 58: Spare Wheel
  frontTyres: string;                       // Column 59: Front Tyres
  rearTyres: string;                        // Column 60: Rear Tyres
  fourWheelSteering: string;                // Column 61: Four Wheel Steering
  brakingPerformance: string;                // Column 62: Braking Performance
  
  // Safety
  overspeedWarning: string;                 // Column 63: Overspeed Warning
  laneDepartureWarning: string;             // Column 64: Lane Departure Warning
  emergencyBrakeLightFlashing: string;     // Column 65: Emergency Brake Light Flashing
  forwardCollisionWarningFcw: string;       // Column 66: Forward Collision Warning (FCW)
  automaticEmergencyBrakingAeb: string;     // Column 67: Automatic Emergency Braking (AEB)
  highBeamAssist: string;                  // Column 68: High-beam Assist
  ncapRating: string;                      // Column 69: NCAP Rating
  blindSpotDetection: string;               // Column 70: Blind Spot Detection
  laneDeparturePrevention: string;          // Column 71: Lane Departure Prevention
  punctureRepairKit: string;                // Column 72: Puncture Repair Kit
  rearCrossTrafficAssist: string;           // Column 73: Rear Cross-Traffic Assist
  airbags: string;                          // Column 74: Airbags
  middleRearThreePointSeatbelt: string;     // Column 75: Middle Rear Three-point Seatbelt
  middleRearHeadrest: string;              // Column 76: Middle Rear Head Rest
  tyrePressureMonitoringSystemTpms: string;  // Column 77: Tyre Pressure Monitoring System (TPMS)
  childSeatAnchorPoints: string;            // Column 78: Child Seat Anchor Points
  seatbeltWarning: string;                 // Column 79: Seat Belt Warning
  
  // Braking & Traction
  antilockBrakingSystemAbs: string;         // Column 80: Anti-lock Braking System (ABS)
  electronicBrakeforceDistributionEbd: string; // Column 81: Electronic Brake-force Distribution (EBD)
  brakeAssistBa: string;                   // Column 82: Brake Assist (BA)
  electronicStabilityProgram: string;        // Column 83: Electronic Stability Program
  fourWheelDrive: string;                  // Column 84: Four-Wheel-Drive
  hillHoldControl: string;                  // Column 85: Hill Hold Control
  tractionControlSystemTcTcs: string;      // Column 86: Traction Control System (TC/TCS)
  rideHeightAdjustment: string;             // Column 87: Ride Height Adjustment
  hillDescentControl: string;               // Column 88: Hill Descent Control
  limitedSlipDifferentialLsd: string;      // Column 89: Limited Slip Differential (LSD)
  differentialLock: string;                 // Column 90: Differential Lock
  
  // Locks & Security
  engineImmobilizer: string;               // Column 91: Engine Immobilizer
  centralLocking: string;                   // Column 92: Central Locking
  speedSensingDoorlock: string;             // Column 93: Speed Sensing Door Lock
  childSafetyLock: string;                  // Column 94: Child Safety Lock
  
  // Comfort & Convenience
  airConditioner: string;                  // Column 95: Air Conditioner
  frontAc: string;                          // Column 96: Front AC
  rearAc: string;                           // Column 97: Rear AC
  headlightAndIgnitionOnReminder: string;   // Column 98: Headlight & Ignition On Reminder
  keylessStartButtonStart: string;           // Column 99: Keyless Start/ Button Start
  steeringAdjustment: string;                // Column 100: Steering Adjustment
  vPowerOutlets: string;                    // Column 101: 12V Power Outlets
  cruiseControl: string;                     // Column 102: Cruise Control
  parkingSensors: string;                  // Column 103: Parking Sensors
  parkingAssist: string;                   // Column 104: Parking Assist
  antiglareMirrors: string;                // Column 105: Antiglare Mirrors
  vanityMirrorsOnSunvisors: string;         // Column 106: Vanity Mirrors on Sunvisors
  heater: string;                            // Column 107: Heater
  cabinBootaccess: string;                  // Column 108: Cabin-Boot Access
  thirdRowAc: string;                       // Column 109: Third Row AC
  
  // Telematics
  remoteCarLightFlashingAndHonkingViaApp: string; // Column 110: Remote Car Light Flashing & Honking Via app
  geofence: string;                         // Column 111: Geo-Fence
  remoteSunroofOpenCloseViaApp: string;      // Column 112: Remote Sunroof Open/Close Via app
  overTheAirUpdatesOta: string;             // Column 113: Over The Air (OTA) Updates
  checkVehicleStatusViaApp: string;          // Column 114: Check Vehicle Status Via App
  remoteCarLockUnlockViaApp: string;        // Column 115: Remote Car Lock/Unlock Via app
  emergencyCall: string;                     // Column 116: Emergency Call
  findMyCar: string;                        // Column 117: Find My Car
  remoteAcOnOffViaApp: string;              // Column 118: Remote AC On/Off Via app
  alexaCompatibility: string;                 // Column 119: Alexa Compatibility
  
  // Seats & Upholstery
  driverSeatAdjustment: string;              // Column 120: Driver Seat Adjustment
  frontPassengerSeatAdjustment: string;      // Column 121: Front Passenger Seat Adjustment
  rearRowSeatAdjustment: string;            // Column 122: Rear Row Seat Adjustment
  thirdRowSeatAdjustment: string;           // Column 123: Third Row Seat Adjustment
  seatUpholstery: string;                  // Column 124: Seat Upholstery
  leatherWrappedSteeringWheel: string;       // Column 125: Leather-wrapped Steering Wheel
  leatherWrappedGearKnob: string;           // Column 126: Leather-wrapped Gear Knob
  driverArmrest: string;                    // Column 127: Driver Armrest
  rearPassengerSeatsType: string;            // Column 128: Rear Passenger Seats Type
  thirdRowSeatsType: string;                // Column 129: Third Row Seats Type
  ventilatedSeats: string;                  // Column 130: Ventilated Seats
  ventilatedSeatType: string;               // Column 131: Ventilated Seat Type
  interiors: string;                         // Column 132: Interiors
  interiorColours: string;                  // Column 133: Interior Colours
  rearArmrest: string;                     // Column 134: Rear Armrest
  foldingRearSeat: string;                  // Column 135: Folding Rear Seat
  splitRearSeat: string;                    // Column 136: Split Rear Seat
  splitThirdRowSeat: string;                 // Column 137: Split Third Row Seat
  frontSeatPockets: string;                 // Column 138: Front Seatback Pockets
  headrests: string;                        // Column 139: Head-rests
  fourthRowSeatAdjustment: string;           // Column 140: Fourth Row Seat Adjustment
  
  // Storage
  cupHolders: string;                       // Column 141: Cup Holders
  driverArmrestStorage: string;              // Column 142: Driver Armrest Storage
  cooledGloveBox: string;                   // Column 143: Cooled Glove Box
  sunglassHolder: string;                    // Column 144: Sunglass Holder
  thirdRowCupHolders: string;              // Column 145: Third Row Cup Holders
  
  // Doors, Windows, Mirrors & Wipers
  oneTouchDown: string;                     // Column 146: One Touch -Down
  oneTouchUp: string;                       // Column 147: One Touch - Up
  powerWindows: string;                      // Column 148: Power Windows
  adjustableOrvm: string;                    // Column 149: Adjustable ORVM
  turnIndicatorsOnOrvm: string;             // Column 150: Turn Indicators on ORVM
  rearDefogger: string;                     // Column 151: Rear Defogger
  rearWiper: string;                        // Column 152: Rear Wiper
  exteriorDoorHandles: string;              // Column 153: Exterior Door Handles
  rainSensingWipers: string;                // Column 154: Rain-sensing Wipers
  interiorDoorHandles: string;               // Column 155: Interior Door Handles
  doorPockets: string;                      // Column 156: Door Pockets
  sideWindowBlinds: string;                 // Column 157: Side Window Blinds
  bootlidOpener: string;                    // Column 158: Boot-lid Opener
  rearWindshieldBlind: string;              // Column 159: Rear Windshield Blind
  outsideRearviewMirrorsOrvms: string;      // Column 160: Outside Rearview Mirrors (ORVMs)
  scuffPlates: string;                      // Column 161: Scuff Plates
  
  // Exterior
  sunroofMoonroof: string;                  // Column 162: Sunroof / Moonroof
  roofRails: string;                          // Column 163: Roof Rails
  roofMountedAntenna: string;                // Column 164: Roof Mounted Antenna
  bodyColouredBumpers: string;              // Column 165: Body-Coloured Bumpers
  chromeFinishExhaustPipe: string;           // Column 166: Chrome Finish Exhaust pipe
  bodyKit: string;                           // Column 167: Body Kit
  rubStrips: string;                         // Column 168: Rub - Strips
  
  // Lighting
  fogLights: string;                         // Column 169: Fog Lights
  daytimeRunningLights: string;               // Column 170: Daytime Running Lights
  headlights: string;                        // Column 171: Headlights
  automaticHeadLamps: string;                // Column 172: Automatic Head Lamps
  followmeHomeHeadlamps: string;            // Column 173: Follow me home headlamps
  tailLights: string;                         // Column 174: Tail Lights
  cabinLamps: string;                        // Column 175: Cabin Lamps
  headlightHeightAdjuster: string;           // Column 176: Headlight Height Adjuster
  gloveBoxLamp: string;                     // Column 177: Glove Box Lamp
  lightsOnVanityMirrors: string;             // Column 178: Lights on Vanity Mirrors
  rearReadingLamp: string;                   // Column 179: Rear Reading Lamp
  corneringHeadlights: string;                // Column 180: Cornering Headlights
  puddleLamps: string;                       // Column 181: Puddle Lamps
  ambientInteriorLighting: string;             // Column 182: Ambient Interior Lighting
  
  // Instrumentation
  instrumentCluster: string;                  // Column 183: Instrument Cluster
  tripMeter: string;                         // Column 184: Trip Meter
  averageFuelConsumption: string;             // Column 185: Average Fuel Consumption
  averageSpeed: string;                      // Column 186: Average Speed
  distanceToEmpty: string;                   // Column 187: Distance to Empty
  clock: string;                              // Column 188: Clock
  lowFuelLevelWarning: string;               // Column 189: Low Fuel Level Warning
  doorAjarWarning: string;                  // Column 190: Door Ajar Warning
  adjustableClusterBrightness: string;         // Column 191: Adjustable Cluster Brightness
  gearIndicator: string;                      // Column 192: Gear Indicator
  shiftIndicator: string;                    // Column 193: Shift Indicator
  headsupDisplayHud: string;                // Column 194: Head Up Display (HUD)
  tachometer: string;                        // Column 195: Tachometer
  instantaneousConsumption: string;            // Column 196: Instantaneous Consumption
  
  // Entertainment, Information & Communication
  smartConnectivity: string;                  // Column 197: Smart Connectivity
  integratedIndashMusicsystem: string;       // Column 198: Integrated (in-dash) Music System
  headunitSize: string;                      // Column 199: Head Unit Size
  display: string;                            // Column 200: Display
  displayScreenForRearPassengers: string;    // Column 201: Display Screen for Rear Passengers
  gpsNavigationSystem: string;               // Column 202: GPS Navigation System
  speakers: string;                           // Column 203: Speakers
  usbCompatibility: string;                   // Column 204: USB Compatibility
  auxCompatibility: string;                   // Column 205: AUX Compatibility
  bluetoothCompatibility: string;              // Column 206: Bluetooth Compatibility
  mp3Playback: string;                       // Column 207: MP3 Playback
  cdPlayer: string;                           // Column 208: CD Player
  dvdPlayback: string;                        // Column 209: DVD Playback
  amFmRadio: string;                         // Column 210: AM/FM Radio
  ipodCompatibility: string;                  // Column 211: iPod Compatibility
  internalHardDrive: string;                   // Column 212: Internal Hard-drive
  steeringMountedControls: string;             // Column 213: Steering mounted controls
  voiceCommand: string;                       // Column 214: Voice Command
  wirelessCharger: string;                    // Column 215: Wireless Charger
  gestureControl: string;                     // Column 216: Gesture Control
  
  // Manufacturer Warranty
  warrantyYears: string;                     // Column 217: Warranty (Years)
  warrantyKilometres: string;                 // Column 218: Warranty (Kilometres)
  batteryWarrantyYears: string;                // Column 219: Battery Warranty (Years)
  batteryWarrantyKilometres: string;          // Column 220: Battery Warranty (Kilometres)
  
  // Colors
  colorName: string;                          // Column 221: Color Name
  colorRgb: string;                           // Column 222: Color RGB
  
  // Price breakdown
  exShowroomPrice: string;                    // Column 223: Ex-Showroom price
  rto: string;                                // Column 224: RTO
  insurance: string;                            // Column 225: Insurance
  taxCollectedAtSourceTcs: string;           // Column 226: Tax collected at source tcs
  handlingLogisticCharges: string;            // Column 227: Handling logistic charges
  fastTag: string;                             // Column 228: Fast tag
  
  // On-road prices by city
  onroadPriceMumbai: string;                  // Column 229: Mumbai
  onroadPriceBangalore: string;                // Column 230: Bangalore
  onroadPriceDelhi_col231: string;                   // Column 231: Delhi
  onroadPricePune: string;                    // Column 232: Pune
  onroadPriceNaviMumbai: string;              // Column 233: Navi Mumbai
  onroadPriceHyderabad: string;                // Column 234: Hyderabad
  onroadPriceAhmedabad: string;               // Column 235: Ahmedabad
  onroadPriceChennai: string;                  // Column 236: Chennai
  onroadPriceKolkata: string;                  // Column 237: Kolkata
  
  // Description
  description: string;                         // Column 238: Description
}

/**
 * Parse Excel row to CarData using comprehensive mapping
 */
export const parseExcelRowToCarData = (row: string[], index: number): any => {
  try {
    // Helper function to get column value safely
    const getColumnValue = (colIndex: number): string => {
      return row[colIndex] ? row[colIndex].toString().trim() : '';
    };

    // Helper function to convert string to boolean
    const toBoolean = (value: string): boolean => {
      if (!value || value.trim() === '') return false;
      const lowerValue = value.toLowerCase().trim();
      return lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1';
    };

    // Helper function to convert string to number
    const toNumber = (value: string): number | null => {
      if (!value || value.trim() === '') return null;
      const cleaned = value.replace(/[^\d.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    };

    // Helper function to extract numeric value from string
    const extractNumeric = (value: string): number | null => {
      if (!value || value.trim() === '') return null;
      const match = value.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : null;
    };

    // Extract basic information - check if this is actual data row
    const make = getColumnValue(2);
    const model = getColumnValue(3);
    const version = getColumnValue(4);
    
    // Debug: Log first few rows to understand structure
    if (index <= 15) {
      console.log(`🔍 Row ${index} raw data:`, {
        col0: getColumnValue(0),
        col1: getColumnValue(1),
        col2: getColumnValue(2),
        col3: getColumnValue(3),
        col4: getColumnValue(4),
        col5: getColumnValue(5),
        col6: getColumnValue(6),
        col7: getColumnValue(7),
        col8: getColumnValue(8),
        col9: getColumnValue(9),
        col10: getColumnValue(10),
        col11: getColumnValue(11),
        col12: getColumnValue(12),
        col13: getColumnValue(13),
        col14: getColumnValue(14),
        col15: getColumnValue(15),
        col16: getColumnValue(16),
        col17: getColumnValue(17),
        col18: getColumnValue(18),
        col19: getColumnValue(19),
        col20: getColumnValue(20),
        col21: getColumnValue(21),
        col22: getColumnValue(22),
        col23: getColumnValue(23),
        col24: getColumnValue(24),
        col25: getColumnValue(25)
      });
    }
    
    // Skip if essential data is missing or looks like header data
    if (!make || !model || make.length < 2 || model.length < 2) {
      return null;
    }
    
    // Skip header rows and metadata - more comprehensive checks
    if (
      make === 'Make' || make === 'Model' || make === 'Version' || make === 'Basic' ||
      make === 'naming-make' || make === 'keydata-key' ||
      make === 'Naming' || make === 'Key Data' || make === 'Version ID' ||
      make === 'Source URL' || make === 'Body style' || make === 'Status' ||
      make === 'Image URL' || make === 'Price' || make === 'On-road price Delhi' ||
      make === 'Mileage (ARAI)' || make === 'Engine' || make === 'Transmission' ||
      make === 'Fuel Type' || make === 'Seating Capacity' ||
      /^\d+$/.test(make) || // Skip if make is just numbers
      /^\d+\.\d+$/.test(make) || // Skip if make is decimal numbers (like percentages)
      make.includes('INDIA CAR DATABASE') ||
      make.includes('Compiled in Excel') ||
      make.includes('This is a SAMPLE') ||
      make.includes('Visit above website') ||
      make.includes('Statistics') ||
      make.includes('######') ||
      make.length < 3 || // Skip very short makes (likely headers)
      model.length < 2 || // Skip very short models
      !make || !model || !make.trim() || !model.trim() // Skip empty values
    ) {
      return null;
    }

    // Generate unique identifier
    const external_id = `${make}_${model}_${version}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    // Parse prices
    const priceStr = getColumnValue(8);
    const price_min = parsePriceString(priceStr);
    const price_max = price_min; // Can be adjusted if you have separate max price

    // Parse dimensions
    const length = extractNumeric(getColumnValue(40));
    const width = extractNumeric(getColumnValue(41));
    const height = extractNumeric(getColumnValue(42));
    const wheelbase = extractNumeric(getColumnValue(43));
    const groundClearance = extractNumeric(getColumnValue(44));
    const kerbWeight = extractNumeric(getColumnValue(45));

    // Parse capacity
    const doors = toNumber(getColumnValue(46));
    const seatingCapacity = toNumber(getColumnValue(47));
    const noOfSeatingRows = toNumber(getColumnValue(48));
    const bootspace = extractNumeric(getColumnValue(49));
    const fuelTankCapacity = extractNumeric(getColumnValue(50));

    // Parse engine specifications
    const maxPowerBhp = extractNumeric(getColumnValue(21));
    const maxpowerRpm = toNumber(getColumnValue(22));
    const maxTorqueNm = extractNumeric(getColumnValue(23));
    const maxtorqueRpm = toNumber(getColumnValue(24));

    // Parse safety features
    const airbags = toNumber(getColumnValue(74));
    const overspeedWarning = toBoolean(getColumnValue(63));
    const abs = toBoolean(getColumnValue(80));
    const ebd = toBoolean(getColumnValue(81));
    const airbagsAvailable = airbags && airbags > 0;

    // Parse comfort features
    const airConditioner = toBoolean(getColumnValue(95));
    const frontAc = toBoolean(getColumnValue(96));
    const rearAc = toBoolean(getColumnValue(97));
    const cruiseControl = toBoolean(getColumnValue(102));
    const parkingSensors = toBoolean(getColumnValue(103));
    const parkingAssist = toBoolean(getColumnValue(104));

    // Parse entertainment features
    const speakers = toNumber(getColumnValue(203));
    const usbCompatibility = toBoolean(getColumnValue(204));
    const bluetoothCompatibility = toBoolean(getColumnValue(206));
    const gpsNavigationSystem = toBoolean(getColumnValue(202));

    // Parse warranty
    const warrantyYears = toNumber(getColumnValue(217));
    const warrantyKilometres = toNumber(getColumnValue(218));

    // Parse colors
    const colorName = getColumnValue(221);
    const colorRgb = getColumnValue(222);

    // Parse price breakdown
    const exShowroomPrice = parsePriceString(getColumnValue(223));
    const rto = parsePriceString(getColumnValue(224));
    const insurance = parsePriceString(getColumnValue(225));

    // Parse on-road prices by city
    const onroadPriceDelhi = parsePriceString(getColumnValue(9));
    const onroadPriceMumbai = parsePriceString(getColumnValue(229));
    const onroadPriceBangalore = parsePriceString(getColumnValue(230));
    const onroadPricePune = parsePriceString(getColumnValue(232));
    const onroadPriceNaviMumbai = parsePriceString(getColumnValue(233));
    const onroadPriceHyderabad = parsePriceString(getColumnValue(234));
    const onroadPriceAhmedabad = parsePriceString(getColumnValue(235));
    const onroadPriceChennai = parsePriceString(getColumnValue(236));
    const onroadPriceKolkata = parsePriceString(getColumnValue(237));

    // Build comprehensive car data object
    const carData = {
      // Basic information
      external_id: external_id,
      brand: make,
      model: model,
      variant: version || null,
      body_style: getColumnValue(5) || null,
      status: 'active', // Default to active
      source_url: getColumnValue(1) || null,
      image_url: getColumnValue(7) || null,
      
      // Pricing
      price_min: price_min,
      price_max: price_max,
      onroad_price_delhi: onroadPriceDelhi,
      key_price: parsePriceString(getColumnValue(10)),
      
      // Key specifications
      key_mileage_arai: getColumnValue(11) || null,
      key_engine: getColumnValue(12) || null,
      key_transmission: getColumnValue(13) || null,
      key_fuel_type: getColumnValue(14) || null,
      key_seating_capacity: getColumnValue(15) || null,
      
      // Engine & Transmission
      engine: getColumnValue(16) || null,
      engine_type: getColumnValue(17) || null,
      top_speed: getColumnValue(18) || null,
      acceleration_0_100_kmph: getColumnValue(19) || null,
      fuel_type: getColumnValue(20) || getColumnValue(14) || null, // Use fuel type from engine section or key section
      transmission: getColumnValue(32) || getColumnValue(13) || null, // Use transmission from main section or key section
      maxpower_bhp: maxPowerBhp,
      maxpower_rpm: maxpowerRpm,
      maxtorque_nm: maxTorqueNm,
      maxtorque_rpm: maxtorqueRpm,
      performance_on_alternate_fuel: getColumnValue(25) || null,
      max_engine_performance: getColumnValue(26) || null,
      max_motor_performance: getColumnValue(27) || null,
      mileage_arai: getColumnValue(28) || null,
      powerconsumptionpermileage: getColumnValue(29) || null,
      driving_range: getColumnValue(30) || null,
      drivetrain: getColumnValue(31) || null,
      emission_standard: getColumnValue(33) || null,
      turbocharger_supercharger: getColumnValue(34) || null,
      battery: getColumnValue(35) || null,
      battery_charging: getColumnValue(36) || null,
      electric_motor: getColumnValue(37) || null,
      others: getColumnValue(38) || null,
      alternate_fuel: getColumnValue(39) || null,
      
      // Dimensions & Weight
      length_mm: length,
      width_mm: width,
      height_mm: height,
      wheelbase_mm: wheelbase,
      groundclearance_mm: groundClearance,
      kerbweight_kg: kerbWeight,
      
      // Capacity
      doors: doors,
      seating_capacity: seatingCapacity,
      no_of_seating_rows: noOfSeatingRows,
      bootspace_liters: bootspace,
      fuel_tank_capacity_liters: fuelTankCapacity,
      
      // Suspension, Brakes, Steering & Tyres
      front_suspension: getColumnValue(51) || null,
      rear_suspension: getColumnValue(52) || null,
      front_brake_type: getColumnValue(53) || null,
      rear_brake_type: getColumnValue(54) || null,
      minimum_turning_radius: getColumnValue(55) || null,
      steering_type: getColumnValue(56) || null,
      wheels: getColumnValue(57) || null,
      spare_wheel: getColumnValue(58) || null,
      front_tyres: getColumnValue(59) || null,
      rear_tyres: getColumnValue(60) || null,
      four_wheel_steering: toBoolean(getColumnValue(61)),
      braking_performance: getColumnValue(62) || null,
      
      // Safety
      overspeed_warning: overspeedWarning,
      lane_departure_warning: toBoolean(getColumnValue(64)),
      emergency_brake_light_flashing: toBoolean(getColumnValue(65)),
      forward_collision_warning_fcw: toBoolean(getColumnValue(66)),
      automatic_emergency_braking_aeb: toBoolean(getColumnValue(67)),
      high_beam_assist: toBoolean(getColumnValue(68)),
      ncap_rating: getColumnValue(69) || null,
      blind_spot_detection: toBoolean(getColumnValue(70)),
      lane_departure_prevention: toBoolean(getColumnValue(71)),
      puncture_repair_kit: toBoolean(getColumnValue(72)),
      rear_cross_traffic_assist: toBoolean(getColumnValue(73)),
      airbags: airbagsAvailable ? airbags : null,
      middle_rear_three_point_seatbelt: toBoolean(getColumnValue(75)),
      middle_rear_headrest: toBoolean(getColumnValue(76)),
      tyre_pressure_monitoring_system_tpms: toBoolean(getColumnValue(77)),
      child_seat_anchor_points: toBoolean(getColumnValue(78)),
      seatbelt_warning: toBoolean(getColumnValue(79)),
      
      // Braking & Traction
      antilock_braking_system_abs: abs,
      electronic_brakeforce_distribution_ebd: ebd,
      brake_assist_ba: toBoolean(getColumnValue(82)),
      electronic_stability_program: toBoolean(getColumnValue(83)),
      four_wheel_drive: toBoolean(getColumnValue(84)),
      hill_hold_control: toBoolean(getColumnValue(85)),
      traction_control_system_tc_tcs: toBoolean(getColumnValue(86)),
      ride_height_adjustment: toBoolean(getColumnValue(87)),
      hill_descent_control: toBoolean(getColumnValue(88)),
      limited_slip_differential_lsd: toBoolean(getColumnValue(89)),
      differential_lock: toBoolean(getColumnValue(90)),
      
      // Locks & Security
      engine_immobilizer: toBoolean(getColumnValue(91)),
      central_locking: toBoolean(getColumnValue(92)),
      speed_sensing_doorlock: toBoolean(getColumnValue(93)),
      child_safety_lock: toBoolean(getColumnValue(94)),
      
      // Comfort & Convenience
      air_conditioner: airConditioner,
      front_ac: frontAc,
      rear_ac: rearAc,
      headlight_and_ignition_on_reminder: toBoolean(getColumnValue(98)),
      keyless_start_button_start: toBoolean(getColumnValue(99)),
      steering_adjustment: getColumnValue(100) || null,
      power_outlets_12v: toNumber(getColumnValue(101)),
      cruise_control: cruiseControl,
      parking_sensors: parkingSensors,
      parking_assist: parkingAssist,
      antiglare_mirrors: toBoolean(getColumnValue(105)),
      vanity_mirrors_on_sunvisors: toBoolean(getColumnValue(106)),
      heater: toBoolean(getColumnValue(107)),
      cabin_bootaccess: toBoolean(getColumnValue(108)),
      third_row_ac: toBoolean(getColumnValue(109)),
      
      // Telematics
      remote_car_light_flashing_and_honking_via_app: toBoolean(getColumnValue(110)),
      geofence: toBoolean(getColumnValue(111)),
      remote_sunroof_open_close_via_app: toBoolean(getColumnValue(112)),
      over_the_air_updates_ota: toBoolean(getColumnValue(113)),
      check_vehicle_status_via_app: toBoolean(getColumnValue(114)),
      remote_car_lock_unlock_via_app: toBoolean(getColumnValue(115)),
      emergency_call: toBoolean(getColumnValue(116)),
      find_my_car: toBoolean(getColumnValue(117)),
      remote_ac_on_off_via_app: toBoolean(getColumnValue(118)),
      alexa_compatibility: toBoolean(getColumnValue(119)),
      
      // Seats & Upholstery
      driver_seat_adjustment: getColumnValue(120) || null,
      front_passenger_seat_adjustment: getColumnValue(121) || null,
      rear_row_seat_adjustment: getColumnValue(122) || null,
      third_row_seat_adjustment: getColumnValue(123) || null,
      seat_upholstery: getColumnValue(124) || null,
      leather_wrapped_steering_wheel: toBoolean(getColumnValue(125)),
      leather_wrapped_gear_knob: toBoolean(getColumnValue(126)),
      driver_armrest: toBoolean(getColumnValue(127)),
      rear_passenger_seats_type: getColumnValue(128) || null,
      third_row_seats_type: getColumnValue(129) || null,
      ventilated_seats: toBoolean(getColumnValue(130)),
      ventilated_seat_type: getColumnValue(131) || null,
      interiors: getColumnValue(132) || null,
      interior_colours: getColumnValue(133) || null,
      rear_armrest: toBoolean(getColumnValue(134)),
      folding_rear_seat: getColumnValue(135) || null,
      split_rear_seat: getColumnValue(136) || null,
      split_third_row_seat: getColumnValue(137) || null,
      front_seat_pockets: toBoolean(getColumnValue(138)),
      headrests: getColumnValue(139) || null,
      fourth_row_seat_adjustment: getColumnValue(140) || null,
      
      // Storage
      cup_holders: toBoolean(getColumnValue(141)),
      driver_armrest_storage: toBoolean(getColumnValue(142)),
      cooled_glove_box: toBoolean(getColumnValue(143)),
      sunglass_holder: toBoolean(getColumnValue(144)),
      third_row_cup_holders: toBoolean(getColumnValue(145)),
      
      // Doors, Windows, Mirrors & Wipers
      one_touch_down: toBoolean(getColumnValue(146)),
      one_touch_up: toBoolean(getColumnValue(147)),
      power_windows: toBoolean(getColumnValue(148)),
      adjustable_orvm: toBoolean(getColumnValue(149)),
      turn_indicators_on_orvm: toBoolean(getColumnValue(150)),
      rear_defogger: toBoolean(getColumnValue(151)),
      rear_wiper: toBoolean(getColumnValue(152)),
      exterior_door_handles: getColumnValue(153) || null,
      rain_sensing_wipers: toBoolean(getColumnValue(154)),
      interior_door_handles: getColumnValue(155) || null,
      door_pockets: toBoolean(getColumnValue(156)),
      side_window_blinds: toBoolean(getColumnValue(157)),
      bootlid_opener: toBoolean(getColumnValue(158)),
      rear_windshield_blind: toBoolean(getColumnValue(159)),
      outside_rearview_mirrors_orvms: getColumnValue(160) || null,
      scuff_plates: toBoolean(getColumnValue(161)),
      
      // Exterior
      sunroof_moonroof: toBoolean(getColumnValue(162)),
      roof_rails: toBoolean(getColumnValue(163)),
      roof_mounted_antenna: toBoolean(getColumnValue(164)),
      body_coloured_bumpers: toBoolean(getColumnValue(165)),
      chrome_finish_exhaust_pipe: toBoolean(getColumnValue(166)),
      body_kit: toBoolean(getColumnValue(167)),
      rub_strips: toBoolean(getColumnValue(168)),
      
      // Lighting
      fog_lights: toBoolean(getColumnValue(169)),
      daytime_running_lights: toBoolean(getColumnValue(170)),
      headlights: getColumnValue(171) || null,
      automatic_head_lamps: toBoolean(getColumnValue(172)),
      followme_home_headlamps: toBoolean(getColumnValue(173)),
      tail_lights: getColumnValue(174) || null,
      cabin_lamps: toBoolean(getColumnValue(175)),
      headlight_height_adjuster: toBoolean(getColumnValue(176)),
      glove_box_lamp: toBoolean(getColumnValue(177)),
      lights_on_vanity_mirrors: toBoolean(getColumnValue(178)),
      rear_reading_lamp: toBoolean(getColumnValue(179)),
      cornering_headlights: toBoolean(getColumnValue(180)),
      puddle_lamps: toBoolean(getColumnValue(181)),
      ambient_interior_lighting: toBoolean(getColumnValue(182)),
      
      // Instrumentation
      instrument_cluster: getColumnValue(183) || null,
      trip_meter: toBoolean(getColumnValue(184)),
      average_fuel_consumption: toBoolean(getColumnValue(185)),
      average_speed: toBoolean(getColumnValue(186)),
      distance_to_empty: toBoolean(getColumnValue(187)),
      clock: toBoolean(getColumnValue(188)),
      low_fuel_level_warning: toBoolean(getColumnValue(189)),
      door_ajar_warning: toBoolean(getColumnValue(190)),
      adjustable_cluster_brightness: toBoolean(getColumnValue(191)),
      gear_indicator: toBoolean(getColumnValue(192)),
      shift_indicator: toBoolean(getColumnValue(193)),
      headsup_display_hud: toBoolean(getColumnValue(194)),
      tachometer: toBoolean(getColumnValue(195)),
      instantaneous_consumption: toBoolean(getColumnValue(196)),
      
      // Entertainment, Information & Communication
      smart_connectivity: toBoolean(getColumnValue(197)),
      integrated_indash_musicsystem: toBoolean(getColumnValue(198)),
      headunit_size: getColumnValue(199) || null,
      display: getColumnValue(200) || null,
      display_screen_for_rear_passengers: toBoolean(getColumnValue(201)),
      gps_navigation_system: gpsNavigationSystem,
      speakers: speakers,
      usb_compatibility: usbCompatibility,
      aux_compatibility: toBoolean(getColumnValue(205)),
      bluetooth_compatibility: bluetoothCompatibility,
      mp3_playback: toBoolean(getColumnValue(207)),
      cd_player: toBoolean(getColumnValue(208)),
      dvd_playback: toBoolean(getColumnValue(209)),
      am_fm_radio: toBoolean(getColumnValue(210)),
      ipod_compatibility: toBoolean(getColumnValue(211)),
      internal_hard_drive: toBoolean(getColumnValue(212)),
      steering_mounted_controls: toBoolean(getColumnValue(213)),
      voice_command: toBoolean(getColumnValue(214)),
      wireless_charger: toBoolean(getColumnValue(215)),
      gesture_control: toBoolean(getColumnValue(216)),
      
      // Manufacturer Warranty
      warranty_years: warrantyYears,
      warranty_kilometres: warrantyKilometres,
      battery_warranty_years: toNumber(getColumnValue(219)),
      battery_warranty_kilometres: toNumber(getColumnValue(220)),
      
      // Colors
      color_name: colorName,
      color_rgb: colorRgb,
      
      // Price breakdown
      ex_showroom_price: exShowroomPrice,
      rto: rto,
      insurance: insurance,
      tax_collected_at_source_tcs: parsePriceString(getColumnValue(226)),
      handling_logistic_charges: parsePriceString(getColumnValue(227)),
      fast_tag: parsePriceString(getColumnValue(228)),
      
      // On-road prices by city
      onroad_price_mumbai: onroadPriceMumbai,
      onroad_price_bangalore: onroadPriceBangalore,
      // onroad_price_delhi already set above from column 9
      onroad_price_pune: onroadPricePune,
      onroad_price_navi_mumbai: onroadPriceNaviMumbai,
      onroad_price_hyderabad: onroadPriceHyderabad,
      onroad_price_ahmedabad: onroadPriceAhmedabad,
      onroad_price_chennai: onroadPriceChennai,
      onroad_price_kolkata: onroadPriceKolkata,
      
      // Description
      description: getColumnValue(238) || null,
      
      // Legacy fields for backward compatibility
      api_source: 'excel_import',
      images: [], // Will be populated separately if needed
      specifications: {}, // Will be populated separately if needed
      features: [], // Will be populated separately if needed
    };

    // Debug: Log successfully parsed car data
    if (carData.brand && carData.model) {
      console.log(`✅ Successfully parsed car: ${carData.brand} ${carData.model} ${carData.variant || ''}`);
    }

    return carData;
  } catch (error) {
    console.error(`Error parsing Excel row ${index}:`, error);
    return null;
  }
};

/**
 * Parse price string to number
 * Handles various formats: "? 50.88 Lakh", "? 48,59,555", etc.
 */
const parsePriceString = (priceStr: string): number | null => {
  if (!priceStr || priceStr.trim() === '') return null;
  
  // Remove currency symbols and extra spaces
  let cleaned = priceStr.replace(/[₹,\s]/g, '');
  
  // Handle "Lakh" and "Crore" format
  if (priceStr.toLowerCase().includes('lakh')) {
    const num = parseFloat(cleaned);
    return Math.round(num * 100000);
  } else if (priceStr.toLowerCase().includes('crore')) {
    const num = parseFloat(cleaned);
    return Math.round(num * 10000000);
  }
  
  // Direct number
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.round(num);
};

/**
 * Validate if a row should be processed
 */
export const shouldProcessExcelRow = (row: string[], index: number): boolean => {
  // Skip empty rows
  if (!row || row.length === 0) return false;
  
  // Get basic fields
  const make = row[2] ? row[2].toString().trim() : '';
  const model = row[3] ? row[3].toString().trim() : '';
  const version = row[4] ? row[4].toString().trim() : '';
  
  // Skip header rows and metadata
  if (make === 'Make' || model === 'Model' || version === 'Version') return false;
  if (make === 'naming-make' || model === 'naming-model' || version === 'naming-version') return false;
  if (make === 'Basic' || model === 'Basic' || version === 'Basic') return false;
  
  // Skip database info rows
  if (make.includes('INDIA CAR DATABASE') ||
      make.includes('Compiled in Excel') ||
      make.includes('This is a SAMPLE')) {
    return false;
  }
  
  // Skip rows with numeric IDs in make/model (these are likely header/mapping rows)
  if (/^\d+$/.test(make) || /^\d+$/.test(model)) return false;
  
  // Skip rows with missing essential data
  if (!make || !model || make === '' || model === '') {
    return false;
  }
  
  // Skip rows where make/model look like column headers or metadata
  if (make.length < 2 || model.length < 2) return false;
  
  // ACTUAL CAR DATA STARTS AFTER ROW 14 (based on debug output)
  // Rows 0-14 are headers/metadata, row 15+ has actual car data
  if (index <= 14) return false;
  
  return true;
};