import XLSX from 'xlsx';

/**
 * Comprehensive Excel car data mapper
 * Maps Excel columns to database fields with data validation and cleaning
 */

class ExcelCarDataMapper {
  constructor() {
    // Column mapping from Excel headers to database fields
    this.columnMapping = {
      // Basic identification
      'Version ID': 'version_id',
      'Source URL': 'source_url', 
      'Make': 'brand',
      'Model': 'model',
      'Version': 'variant',
      'Body style': 'body_style',
      'Status': 'status_notes',
      'Image URL': 'image_url',
      'Price': 'key_price',
      'On-road price Delhi': 'onroad_price_delhi',
      
      // Key data fields
      'Mileage (ARAI)': 'key_mileage_arai',
      'Engine': 'key_engine',
      'Transmission': 'key_transmission',
      'Fuel Type': 'key_fuel_type',
      'Seating Capacity': 'key_seating_capacity',
      
      // Engine & Transmission
      'Engine': 'engine',
      'Engine Type': 'engine_type',
      'Top Speed': 'top_speed',
      'Acceleration (0-100 kmph)': 'acceleration_0_100_kmph',
      'Max Power (bhp)': 'max_power_bhp',
      'Max Power (rpm)': 'max_power_rpm',
      'Max Torque (Nm)': 'max_torque_nm',
      'Max Torque (rpm)': 'max_torque_rpm',
      'Performance on Alternate Fuel': 'performance_on_alternate_fuel',
      'Max Engine Performance': 'max_engine_performance',
      'Max Motor Performance': 'max_motor_performance',
      'Power Consumption per Mileage': 'power_consumption_per_mileage',
      'Driving Range': 'driving_range',
      'Drivetrain': 'drivetrain',
      'Emission Standard': 'emission_standard',
      'Turbocharger/Supercharger': 'turbocharger_supercharger',
      'Battery': 'battery',
      'Battery Charging': 'battery_charging',
      'Electric Motor': 'electric_motor',
      'Others': 'engine_others',
      'Alternate Fuel': 'alternate_fuel',
      
      // Dimensions & Weight
      'Length': 'length',
      'Width': 'width', 
      'Height': 'height',
      'Wheelbase': 'wheelbase',
      'Ground Clearance': 'ground_clearance',
      'Kerb Weight': 'kerb_weight',
      'Doors': 'doors',
      'No of Seating Rows': 'no_of_seating_rows',
      'Bootspace': 'bootspace',
      'Fuel Tank Capacity': 'fuel_tank_capacity',
      
      // Suspension, Brakes, Steering & Tyres
      'Front Suspension': 'front_suspension',
      'Rear Suspension': 'rear_suspension',
      'Front Brake Type': 'front_brake_type',
      'Rear Brake Type': 'rear_brake_type',
      'Minimum Turning Radius': 'minimum_turning_radius',
      'Steering Type': 'steering_type',
      'Wheels': 'wheels',
      'Spare Wheel': 'spare_wheels',
      'Front Tyres': 'front_tyres',
      'Rear Tyres': 'rear_tyres',
      'Four Wheel Steering': 'four_wheel_steering',
      'Braking Performance': 'braking_performance',
      
      // Safety
      'Overspeed Warning': 'overspeed_warning',
      'Lane Departure Warning': 'lane_departure_warning',
      'Emergency Brake Light Flashing': 'emergency_brake_light_flashing',
      'Forward Collision Warning (FCW)': 'forward_collision_warning_fcw',
      'Automatic Emergency Braking (AEB)': 'automatic_emergency_braking_aeb',
      'High-beam Assist': 'high_beam_assist',
      'NCAP Rating': 'ncap_rating',
      'Blind Spot Detection': 'blind_spot_detection',
      'Lane Departure Prevention': 'lane_departure_prevention',
      'Puncture Repair Kit': 'puncture_repair_kit',
      'Rear Cross-Traffic Assist': 'rear_cross_traffic_assist',
      'Airbags': 'airbags',
      'Middle rear three-point seatbelt': 'middle_rear_three_point_seatbelt',
      'Middle Rear Head Rest': 'middle_rear_headrest',
      'Tyre Pressure Monitoring System (TPMS)': 'tyre_pressure_monitoring_system_tpms',
      'Child Seat Anchor Points': 'child_seat_anchor_points',
      'Seat Belt Warning': 'seatbelt_warning',
      
      // Braking & Traction
      'Anti-Lock Braking System (ABS)': 'antilock_braking_system_abs',
      'Electronic Brake-force Distribution (EBD)': 'electronic_brakeforce_distribution_ebd',
      'Brake Assist (BA)': 'brake_assist_ba',
      'Electronic Stability Program': 'electronic_stability_program',
      'Four-Wheel-Drive': 'four_wheel_drive',
      'Hill Hold Control': 'hill_hold_control',
      'Traction Control System (TC/TCS)': 'traction_control_system_tc_tcs',
      'Ride Height Adjustment': 'ride_height_adjustment',
      'Hill Descent Control': 'hill_descent_control',
      'Limited Slip Differential (LSD)': 'limited_slip_differential_lsd',
      'Differential Lock': 'differential_lock',
      
      // Locks & Security
      'Engine immobilizer': 'engine_immobilizer',
      'Central Locking': 'central_locking',
      'Speed Sensing Door Lock': 'speed_sensing_door_lock',
      'Child Safety Lock': 'child_safety_lock',
      
      // Comfort & Convenience
      'Air Conditioner': 'air_conditioner',
      'Front AC': 'front_ac',
      'Rear AC': 'rear_ac',
      'Headlight & Ignition On Reminder': 'headlight_and_ignition_on_reminder',
      'Keyless Start/ Button Start': 'keyless_start_button_start',
      'Steering Adjustment': 'steering_adjustment',
      '12V Power Outlets': '12v_power_outlets',
      'Cruise Control': 'cruise_control',
      'Parking Sensors': 'parking_sensors',
      'Parking Assist': 'parking_assist',
      'Antiglare Mirrors': 'antiglare_mirrors',
      'Vanity Mirrors on Sunvisors': 'vanity_mirrors_on_sunvisors',
      'Heater': 'heater',
      'Cabin-Boot Access': 'cabin_boot_access',
      'Third Row AC': 'third_row_ac',
      
      // Telematics
      'Remote Car Light Flashing & Honking Via app': 'remote_car_light_flashing_and_honking_via_app',
      'Geo-Fence': 'geofence',
      'Remote Sunroof Open/Close Via app': 'remote_sunroof_open_close_via_app',
      'Over The Air (OTA) Updates': 'over_the_air_updates_ota',
      'Check Vehicle Status Via App': 'check_vehicle_status_via_app',
      'Remote Car Lock/Unlock Via app': 'remote_car_lock_unlock_via_app',
      'Emergency Call': 'emergency_call',
      'Find My Car': 'find_my_car',
      'Remote AC On/Off Via app': 'remote_ac_on_off_via_app',
      'Alexa Compatibility': 'alexa_compatibility',
      
      // Seats & Upholstery
      'Driver Seat Adjustment': 'driver_seat_adjustment',
      'Front Passenger Seat Adjustment': 'front_passenger_seat_adjustment',
      'Rear Row Seat Adjustment': 'rear_row_seat_adjustment',
      'Third Row Seat Adjustment': 'third_row_seat_adjustment',
      'Seat Upholstery': 'seat_upholstery',
      'Leather-wrapped Steering Wheel': 'leather_wrapped_steering_wheel',
      'Leather-wrapped Gear Knob': 'leather_wrapped_gear_knob',
      'Driver Armrest': 'driver_armrest',
      'Rear Passenger Seats Type': 'rear_passenger_seats_type',
      'Third Row Seats Type': 'third_row_seats_type',
      'Ventilated Seats': 'ventilated_seats',
      'Ventilated Seat Type': 'ventilated_seat_type',
      'Interiors': 'interiors',
      'Interior Colours': 'interior_colours',
      'Rear Armrest': 'rear_armrest',
      'Folding Rear Seat': 'folding_rear_seat',
      'Split Rear Seat': 'split_rear_seat',
      'Split Third Row Seat': 'split_third_row_seat',
      'Front Seatback Pockets': 'front_seatback_pockets',
      'Head-rests': 'headrests',
      'Fourth Row Seat Adjustment': 'fourth_row_seat_adjustment',
      
      // Storage
      'Cup Holders': 'cup_holders',
      'Driver Armrest Storage': 'driver_armrest_storage',
      'Cooled Glove Box': 'cooled_glove_box',
      'Sunglass Holder': 'sunglass_holder',
      'Third Row Cup Holders': 'third_row_cup_holders',
      
      // Doors, Windows, Mirrors & Wipers
      'One Touch -Down': 'one_touch_down',
      'One Touch - Up': 'one_touch_up',
      'Power Windows': 'power_windows',
      'Adjustable ORVM': 'adjustable_orvm',
      'Turn Indicators on ORVM': 'turn_indicators_on_orvm',
      'Rear Defogger': 'rear_defogger',
      'Rear Wiper': 'rear_wiper',
      'Exterior Door Handles': 'exterior_door_handles',
      'Rain-sensing Wipers': 'rain_sensing_wipers',
      'Interior Door Handles': 'interior_door_handles',
      'Door Pockets': 'door_pockets',
      'Side Window Blinds': 'side_window_blinds',
      'Boot-lid Opener': 'bootlid_opener',
      'Rear Windshield Blind': 'rear_windshield_blind',
      'Outside Rearview Mirrors (ORVMs)': 'outside_rearview_mirrors_orvms',
      'Scuff Plates': 'scuff_plates',
      
      // Exterior
      'Sunroof / Moonroof': 'sunroof_moonroof',
      'Roof Rails': 'roof_rails',
      'Roof Mounted Antenna': 'roof_mounted_antenna',
      'Body-Coloured Bumpers': 'body_coloured_bumpers',
      'Chrome Finish Exhaust pipe': 'chrome_finish_exhaust_pipe',
      'Body Kit': 'body_kit',
      'Rub - Strips': 'rub_strips',
      
      // Lighting
      'Fog Lights': 'fog_lights',
      'Daytime Running Lights': 'daytime_running_lights',
      'Headlights': 'headlights',
      'Automatic Head Lamps': 'automatic_head_lamps',
      'Follow me home headlamps': 'followme_home_headlamps',
      'Tail Lights': 'tail_lights',
      'Cabin Lamps': 'cabin_lamps',
      'Headlight Height Adjuster': 'headlight_height_adjuster',
      'Glove Box Lamp': 'glove_box_lamp',
      'Lights on Vanity Mirrors': 'lights_on_vanity_mirrors',
      'Rear Reading Lamp': 'rear_reading_lamp',
      'Cornering Headlights': 'cornering_headlights',
      'Puddle Lamps': 'puddle_lamps',
      'Ambient Interior Lighting': 'ambient_interior_lighting',
      
      // Instrumentation
      'Instrument Cluster': 'instrument_cluster',
      'Trip Meter': 'trip_meter',
      'Average Fuel Consumption': 'average_fuel_consumption',
      'Average Speed': 'average_speed',
      'Distance to Empty': 'distance_to_empty',
      'Clock': 'clock',
      'Low Fuel Level Warning': 'low_fuel_level_warning',
      'Door Ajar Warning': 'door_ajar_warning',
      'Adjustable Cluster Brightness': 'adjustable_cluster_brightness',
      'Gear Indicator': 'gear_indicator',
      'Shift Indicator': 'shift_indicator',
      'Head Up Display (HUD)': 'headsup_display_hud',
      'Tachometer': 'tachometer',
      'Instantaneous Consumption': 'instantaneous_consumption',
      
      // Entertainment, Information & Communication
      'Smart Connectivity': 'smart_connectivity',
      'Integrated (in-dash) Music System': 'integrated_indash_musicsystem',
      'Head Unit Size': 'headunit_size',
      'Display': 'display',
      'Display Screen for Rear Passengers': 'display_screen_for_rear_passengers',
      'GPS Navigation System': 'gps_navigation_system',
      'Speakers': 'speakers',
      'USB Compatibility': 'usb_compatibility',
      'Aux Compatibility': 'aux_compatibility',
      'Bluetooth Compatibility': 'bluetooth_compatibility',
      'MP3 Playback': 'mp3_playback',
      'CD Player': 'cd_player',
      'DVD Playback': 'dvd_playback',
      'AM/FM Radio': 'am_fm_radio',
      'iPod Compatibility': 'ipod_compatibility',
      'Internal Hard-drive': 'internal_hard_drive',
      'Steering mounted controls': 'steering_mounted_controls',
      'Voice Command': 'voice_command',
      'Wireless Charger': 'wireless_charger',
      'Gesture Control': 'gesture_control',
      
      // Manufacturer Warranty
      'Warranty (Years)': 'warranty_in_years',
      'Warranty (Kilometres)': 'warranty_in_kms',
      'Battery Warranty (Years)': 'battery_warranty_in_years',
      'Battery Warranty (Kilometres)': 'battery_warranty_in_kms',
      
      // Colors
      'Color Name': 'color_name',
      'Color RGB': 'color_rgb',
      
      // Price breakdown
      'Ex-Showroom price': 'ex_showroom_price',
      'RTO': 'rto',
      'Insurance': 'insurance',
      'tax collected at source tcs': 'tax_collected_at_source_tcs',
      'handling logistic charges': 'handling_logistic_charges',
      'fast tag': 'fast_tag',
      
      // On-road prices by city
      'Mumbai': 'onroad_price_mumbai',
      'Bangalore': 'onroad_price_bangalore',
      'Delhi': 'onroad_price_delhi',
      'Pune': 'onroad_price_pune',
      'Navi Mumbai': 'onroad_price_navi_mumbai',
      'Hyderabad': 'onroad_price_hyderabad',
      'Ahmedabad': 'onroad_price_ahmedabad',
      'Chennai': 'onroad_price_chennai',
      'Kolkata': 'onroad_price_kolkata',
      
      // Description
      'Description': 'description'
    };
  }

  /**
   * Parse Excel file and convert to car data objects
   */
  async parseExcelFile(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }
      
      const headers = data[0];
      const rows = data.slice(2); // Skip header and percentage rows
      
      return this.processExcelData(headers, rows);
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Process Excel data rows with header mapping
   */
  processExcelData(headers, rows) {
    const cars = [];
    const headerMap = this.createHeaderMap(headers);
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every(cell => !cell)) continue; // Skip empty rows
      
      try {
        const carData = this.mapRowToCarData(row, headerMap, i + 3); // +3 for header rows
        if (carData && carData.brand && carData.model) {
          cars.push(carData);
        }
      } catch (error) {
        console.warn(`Error processing row ${i + 3}: ${error.message}`);
        // Continue processing other rows
      }
    }
    
    return cars;
  }

  /**
   * Create mapping from Excel headers to column indices
   */
  createHeaderMap(headers) {
    const headerMap = {};
    headers.forEach((header, index) => {
      if (header && typeof header === 'string') {
        const cleanHeader = header.trim();
        if (this.columnMapping[cleanHeader]) {
          headerMap[cleanHeader] = index;
        }
      }
    });
    return headerMap;
  }

  /**
   * Map a single Excel row to car data object
   */
  mapRowToCarData(row, headerMap, rowNumber) {
    const carData = {
      id: this.generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active'
    };

    // Map each column using the header map
    Object.entries(this.columnMapping).forEach(([excelHeader, dbField]) => {
      if (headerMap.hasOwnProperty(excelHeader)) {
        const columnIndex = headerMap[excelHeader];
        const cellValue = row[columnIndex];
        
        if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
          carData[dbField] = this.cleanAndConvertValue(cellValue, dbField, excelHeader, rowNumber);
        }
      }
    });

    // Process images (multiple URLs separated by semicolon)
    if (carData.image_url) {
      const imageUrls = carData.image_url.split(';').map(url => url.trim()).filter(url => url);
      carData.images = imageUrls;
    }

    // Extract numeric values from price fields
    this.processPriceFields(carData);
    
    // Process specifications and features as JSON
    this.processSpecificationFields(carData);

    return carData;
  }

  /**
   * Clean and convert cell values based on data type
   */
  cleanAndConvertValue(value, dbField, excelHeader, rowNumber) {
    const stringValue = String(value).trim();
    
    // Handle different data types
    if (this.isNumericField(dbField)) {
      return this.extractNumericValue(stringValue, excelHeader, rowNumber);
    } else if (this.isBooleanField(dbField)) {
      return this.convertToBoolean(stringValue, excelHeader, rowNumber);
    } else if (this.isTextField(dbField)) {
      return this.cleanText(stringValue);
    }
    
    return stringValue;
  }

  /**
   * Check if field should be numeric
   */
  isNumericField(dbField) {
    const numericFields = [
      'version_id', 'onroad_price_delhi', 'key_price', 'top_speed', 
      'acceleration_0_100_kmph', 'max_power_bhp', 'max_power_rpm',
      'max_torque_nm', 'max_torque_rpm', 'driving_range', 'length',
      'width', 'height', 'wheelbase', 'ground_clearance', 'kerb_weight',
      'doors', 'no_of_seating_rows', 'bootspace', 'fuel_tank_capacity',
      'minimum_turning_radius', 'airbags', 'cup_holders', '12v_power_outlets',
      'speakers', 'warranty_in_years', 'warranty_in_kms',
      'battery_warranty_in_years', 'battery_warranty_in_kms',
      'ex_showroom_price', 'rto', 'insurance', 'tax_collected_at_source_tcs',
      'handling_logistic_charges', 'fast_tag', 'onroad_price_mumbai',
      'onroad_price_bangalore', 'onroad_price_pune', 'onroad_price_navi_mumbai',
      'onroad_price_hyderabad', 'onroad_price_ahmedabad',
      'onroad_price_chennai', 'onroad_price_kolkata', 'key_seating_capacity'
    ];
    return numericFields.includes(dbField);
  }

  /**
   * Check if field should be boolean
   */
  isBooleanField(dbField) {
    const booleanPrefixes = [
      'overspeed_warning', 'lane_departure_warning', 'emergency_brake_light_flashing',
      'forward_collision_warning_fcw', 'automatic_emergency_braking_aeb',
      'high_beam_assist', 'blind_spot_detection', 'lane_departure_prevention',
      'puncture_repair_kit', 'rear_cross_traffic_assist',
      'middle_rear_three_point_seatbelt', 'middle_rear_headrest',
      'tyre_pressure_monitoring_system_tpms', 'child_seat_anchor_points',
      'seatbelt_warning', 'antilock_braking_system_abs',
      'electronic_brakeforce_distribution_ebd', 'brake_assist_ba',
      'electronic_stability_program', 'four_wheel_drive', 'hill_hold_control',
      'traction_control_system_tc_tcs', 'ride_height_adjustment',
      'hill_descent_control', 'limited_slip_differential_lsd',
      'differential_lock', 'engine_immobilizer', 'central_locking',
      'speed_sensing_door_lock', 'child_safety_lock', 'air_conditioner',
      'front_ac', 'rear_ac', 'headlight_and_ignition_on_reminder',
      'keyless_start_button_start', 'cruise_control', 'parking_sensors',
      'parking_assist', 'antiglare_mirrors', 'vanity_mirrors_on_sunvisors',
      'heater', 'cabin_boot_access', 'third_row_ac',
      'remote_car_light_flashing_and_honking_via_app', 'geofence',
      'remote_sunroof_open_close_via_app', 'over_the_air_updates_ota',
      'check_vehicle_status_via_app', 'remote_car_lock_unlock_via_app',
      'emergency_call', 'find_my_car', 'remote_ac_on_off_via_app',
      'alexa_compatibility', 'leather_wrapped_steering_wheel',
      'leather_wrapped_gear_knob', 'driver_armrest', 'ventilated_seats',
      'driver_armrest_storage', 'cooled_glove_box', 'sunglass_holder',
      'one_touch_down', 'one_touch_up', 'power_windows', 'adjustable_orvm',
      'turn_indicators_on_orvm', 'rear_defogger', 'rear_wiper',
      'rain_sensing_wipers', 'door_pockets', 'side_window_blinds',
      'bootlid_opener', 'rear_windshield_blind', 'scuff_plates',
      'sunroof_moonroof', 'roof_rails', 'roof_mounted_antenna',
      'body_coloured_bumpers', 'chrome_finish_exhaust_pipe', 'body_kit',
      'rub_strips', 'fog_lights', 'daytime_running_lights',
      'automatic_head_lamps', 'followme_home_headlamps', 'cabin_lamps',
      'headlight_height_adjuster', 'glove_box_lamp', 'lights_on_vanity_mirrors',
      'rear_reading_lamp', 'cornering_headlights', 'puddle_lamps',
      'ambient_interior_lighting', 'trip_meter', 'average_fuel_consumption',
      'average_speed', 'distance_to_empty', 'clock', 'low_fuel_level_warning',
      'door_ajar_warning', 'adjustable_cluster_brightness', 'gear_indicator',
      'shift_indicator', 'headsup_display_hud', 'tachometer',
      'instantaneous_consumption', 'smart_connectivity',
      'integrated_indash_musicsystem', 'display_screen_for_rear_passengers',
      'gps_navigation_system', 'usb_compatibility', 'aux_compatibility',
      'bluetooth_compatibility', 'mp3_playback', 'cd_player',
      'dvd_playback', 'am_fm_radio', 'ipod_compatibility',
      'internal_hard_drive', 'steering_mounted_controls', 'voice_command',
      'wireless_charger', 'gesture_control', 'four_wheel_steering'
    ];
    
    return booleanPrefixes.some(prefix => dbField.startsWith(prefix));
  }

  /**
   * Check if field is text
   */
  isTextField(dbField) {
    return !this.isNumericField(dbField) && !this.isBooleanField(dbField);
  }

  /**
   * Extract numeric value from string
   */
  extractNumericValue(value, fieldName, rowNumber) {
    if (typeof value === 'number') return value;
    
    // Remove currency symbols, commas, and other non-numeric characters
    const cleanValue = String(value)
      .replace(/[₹$,]/g, '') // Remove currency symbols
      .replace(/,/g, '')     // Remove commas
      .trim();
    
    // Extract numeric part
    const numericMatch = cleanValue.match(/-?\d+\.?\d*/);
    if (numericMatch) {
      const num = parseFloat(numericMatch[0]);
      if (!isNaN(num)) {
        return num;
      }
    }
    
    console.warn(`Could not extract numeric value from "${value}" for field "${fieldName}" at row ${rowNumber}`);
    return null;
  }

  /**
   * Convert string to boolean
   */
  convertToBoolean(value, fieldName, rowNumber) {
    if (typeof value === 'boolean') return value;
    
    const stringValue = String(value).toLowerCase().trim();
    
    // True values
    const trueValues = ['yes', 'y', 'true', '1', 'available', 'present', '✓', '✔'];
    // False values  
    const falseValues = ['no', 'n', 'false', '0', 'not available', 'absent', '✗', '✖'];
    
    if (trueValues.includes(stringValue)) {
      return true;
    } else if (falseValues.includes(stringValue)) {
      return false;
    } else if (stringValue === '' || stringValue === '-' || stringValue === 'na') {
      return null;
    }
    
    console.warn(`Could not convert "${value}" to boolean for field "${fieldName}" at row ${rowNumber}`);
    return null;
  }

  /**
   * Clean text values
   */
  cleanText(value) {
    if (typeof value !== 'string') return value;
    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Process price fields to extract min/max values
   */
  processPriceFields(carData) {
    // Handle key_price which might be a range like "₹ 50.88 Lakh"
    if (carData.key_price && typeof carData.key_price === 'string') {
      const priceNumeric = this.extractNumericValue(carData.key_price, 'key_price', 0);
      if (priceNumeric) {
        // Convert lakh to actual amount (1 lakh = 100,000)
        const actualAmount = priceNumeric * 100000;
        carData.price_min = actualAmount;
        carData.price_max = actualAmount;
      }
    } else if (carData.key_price && typeof carData.key_price === 'number') {
      carData.price_min = carData.key_price;
      carData.price_max = carData.key_price;
    }
    
    // Process ex-showroom price
    if (carData.ex_showroom_price) {
      carData.price_min = carData.ex_showroom_price;
    }
  }

  /**
   * Process specifications and features into JSON fields
   */
  processSpecificationFields(carData) {
    const specifications = {};
    const features = [];
    
    // Add key specifications to JSON
    if (carData.engine) specifications.engine = carData.engine;
    if (carData.transmission) specifications.transmission = carData.transmission;
    if (carData.fuel_type) specifications.fuel_type = carData.fuel_type;
    if (carData.mileage) specifications.mileage = carData.mileage;
    if (carData.body_type) specifications.body_type = carData.body_type;
    if (carData.drivetrain) specifications.drivetrain = carData.drivetrain;
    
    // Add boolean features to features array
    const featureFields = [
      'air_conditioner', 'central_locking', 'power_windows', 'antilock_braking_system_abs',
      'airbags', 'parking_sensors', 'cruise_control', 'gps_navigation_system',
      'bluetooth_compatibility', 'usb_compatibility', 'automatic_emergency_braking_aeb',
      'lane_departure_warning', 'tire_pressure_monitoring_system_tpms'
    ];
    
    featureFields.forEach(field => {
      if (carData[field] === true) {
        features.push(this.formatFeatureName(field));
      }
    });
    
    carData.specifications = specifications;
    carData.features = features;
  }

  /**
   * Format feature name for display
   */
  formatFeatureName(field) {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Generate UUID for new records
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate car data before database insertion
   */
  validateCarData(carData) {
    const errors = [];
    
    // Required fields
    if (!carData.brand) errors.push('Brand is required');
    if (!carData.model) errors.push('Model is required');
    if (!carData.version_id) errors.push('Version ID is required');
    
    // Price validation
    if (carData.price_min && carData.price_max && carData.price_min > carData.price_max) {
      errors.push('Price minimum cannot be greater than price maximum');
    }
    
    // Year validation
    if (carData.warranty_in_years && (carData.warranty_in_years < 0 || carData.warranty_in_years > 50)) {
      errors.push('Warranty years must be between 0 and 50');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ExcelCarDataMapper;