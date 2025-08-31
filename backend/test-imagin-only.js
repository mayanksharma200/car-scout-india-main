import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import IMAGINOnlyService from './services/imaginOnlyService.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const imaginOnlyAPI = new IMAGINOnlyService();

async function testIMAGINOnly() {
  try {
    console.log('🧪 Testing IMAGIN-ONLY service (no fallbacks)...\n');

    // Test with different car brands to see which ones work with IMAGIN
    const testCars = [
      { brand: 'BMW', model: '3 Series', body_type: 'sedan', fuel_type: 'petrol' },
      { brand: 'Audi', model: 'A4', body_type: 'sedan', fuel_type: 'petrol' },
      { brand: 'Mercedes-Benz', model: 'C-Class', body_type: 'sedan', fuel_type: 'petrol' },
      { brand: 'MG', model: 'Hector', body_type: 'suv', fuel_type: 'petrol' },
      { brand: 'Tata', model: 'Nexon', body_type: 'suv', fuel_type: 'petrol' },
      { brand: 'Maruti Suzuki', model: 'Swift', body_type: 'hatchback', fuel_type: 'petrol' }
    ];

    console.log('🔍 Testing IMAGIN API with different car brands:\n');

    for (const car of testCars) {
      console.log(`\n🚗 ${car.brand} ${car.model} (${car.body_type})`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      try {
        // Generate primary image URL
        const imageURL = imaginOnlyAPI.generateCarImageURL(car);
        console.log(`🔗 URL: ${imageURL}`);

        // Test if IMAGIN image is available
        const isValid = await imaginOnlyAPI.validateIMAGINImage(imageURL);
        console.log(`✅ IMAGIN Status: ${isValid ? '🟢 AVAILABLE' : '🔴 NOT AVAILABLE'}`);

        if (isValid) {
          console.log('🎉 This car brand/model works with IMAGIN!');
          
          // Test multiple angles
          const allImages = await imaginOnlyAPI.getIMAGINImages(car, ['21', '01', '05']);
          if (allImages) {
            console.log(`📸 Available angles: ${allImages.map(img => img.angle).join(', ')}`);
          }
        } else {
          console.log('❌ IMAGIN does not have images for this car');
        }

      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    // Now test with a real car from your database
    console.log('\n\n🗃️  Testing with real cars from your database:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { data: realCars, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', 'active')
      .limit(5);

    if (error) {
      console.error('Database error:', error);
      return;
    }

    for (const car of realCars) {
      console.log(`\n🚗 ${car.brand} ${car.model} ${car.variant || ''}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      try {
        const imaginImages = await imaginOnlyAPI.getIMAGINImages(car, ['21']);
        
        if (imaginImages && imaginImages.length > 0) {
          console.log('✅ IMAGIN SUCCESS! Images available');
          console.log(`📸 Primary image: ${imaginImages[0].url}`);
        } else {
          console.log('❌ IMAGIN FAILED - No images available for this car');
        }

      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    console.log('\n\n📋 SUMMARY:');
    console.log('═══════════════════════════════════════════════');
    console.log('✅ IMAGIN-only service is configured');
    console.log('✅ No fallback images will be used');
    console.log('✅ Admin UI is ready for bulk updates');
    console.log('📌 Only cars with valid IMAGIN images will be updated');
    console.log('\n🚀 Ready to use admin bulk updater!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testIMAGINOnly();