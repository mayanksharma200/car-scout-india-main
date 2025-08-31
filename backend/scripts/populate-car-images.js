import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import IMAGINAPIService from '../services/imaginAPI.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

const imaginAPI = new IMAGINAPIService();

async function populateCarImages() {
  try {
    console.log('🚗 Starting car image population process...');
    
    // Get all cars that don't have proper images
    const { data: cars, error } = await supabase
      .from('cars')
      .select('*')
      .or('imagin_images.is.null,imagin_images.eq.{},images.cs.{"/placeholder.svg"}')
      .eq('status', 'active');
    
    if (error) {
      console.error('❌ Error fetching cars:', error);
      return;
    }

    console.log(`📊 Found ${cars.length} cars to process`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const car of cars) {
      try {
        console.log(`\n🔄 Processing: ${car.brand} ${car.model} ${car.variant || ''}`);
        
        // Generate multiple angle images
        const imageAngles = imaginAPI.generateMultipleAngles(car, ['21', '01', '05', '09']);
        
        // Get the best available image
        const bestImage = await imaginAPI.getBestCarImage(car);
        
        // Prepare image data
        const imaginImages = {
          primary: bestImage.url,
          angles: imageAngles,
          last_updated: new Date().toISOString(),
          fallback: bestImage.fallback || false
        };

        // Update traditional images array with the primary image
        const updatedImages = [bestImage.url];
        
        // Add additional angles if primary image is valid
        if (bestImage.valid && !bestImage.fallback) {
          const additionalAngles = imageAngles
            .filter(img => img.angle !== bestImage.angle)
            .slice(0, 3)
            .map(img => img.url);
          updatedImages.push(...additionalAngles);
        }

        // Update the car record
        const { error: updateError } = await supabase
          .from('cars')
          .update({
            images: updatedImages,
            imagin_images: imaginImages,
            image_last_updated: new Date().toISOString()
          })
          .eq('id', car.id);

        if (updateError) {
          console.error(`❌ Error updating car ${car.id}:`, updateError);
          skipped++;
        } else {
          console.log(`✅ Updated: ${car.brand} ${car.model} ${car.variant || ''}`);
          console.log(`   Primary image: ${bestImage.valid ? '✅' : '⚠️'} ${bestImage.fallback ? '(fallback)' : ''}`);
          updated++;
        }

        processed++;

        // Add small delay to avoid rate limiting
        if (processed % 10 === 0) {
          console.log(`\n⏳ Processed ${processed}/${cars.length} cars. Taking a short break...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ Error processing car ${car.id}:`, error);
        skipped++;
      }
    }

    console.log('\n📈 Population Summary:');
    console.log(`   Total cars processed: ${processed}`);
    console.log(`   Successfully updated: ${updated}`);
    console.log(`   Skipped/Failed: ${skipped}`);
    console.log('✨ Car image population completed!');

  } catch (error) {
    console.error('❌ Fatal error in population process:', error);
  }
}

// Add column check and creation function
async function ensureImageColumns() {
  try {
    console.log('🔧 Checking for required image columns...');
    
    // Test if imagin_images column exists by trying to select it
    const { error: testError } = await supabase
      .from('cars')
      .select('imagin_images, image_last_updated')
      .limit(1);
    
    if (testError && testError.code === '42703') { // Column doesn't exist
      console.log('⚠️  Image columns missing. Please run the following SQL in your Supabase SQL Editor:');
      console.log(`
-- Add IMAGIN image columns to cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS imagin_images JSONB,
ADD COLUMN IF NOT EXISTS image_last_updated TIMESTAMP WITH TIME ZONE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_cars_image_last_updated ON cars(image_last_updated);
CREATE INDEX IF NOT EXISTS idx_cars_imagin_images ON cars USING gin(imagin_images);

-- Comment for documentation
COMMENT ON COLUMN cars.imagin_images IS 'IMAGIN.studio generated images data including URLs and metadata';
COMMENT ON COLUMN cars.image_last_updated IS 'Timestamp when images were last updated';
      `);
      
      console.log('\n❌ Please execute the above SQL and run this script again.');
      return false;
    }
    
    console.log('✅ Image columns are ready');
    return true;
    
  } catch (error) {
    console.error('❌ Error checking columns:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🎬 IMAGIN.studio Car Image Population Script');
  console.log('==========================================');
  
  // Check environment variables
  if (!process.env.IMAGIN_CUSTOMER_KEY) {
    console.warn('⚠️  IMAGIN_CUSTOMER_KEY not set in environment variables');
    console.log('   Please add IMAGIN_CUSTOMER_KEY to your .env file');
  }
  
  if (!process.env.IMAGIN_TAILORING_KEY) {
    console.warn('⚠️  IMAGIN_TAILORING_KEY not set in environment variables'); 
    console.log('   Please add IMAGIN_TAILORING_KEY to your .env file');
  }

  // Ensure database columns exist
  const columnsReady = await ensureImageColumns();
  if (!columnsReady) {
    return;
  }

  // Proceed with image population
  await populateCarImages();
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { populateCarImages, ensureImageColumns };