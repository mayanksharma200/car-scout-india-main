import { supabase } from '@/integrations/supabase/client';

/**
 * Interface for car data structure
 */
export interface CarData {
  external_id?: string;
  brand: string;
  model: string;
  variant?: string;
  price_min?: number;
  price_max?: number;
  fuel_type?: string;
  transmission?: string;
  engine_capacity?: string;
  mileage?: string;
  body_type?: string;
  seating_capacity?: number;
  images?: string[];
  specifications?: Record<string, any>;
  features?: string[];
  status?: string;
  api_source?: string;

  // City-specific pricing
  mumbai_price?: string;
  bangalore_price?: string;
  delhi_price?: string;
  pune_price?: string;
  hyderabad_price?: string;
  chennai_price?: string;
  kolkata_price?: string;
  ahmedabad_price?: string;

  // Colors
  colors?: string;
  color_codes?: string;

  // Warranty information
  warranty_years?: number;
  warranty_km?: number;
  battery_warranty_years?: number;
  battery_warranty_km?: number;

  // Price breakdown
  exact_price?: string;  // Base price from Excel column 6
  ex_showroom_price?: string;
  rto_charges?: string;
  insurance_cost?: string;

  // Safety features
  airbags?: string;
  ncap_rating?: string;
  abs?: boolean;
  esc?: boolean;

  // Comfort features
  sunroof?: string;
  ac_type?: string;
  cruise_control?: boolean;

  // Engine details
  engine_type?: string;
  max_power?: string;
  max_torque?: string;
  top_speed?: string;
  acceleration?: string;

  // Dimensions
  length_mm?: string;
  width_mm?: string;
  height_mm?: string;
  wheelbase_mm?: string;
  ground_clearance_mm?: string;
  bootspace_litres?: string;

  // Description
  description?: string;
}

/**
 * Interface for changed field tracking
 */
export interface ChangedField {
  field: string;
  old_value: string;
  new_value: string;
}

/**
 * Result interface for bulk operations
 */
export interface BulkInsertResult {
  success: boolean;
  total_processed: number;
  inserted_count: number;
  updated_count?: number;
  skipped_count: number;
  error_count: number;
  details: Array<{
    action: 'INSERTED' | 'UPDATED' | 'SKIPPED' | 'ERROR';
    car_id?: string;
    brand: string;
    model: string;
    variant?: string;
    message: string;
    changed_fields?: ChangedField[];
  }>;
  error?: any;
}

/**
 * Clears all existing car data from the database
 * WARNING: This will delete all cars and related data
 */
export const clearAllCars = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log('🗑️  Clearing all existing car data...');

    const { error } = await supabase.from('cars').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('❌ Error clearing cars:', error);
      return { success: false, error };
    }

    console.log('✅ All car data cleared successfully');
    return { success: true };
  } catch (err) {
    console.error('❌ Unexpected error clearing cars:', err);
    return { success: false, error: err };
  }
};

/**
 * Inserts a single car with duplicate checking
 */
export const insertCarWithDuplicateCheck = async (carData: CarData): Promise<{
  success: boolean;
  action: 'INSERTED' | 'SKIPPED';
  car_id?: string;
  message: string;
  error?: any;
}> => {
  try {
    // Call the PostgreSQL function for smart upsert
    const { data, error } = await supabase.rpc('upsert_car_data', {
      car_data: carData
    });

    if (error) {
      console.error('❌ Error inserting car:', error);
      return {
        success: false,
        action: 'SKIPPED',
        message: error.message,
        error
      };
    }

    const result = data[0];
    return {
      success: true,
      action: result.action,
      car_id: result.car_id,
      message: result.message
    };
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return {
      success: false,
      action: 'SKIPPED',
      message: 'Unexpected error occurred',
      error: err
    };
  }
};

/**
 * Bulk inserts multiple cars with duplicate checking and statistics
 */
export const bulkInsertCars = async (carsData: CarData[]): Promise<BulkInsertResult> => {
  try {
    console.log(`🚗 Processing ${carsData.length} cars for bulk insertion...`);

    // DEBUG: Log first car data being sent to see exact values
    if (carsData.length > 0) {
      console.log('🔍 FIRST CAR DATA BEING SENT TO SUPABASE - Basic fields:', {
        fuel_type: carsData[0].fuel_type,
        transmission: carsData[0].transmission,
        engine_capacity: carsData[0].engine_capacity,
        mileage: carsData[0].mileage,
        price_min: carsData[0].price_min
      });
      console.log('🔍 DEDICATED COLUMNS IN CAR DATA:', {
        mumbai_price: carsData[0].mumbai_price,
        bangalore_price: carsData[0].bangalore_price,
        delhi_price: carsData[0].delhi_price,
        colors: carsData[0].colors,
        airbags: carsData[0].airbags,
        sunroof: carsData[0].sunroof,
        warranty_years: carsData[0].warranty_years
      });
      console.log('🔍 FULL FIRST CAR OBJECT KEYS:', Object.keys(carsData[0]));
      console.log('🔍 FULL FIRST CAR DATA:', JSON.stringify(carsData[0], null, 2));
    }

    // Call the PostgreSQL bulk upsert function
    const { data, error } = await supabase.rpc('bulk_upsert_cars', {
      cars_data: carsData
    });

    if (error) {
      console.error('❌ Error during bulk insert:', error);
      return {
        success: false,
        total_processed: 0,
        inserted_count: 0,
        skipped_count: 0,
        error_count: carsData.length,
        details: [],
        error
      };
    }

    const result = data[0];

    console.log('\n📊 Bulk Insert Results:');
    console.log(`   Total Processed: ${result.total_processed}`);
    console.log(`   ✅ Inserted: ${result.inserted_count}`);
    console.log(`   ⏭️  Skipped: ${result.skipped_count}`);
    console.log(`   ❌ Errors: ${result.error_count}`);

    return {
      success: true,
      total_processed: result.total_processed,
      inserted_count: result.inserted_count,
      skipped_count: result.skipped_count,
      error_count: result.error_count,
      details: result.details
    };
  } catch (err) {
    console.error('❌ Unexpected error during bulk insert:', err);
    return {
      success: false,
      total_processed: 0,
      inserted_count: 0,
      skipped_count: 0,
      error_count: carsData.length,
      details: [],
      error: err
    };
  }
};

/**
 * Bulk inserts multiple cars with update tracking and change detection
 * This version will UPDATE existing cars if fields have changed
 */
export const bulkInsertCarsWithTracking = async (carsData: CarData[]): Promise<BulkInsertResult> => {
  try {
    console.log(`🚗 Processing ${carsData.length} cars for bulk insertion with update tracking...`);

    // DEBUG: Log first car data being sent to see exact values
    if (carsData.length > 0) {
      console.log('🔍 FIRST CAR DATA BEING SENT TO SUPABASE - Basic fields:', {
        fuel_type: carsData[0].fuel_type,
        transmission: carsData[0].transmission,
        engine_capacity: carsData[0].engine_capacity,
        mileage: carsData[0].mileage,
        price_min: carsData[0].price_min
      });
      console.log('🔍 DEDICATED COLUMNS IN CAR DATA:', {
        mumbai_price: carsData[0].mumbai_price,
        bangalore_price: carsData[0].bangalore_price,
        delhi_price: carsData[0].delhi_price,
        colors: carsData[0].colors,
        airbags: carsData[0].airbags,
        sunroof: carsData[0].sunroof,
        warranty_years: carsData[0].warranty_years
      });
    }

    // Call the PostgreSQL bulk upsert function WITH TRACKING
    const { data, error } = await supabase.rpc('bulk_upsert_cars_with_tracking', {
      cars_data: carsData
    });

    if (error) {
      console.error('❌ Error during bulk insert with tracking:', error);
      return {
        success: false,
        total_processed: 0,
        inserted_count: 0,
        updated_count: 0,
        skipped_count: 0,
        error_count: carsData.length,
        details: [],
        error
      };
    }

    const result = data[0];

    console.log('\n📊 Bulk Insert with Tracking Results:');
    console.log(`   Total Processed: ${result.total_processed}`);
    console.log(`   ✅ Inserted: ${result.inserted_count}`);
    console.log(`   🔄 Updated: ${result.updated_count}`);
    console.log(`   ⏭️  Skipped: ${result.skipped_count}`);
    console.log(`   ❌ Errors: ${result.error_count}`);

    return {
      success: true,
      total_processed: result.total_processed,
      inserted_count: result.inserted_count,
      updated_count: result.updated_count,
      skipped_count: result.skipped_count,
      error_count: result.error_count,
      details: result.details
    };
  } catch (err) {
    console.error('❌ Unexpected error during bulk insert with tracking:', err);
    return {
      success: false,
      total_processed: 0,
      inserted_count: 0,
      updated_count: 0,
      skipped_count: 0,
      error_count: carsData.length,
      details: [],
      error: err
    };
  }
};

/**
 * Parse a price string and convert to number
 * Examples: "? 42.30 Lakh" -> 4230000, "? 48,59,555" -> 4859555
 */
export const parsePrice = (priceStr: string | null | undefined): number | undefined => {
  if (!priceStr || priceStr.trim() === '') return undefined;

  // Remove currency symbols and extra spaces
  let cleaned = priceStr.replace(/[?₹,\s]/g, '');

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
  return isNaN(num) ? undefined : Math.round(num);
};

/**
 * Parse mileage string
 * Examples: "16.13 kmpl" -> "16.13 kmpl", "20.37 kmpl" -> "20.37 kmpl"
 */
export const parseMileage = (mileageStr: string | null | undefined): string | undefined => {
  if (!mileageStr || mileageStr.trim() === '') return undefined;
  return mileageStr.trim();
};

/**
 * Parse images from pipe-separated URL string
 */
export const parseImages = (imagesStr: string | null | undefined): string[] => {
  if (!imagesStr || imagesStr.trim() === '') return [];

  return imagesStr
    .split(';')
    .map(url => url.trim())
    .filter(url => url && url !== 'https://imgd.aeplcdn.com/0x0/statics/grey.gif');
};

/**
 * Parse features from comma-separated string
 */
export const parseFeatures = (featuresStr: string | null | undefined): string[] => {
  if (!featuresStr || featuresStr.trim() === '') return [];

  return featuresStr
    .split(',')
    .map(feature => feature.trim())
    .filter(feature => feature && feature !== 'Yes' && feature !== 'No');
};

/**
 * Convert SQL INSERT statement car data to CarData format
 * This function parses the raw SQL dump data
 */
export const convertSQLRowToCarData = (
  brand: string,
  model: string,
  variant: string,
  priceStr: string,
  mileageStr: string,
  engineStr: string,
  transmissionStr: string,
  fuelTypeStr: string,
  seatingStr: string,
  imagesStr: string,
  bodyTypeStr?: string
): CarData => {
  // Generate external_id from brand, model, variant
  const external_id = `${brand}_${model}_${variant}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  // Parse prices
  const price_min = parsePrice(priceStr);
  const price_max = parsePrice(priceStr); // Can be adjusted if you have max price

  // Parse seating capacity
  const seating_capacity = seatingStr ? parseInt(seatingStr.replace(/\D/g, '')) : undefined;

  return {
    external_id,
    brand: brand?.trim() || '',
    model: model?.trim() || '',
    variant: variant?.trim() || '',
    price_min,
    price_max,
    fuel_type: fuelTypeStr?.trim() || '',
    transmission: transmissionStr?.trim() || '',
    engine_capacity: engineStr?.trim() || '',
    mileage: parseMileage(mileageStr),
    body_type: bodyTypeStr?.trim() || 'Sedan',
    seating_capacity,
    images: parseImages(imagesStr),
    specifications: {
      engine: engineStr?.trim() || '',
      fuel_type: fuelTypeStr?.trim() || '',
      transmission: transmissionStr?.trim() || '',
      mileage: parseMileage(mileageStr),
      body_type: bodyTypeStr?.trim() || 'Sedan'
    },
    features: [],
    status: 'active',
    api_source: 'teoalida_import'
  };
};

/**
 * Helper to display detailed results
 */
export const displayBulkInsertResults = (result: BulkInsertResult) => {
  console.log('\n' + '='.repeat(60));
  console.log('📋 DETAILED BULK INSERT REPORT');
  console.log('='.repeat(60));

  if (!result.success) {
    console.log('❌ Bulk insert failed:', result.error);
    return;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Total Processed: ${result.total_processed}`);
  console.log(`   ✅ Successfully Inserted: ${result.inserted_count}`);
  console.log(`   ⏭️  Skipped (Duplicates): ${result.skipped_count}`);
  console.log(`   ❌ Errors: ${result.error_count}`);

  if (result.inserted_count > 0) {
    console.log(`\n✅ Inserted Cars:`);
    result.details
      .filter(d => d.action === 'INSERTED')
      .forEach(detail => {
        console.log(`   - ${detail.brand} ${detail.model} ${detail.variant || ''}`);
      });
  }

  if (result.skipped_count > 0) {
    console.log(`\n⏭️  Skipped Cars (Already Exist):`);
    result.details
      .filter(d => d.action === 'SKIPPED')
      .forEach(detail => {
        console.log(`   - ${detail.brand} ${detail.model} ${detail.variant || ''}`);
      });
  }

  if (result.error_count > 0) {
    console.log(`\n❌ Errors:`);
    result.details
      .filter(d => d.action === 'ERROR')
      .forEach(detail => {
        console.log(`   - ${detail.brand} ${detail.model} ${detail.variant || ''}: ${detail.message}`);
      });
  }

  console.log('\n' + '='.repeat(60) + '\n');
};
