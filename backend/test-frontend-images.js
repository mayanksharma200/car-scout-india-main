import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testFrontendImageURLs() {
  try {
    console.log('🔍 Testing frontend image compatibility...\n');

    // Get cars with IMAGIN images
    const { data: cars, error } = await supabase
      .from('cars')
      .select('*')
      .not('imagin_images', 'is', null)
      .limit(3);

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log(`📊 Found ${cars.length} cars with IMAGIN images\n`);

    for (const car of cars) {
      console.log(`🚗 ${car.brand} ${car.model} ${car.variant || ''}`);
      console.log(`   ID: ${car.id}`);
      
      // Check images array
      if (car.images && car.images.length > 0) {
        console.log(`   📸 Images: ${car.images.length} URLs`);
        
        const firstImage = car.images[0];
        if (firstImage.includes('imagin-proxy')) {
          console.log('   ✅ Has proxy URLs (frontend compatible)');
          console.log(`   🔗 Sample: ${firstImage.substring(0, 80)}...`);
        } else {
          console.log('   ❌ No proxy URLs found');
          console.log(`   🔗 Sample: ${firstImage.substring(0, 80)}...`);
        }
      } else {
        console.log('   ❌ No images array found');
      }

      // Check IMAGIN metadata
      if (car.imagin_images) {
        console.log(`   📋 IMAGIN metadata: ${car.imagin_images.valid ? '✅ Valid' : '❌ Invalid'}`);
        console.log(`   🎨 Angles: ${car.imagin_images.angles?.length || 0} available`);
      }
      
      console.log('');
    }

    console.log('📝 Frontend Integration Notes:');
    console.log('════════════════════════════════');
    console.log('✅ Updated CarCard.tsx to use IMAGINImage component');
    console.log('✅ Updated CarImageGallery.tsx for all image displays');
    console.log('✅ Created IMAGINImage.tsx with error handling');
    console.log('✅ Added test component in admin dashboard');
    console.log('✅ Backend proxy handles CORS issues');
    
    console.log('\n🔧 Frontend URLs format:');
    if (cars.length > 0 && cars[0].images && cars[0].images[0]) {
      const sampleUrl = cars[0].images[0];
      console.log(`   ${sampleUrl}`);
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Check browser DevTools Network tab for CORS errors');
    console.log('2. Verify proxy endpoint responses');
    console.log('3. Test in car listings, details, and gallery');
    console.log('4. Use admin dashboard test component');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendImageURLs();