import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import IMAGINAPIService from './services/imaginAPI.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const imaginAPI = new IMAGINAPIService();

async function testImageGeneration() {
  try {
    console.log('🔍 Testing IMAGIN.studio integration...\n');

    // Check environment
    console.log('Environment Variables:');
    console.log('IMAGIN_CUSTOMER_KEY:', process.env.IMAGIN_CUSTOMER_KEY ? '✅ Set' : '❌ Missing');
    console.log('IMAGIN_TAILORING_KEY:', process.env.IMAGIN_TAILORING_KEY ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');

    // Get a few cars from database
    console.log('\n📊 Checking cars in database...');
    const { data: cars, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', 'active')
      .limit(3);

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log(`Found ${cars.length} cars:`);
    cars.forEach((car, index) => {
      console.log(`${index + 1}. ${car.brand} ${car.model} ${car.variant || ''} (ID: ${car.id})`);
      console.log(`   Current images: ${car.images ? JSON.stringify(car.images) : 'None'}`);
      console.log(`   IMAGIN images: ${car.imagin_images ? 'Exists' : 'Missing'}`);
    });

    if (cars.length === 0) {
      console.log('❌ No cars found in database');
      return;
    }

    // Test image generation for first car
    const testCar = cars[0];
    console.log(`\n🖼️  Generating images for: ${testCar.brand} ${testCar.model} ${testCar.variant || ''}`);

    // Generate image URL
    const imageURL = imaginAPI.generateCarImageURL(testCar);
    console.log('Generated URL:', imageURL);

    // Test if image is valid
    console.log('Testing image availability...');
    const isValid = await imaginAPI.validateImage(imageURL);
    console.log('Image valid:', isValid ? '✅ Yes' : '❌ No');

    if (isValid) {
      // Update the car with the new image
      console.log('Updating car with new image...');
      const { error: updateError } = await supabase
        .from('cars')
        .update({
          images: [imageURL],
          imagin_images: {
            primary: imageURL,
            angles: [{ angle: '21', url: imageURL }],
            last_updated: new Date().toISOString(),
            valid: true,
            fallback: false
          },
          image_last_updated: new Date().toISOString()
        })
        .eq('id', testCar.id);

      if (updateError) {
        console.error('❌ Update error:', updateError);
      } else {
        console.log('✅ Car updated successfully!');
        
        // Verify update
        const { data: updatedCar } = await supabase
          .from('cars')
          .select('images, imagin_images')
          .eq('id', testCar.id)
          .single();
          
        console.log('Updated car images:', updatedCar?.images);
        console.log('Updated IMAGIN data:', updatedCar?.imagin_images);
      }
    }

    console.log('\n✨ Test completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testImageGeneration();