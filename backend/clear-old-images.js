import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function clearOldImages() {
  try {
    console.log('🧹 Clearing old fallback images to use IMAGIN-only...\n');

    // Get cars with old fallback images (Unsplash URLs)
    const { data: cars, error } = await supabase
      .from('cars')
      .select('id, brand, model, variant, images, imagin_images')
      .eq('status', 'active')
      .not('imagin_images', 'is', null);

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log(`📊 Found ${cars.length} cars with image data`);

    let cleared = 0;
    for (const car of cars) {
      // Check if car has fallback images (Unsplash, not IMAGIN proxy)
      if (car.images && car.images.length > 0) {
        const hasUnsplash = car.images.some(img => img.includes('unsplash.com'));
        const hasFallback = car.imagin_images?.fallback === true;
        const hasOldImages = !car.images[0].includes('imagin-proxy');

        if (hasUnsplash || hasFallback || hasOldImages) {
          console.log(`🔄 Clearing: ${car.brand} ${car.model} ${car.variant || ''}`);
          
          // Clear the old images to force regeneration
          const { error: updateError } = await supabase
            .from('cars')
            .update({
              imagin_images: null,
              image_last_updated: null
            })
            .eq('id', car.id);

          if (updateError) {
            console.error(`❌ Error clearing ${car.id}:`, updateError);
          } else {
            cleared++;
          }
        }
      }
    }

    console.log(`\n✅ Cleared ${cleared} cars`);
    console.log('📋 These cars will now be processed by IMAGIN-only bulk updater');
    console.log('\n🚀 Now run the bulk updater from admin dashboard!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

clearOldImages();