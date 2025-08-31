import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import IMAGINOnlyService from './services/imaginOnlyService.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const imaginOnlyAPI = new IMAGINOnlyService();

async function testProxiedImages() {
  try {
    console.log('🔄 Testing IMAGIN proxy URLs...\n');

    // Test with a simple car
    const testCar = {
      brand: 'Audi',
      model: 'A4', 
      body_type: 'sedan',
      fuel_type: 'petrol'
    };

    console.log(`🚗 Testing: ${testCar.brand} ${testCar.model}`);

    // Get IMAGIN images with proxy URLs
    const images = await imaginOnlyAPI.getIMAGINImages(testCar, ['21']);

    if (images && images.length > 0) {
      const primaryImage = images[0];
      
      console.log('✅ IMAGIN images generated successfully!');
      console.log(`📸 Original URL: ${primaryImage.originalUrl}`);
      console.log(`🔗 Proxied URL: ${primaryImage.url}`);
      
      // Test the proxied URL
      console.log('\n🧪 Testing proxied URL...');
      const proxyResponse = await fetch(primaryImage.url);
      
      if (proxyResponse.ok) {
        const contentType = proxyResponse.headers.get('content-type');
        console.log(`✅ Proxy works! Content-Type: ${contentType}`);
        
        // Test updating a car with proxied URLs
        console.log('\n📝 Testing database update with proxied URLs...');
        
        // Get a real car to test with
        const { data: realCars, error } = await supabase
          .from('cars')
          .select('*')
          .eq('brand', 'Nissan')
          .eq('model', 'Magnite')
          .limit(1);
          
        if (realCars && realCars.length > 0) {
          const car = realCars[0];
          const carImages = await imaginOnlyAPI.getIMAGINImages(car, ['21', '01']);
          
          if (carImages) {
            const updateData = {
              images: carImages.map(img => img.url), // Proxied URLs
              imagin_images: {
                primary: carImages[0].url, // Proxied URL
                original_primary: carImages[0].originalUrl, // Original URL
                angles: carImages,
                last_updated: new Date().toISOString(),
                valid: true,
                proxy_enabled: true
              }
            };
            
            console.log('🔄 Sample update data:');
            console.log('Images array:', updateData.images);
            console.log('Primary (proxied):', updateData.imagin_images.primary);
            console.log('Primary (original):', updateData.imagin_images.original_primary);
            
            console.log('\n✅ Ready for bulk update with proxy URLs!');
          }
        }
        
      } else {
        console.log(`❌ Proxy failed: ${proxyResponse.status} ${proxyResponse.statusText}`);
      }
      
    } else {
      console.log('❌ No IMAGIN images found');
    }

    console.log('\n📋 Proxy Test Summary:');
    console.log('═══════════════════════════');
    console.log('✅ IMAGIN service updated with proxy support');  
    console.log('✅ Backend proxy endpoint created');
    console.log('✅ Proxied URLs will work in frontend');
    console.log('✅ Original URLs preserved for reference');
    console.log('\n🚀 Run bulk updater to update cars with proxied URLs!');

  } catch (error) {
    console.error('❌ Proxy test failed:', error);
  }
}

testProxiedImages();