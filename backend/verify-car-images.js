import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function verifyCarImages() {
  try {
    console.log('🔍 Verifying car images after population...\n');

    // Get count of cars with updated images
    const { data: carsWithImages, count: totalWithImages } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .not('imagin_images', 'is', null)
      .eq('status', 'active');

    const { data: allCars, count: totalCars } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    console.log(`📊 Image Population Summary:`);
    console.log(`   Total active cars: ${totalCars}`);
    console.log(`   Cars with images: ${totalWithImages}`);
    console.log(`   Success rate: ${((totalWithImages / totalCars) * 100).toFixed(1)}%\n`);

    // Sample cars to show the results
    const { data: sampleCars } = await supabase
      .from('cars')
      .select('brand, model, variant, images, imagin_images')
      .not('imagin_images', 'is', null)
      .limit(10);

    console.log('🖼️  Sample Cars with New Images:');
    console.log('=====================================');
    
    sampleCars?.forEach((car, index) => {
      console.log(`\n${index + 1}. ${car.brand} ${car.model} ${car.variant || ''}`);
      console.log(`   📸 Images: ${car.images?.length || 0} URLs`);
      console.log(`   🔗 Primary: ${car.imagin_images?.primary?.substring(0, 80)}...`);
      console.log(`   📋 Source: ${car.imagin_images?.angles?.[0]?.source || 'Unknown'}`);
      console.log(`   ✅ Valid: ${car.imagin_images?.valid ? 'Yes' : 'No'}`);
    });

    // Check image sources breakdown
    const { data: allCarsWithImages } = await supabase
      .from('cars')
      .select('imagin_images')
      .not('imagin_images', 'is', null)
      .eq('status', 'active');

    if (allCarsWithImages) {
      const sourceCounts = {};
      allCarsWithImages.forEach(car => {
        const source = car.imagin_images?.angles?.[0]?.source || 'unknown';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      console.log('\n📈 Image Sources Breakdown:');
      console.log('============================');
      Object.entries(sourceCounts).forEach(([source, count]) => {
        const percentage = ((count / allCarsWithImages.length) * 100).toFixed(1);
        console.log(`   ${source}: ${count} cars (${percentage}%)`);
      });
    }

    console.log('\n✨ Verification completed! Your car images are now live! 🚗');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyCarImages();