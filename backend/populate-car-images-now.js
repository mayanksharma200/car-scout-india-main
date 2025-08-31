import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import CarImageService from './services/carImageService.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

const imageService = new CarImageService();

async function populateAllCarImages() {
  try {
    console.log('🚗 Starting comprehensive car image population...\n');

    // Get all active cars
    const { data: cars, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error fetching cars:', error);
      return;
    }

    console.log(`📊 Found ${cars.length} cars to process\n`);

    let processed = 0;
    let updated = 0;
    let skipped = 0;

    for (const car of cars) {
      try {
        console.log(`\n🔄 [${processed + 1}/${cars.length}] Processing: ${car.brand} ${car.model} ${car.variant || ''}`);
        
        // Check if car already has good images (not placeholder)
        const hasGoodImages = car.images && 
          Array.isArray(car.images) && 
          car.images.length > 0 && 
          !car.images[0].includes('placeholder') &&
          !car.images[0].includes('/src/assets/') &&
          car.images[0].startsWith('http');

        if (hasGoodImages) {
          console.log('   ✅ Already has good images, skipping...');
          skipped++;
          processed++;
          continue;
        }

        // Get new images
        console.log('   🖼️  Getting new images...');
        const images = await imageService.getCarImages(car, 4);
        
        if (images && images.length > 0) {
          const imageUrls = images.map(img => img.url);
          const primaryImage = images[0];
          
          console.log(`   📸 Primary image source: ${primaryImage.source} (${primaryImage.valid ? 'valid' : 'fallback'})`);
          console.log(`   🔗 Primary URL: ${primaryImage.url}`);

          // Prepare update data
          const updateData = {
            images: imageUrls,
            imagin_images: {
              primary: primaryImage.url,
              angles: images.map((img, index) => ({
                angle: img.angle || `${index * 4 + 1}`.padStart(2, '0'),
                url: img.url,
                source: img.source
              })),
              last_updated: new Date().toISOString(),
              valid: primaryImage.valid,
              fallback: !primaryImage.valid,
              sources: images.map(img => img.source)
            },
            image_last_updated: new Date().toISOString()
          };

          // Update the car
          const { error: updateError } = await supabase
            .from('cars')
            .update(updateData)
            .eq('id', car.id);

          if (updateError) {
            console.error(`   ❌ Update failed:`, updateError.message);
            skipped++;
          } else {
            console.log('   ✅ Successfully updated!');
            updated++;
          }
        } else {
          console.log('   ⚠️  No images generated, skipping...');
          skipped++;
        }

        processed++;

        // Small delay to avoid overwhelming the APIs
        if (processed % 5 === 0) {
          console.log(`\n⏳ Processed ${processed}/${cars.length} cars. Brief pause...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`   ❌ Error processing car ${car.id}:`, error.message);
        skipped++;
        processed++;
      }
    }

    console.log('\n🎉 Image population completed!');
    console.log('=====================================');
    console.log(`📊 Total cars processed: ${processed}`);
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`⏭️  Skipped (already good): ${skipped - (processed - updated - skipped)}`);
    console.log(`❌ Failed: ${processed - updated - (skipped - (processed - updated - skipped))}`);
    console.log('=====================================');

    // Sample a few updated cars to verify
    console.log('\n🔍 Verifying updates...');
    const { data: sampleCars } = await supabase
      .from('cars')
      .select('brand, model, images, imagin_images')
      .not('imagin_images', 'is', null)
      .limit(3);

    if (sampleCars && sampleCars.length > 0) {
      sampleCars.forEach((car, index) => {
        console.log(`\n${index + 1}. ${car.brand} ${car.model}:`);
        console.log(`   Images: ${car.images?.length || 0} URLs`);
        console.log(`   Primary: ${car.imagin_images?.primary || 'None'}`);
        console.log(`   Source: ${car.imagin_images?.angles?.[0]?.source || 'Unknown'}`);
      });
    }

    console.log('\n✨ All done! Your cars now have beautiful images! 🚗✨');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the script
populateAllCarImages();