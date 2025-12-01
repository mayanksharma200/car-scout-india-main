import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import ExcelCarDataMapper from '../utils/excelCarDataMapper.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.match(/\.(xlsx|xls)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  }
});

/**
 * Upload and process Excel file
 */
router.post('/upload-excel', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No Excel file uploaded',
        code: 'NO_FILE_UPLOADED'
      });
    }

    console.log(`📁 Processing Excel file: ${req.file.originalname}`);
    console.log(`📊 File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    // Parse Excel file
    const mapper = new ExcelCarDataMapper();
    const cars = await mapper.parseExcelFile(req.file.buffer);

    console.log(`🚗 Parsed ${cars.length} cars from Excel file`);

    if (cars.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid car data found in Excel file',
        code: 'NO_VALID_DATA'
      });
    }

    // Validate all cars
    const validationResults = {
      valid: [],
      invalid: [],
      duplicates: []
    };

    const seenCars = new Set();

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const validation = mapper.validateCarData(car);
      
      // Check for duplicates
      const carKey = `${car.brand}_${car.model}_${car.variant}`.toLowerCase();
      
      if (seenCars.has(carKey)) {
        validationResults.duplicates.push({
          index: i + 3, // Excel row number
          car: carKey,
          data: car
        });
      } else if (validation.isValid) {
        validationResults.valid.push(car);
        seenCars.add(carKey);
      } else {
        validationResults.invalid.push({
          index: i + 3, // Excel row number
          errors: validation.errors,
          data: car
        });
      }
    }

    console.log(`✅ Valid cars: ${validationResults.valid.length}`);
    console.log(`❌ Invalid cars: ${validationResults.invalid.length}`);
    console.log(`🔄 Duplicate cars: ${validationResults.duplicates.length}`);

    // Return validation results first
    if (validationResults.invalid.length > 0 || validationResults.duplicates.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation errors found in Excel data',
        code: 'VALIDATION_ERRORS',
        validationResults,
        validCount: validationResults.valid.length,
        invalidCount: validationResults.invalid.length,
        duplicateCount: validationResults.duplicates.length
      });
    }

    // If all valid, proceed with database insertion
    const insertResult = await bulkInsertCars(validationResults.valid);

    res.json({
      success: true,
      message: 'Excel file processed successfully',
      data: {
        totalRows: cars.length,
        validCars: validationResults.valid.length,
        invalidCars: validationResults.invalid.length,
        duplicateCars: validationResults.duplicates.length,
        insertResult
      }
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process Excel file',
      details: error.message,
      code: 'PROCESSING_ERROR'
    });
  }
});

/**
 * Force insert cars (skip validation)
 */
router.post('/force-insert', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No Excel file uploaded',
        code: 'NO_FILE_UPLOADED'
      });
    }

    console.log(`📁 Force processing Excel file: ${req.file.originalname}`);

    // Parse Excel file without validation
    const mapper = new ExcelCarDataMapper();
    const cars = await mapper.parseExcelFile(req.file.buffer);

    console.log(`🚗 Force inserting ${cars.length} cars`);

    const insertResult = await bulkInsertCars(cars);

    res.json({
      success: true,
      message: 'Excel file force inserted successfully',
      data: {
        totalRows: cars.length,
        insertResult
      }
    });

  } catch (error) {
    console.error('Force insert error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to force insert Excel data',
      details: error.message,
      code: 'FORCE_INSERT_ERROR'
    });
  }
});

/**
 * Bulk insert cars into database
 */
async function bulkInsertCars(cars) {
  try {
    console.log(`💾 Inserting ${cars.length} cars into database...`);

    // Process in batches of 100 to avoid timeout
    const batchSize = 100;
    const results = {
      successful: 0,
      failed: 0,
      errors: [],
      insertedIds: []
    };

    for (let i = 0; i < cars.length; i += batchSize) {
      const batch = cars.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(cars.length/batchSize)} (${batch.length} cars)`);

      try {
        const { data, error } = await supabase
          .from('cars')
          .upsert(batch, {
            onConflict: 'brand,model,variant',
            ignoreDuplicates: false
          })
          .select('id,brand,model,variant');

        if (error) {
          console.error(`Batch ${Math.floor(i/batchSize) + 1} error:`, error);
          results.failed += batch.length;
          results.errors.push({
            batch: Math.floor(i/batchSize) + 1,
            error: error.message,
            affectedRows: batch.length
          });
        } else {
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inserted ${data?.length || 0} cars`);
          results.successful += data?.length || 0;
          if (data) {
            results.insertedIds.push(...data.map(car => car.id));
          }
        }

        // Small delay between batches to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (batchError) {
        console.error(`Batch ${Math.floor(i/batchSize) + 1} fatal error:`, batchError);
        results.failed += batch.length;
        results.errors.push({
          batch: Math.floor(i/batchSize) + 1,
          error: batchError.message,
          affectedRows: batch.length
        });
      }
    }

    console.log(`🎉 Bulk insert completed: ${results.successful} successful, ${results.failed} failed`);

    return results;

  } catch (error) {
    console.error('Bulk insert error:', error);
    throw error;
  }
}

/**
 * Get upload status and statistics
 */
router.get('/upload-status', async (req, res) => {
  try {
    // Get total cars count
    const { count: totalCars } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true });

    // Get cars by brand
    const { data: carsByBrand } = await supabase
      .from('cars')
      .select('brand')
      .not('brand', 'is', null);

    const brandCounts = {};
    carsByBrand?.forEach(car => {
      brandCounts[car.brand] = (brandCounts[car.brand] || 0) + 1;
    });

    // Get recent uploads (last 24 hours)
    const { data: recentUploads } = await supabase
      .from('cars')
      .select('brand,model,created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalCars: totalCars || 0,
        brandCounts,
        recentUploads: recentUploads || [],
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get upload status',
      details: error.message
    });
  }
});

/**
 * Clear all car data (admin only)
 */
router.delete('/clear-all-cars', async (req, res) => {
  try {
    console.log('🗑️ Clearing all car data...');

    const { error } = await supabase
      .from('cars')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      throw error;
    }

    console.log('✅ All car data cleared successfully');

    res.json({
      success: true,
      message: 'All car data cleared successfully'
    });

  } catch (error) {
    console.error('Clear cars error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear car data',
      details: error.message
    });
  }
});

/**
 * Get Excel template
 */
router.get('/template', (req, res) => {
  try {
    // Create a simple template with headers
    const template = {
      headers: [
        'Version ID', 'Source URL', 'Make', 'Model', 'Version', 'Body style',
        'Status', 'Image URL', 'Price', 'On-road price Delhi',
        'Mileage (ARAI)', 'Engine', 'Transmission', 'Fuel Type', 'Seating Capacity',
        'Length', 'Width', 'Height', 'Wheelbase', 'Ground Clearance',
        'Kerb Weight', 'Doors', 'No of Seating Rows', 'Bootspace',
        'Fuel Tank Capacity', 'Airbags', 'ABS', 'Air Conditioner',
        'Power Windows', 'Central Locking', 'Warranty (Years)', 'Warranty (Kilometres)',
        'Color Name', 'Description'
      ],
      sampleData: [
        {
          'Version ID': 1,
          'Make': 'BMW',
          'Model': '3 Series',
          'Version': '320d Luxury Edition',
          'Body style': 'Sedan',
          'Status': 'Active',
          'Price': '₹ 50.88 Lakh',
          'Mileage (ARAI)': '20.3 kmpl',
          'Engine': '1995 cc',
          'Transmission': 'Automatic (TC)',
          'Fuel Type': 'Diesel',
          'Seating Capacity': 5,
          'Length': 4709,
          'Width': 1827,
          'Height': 1435,
          'Airbags': 6,
          'ABS': 'Yes',
          'Air Conditioner': 'Yes',
          'Power Windows': 'Yes',
          'Central Locking': 'Yes'
        }
      ]
    };

    res.json({
      success: true,
      data: template,
      message: 'Excel template for car data upload'
    });

  } catch (error) {
    console.error('Template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate template',
      details: error.message
    });
  }
});

export default router;