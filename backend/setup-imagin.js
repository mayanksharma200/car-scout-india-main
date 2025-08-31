import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { populateCarImages, ensureImageColumns } from './scripts/populate-car-images.js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function setupIMAGINIntegration() {
  console.log('🎬 IMAGIN.studio Integration Setup');
  console.log('==================================\n');

  // Step 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
    'IMAGIN_CUSTOMER_KEY',
    'IMAGIN_TAILORING_KEY'
  ];

  let envVarsMissing = false;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`   ❌ Missing: ${envVar}`);
      envVarsMissing = true;
    } else {
      console.log(`   ✅ Found: ${envVar}`);
    }
  }

  if (envVarsMissing) {
    console.log('\n⚠️  Environment variables missing!');
    console.log('Please add the missing variables to your .env file.');
    console.log('Check .env.example for reference.\n');
  } else {
    console.log('   ✅ All environment variables found!\n');
  }

  // Step 2: Check database connection
  console.log('2️⃣ Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`   ❌ Database connection failed: ${error.message}`);
      return;
    }
    console.log('   ✅ Database connection successful!\n');
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
    return;
  }

  // Step 3: Ensure database columns exist
  console.log('3️⃣ Ensuring image columns exist...');
  const columnsReady = await ensureImageColumns();
  if (!columnsReady) {
    return;
  }

  // Step 4: Check existing cars
  console.log('4️⃣ Checking existing cars...');
  const { data: cars, count, error } = await supabase
    .from('cars')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (error) {
    console.log(`   ❌ Error checking cars: ${error.message}`);
    return;
  }

  console.log(`   📊 Found ${count} active cars in database\n`);

  // Step 5: Show next steps
  console.log('5️⃣ Next Steps:');
  console.log('\n🔧 Database Setup (if columns were missing):');
  console.log('   1. Go to your Supabase SQL Editor');
  console.log('   2. Run the SQL commands shown above');
  console.log('   3. Come back and run this script again');

  console.log('\n🖼️  Image Population:');
  console.log('   • Run: node scripts/populate-car-images.js');
  console.log('   • Or use the API endpoints:');
  console.log('     - GET /api/cars/:id/images/generate');
  console.log('     - POST /api/cars/images/generate-bulk');

  console.log('\n🌐 Frontend Integration:');
  console.log('   • Car images will be available in the "images" array');
  console.log('   • IMAGIN-specific data in "imagin_images" field');
  console.log('   • Use imagin_images.primary for the main car image');

  console.log('\n📋 Test the Integration:');
  console.log('   1. Start your backend: npm run dev');
  console.log('   2. Test endpoint: GET http://localhost:3001/api/cars/:id/images/generate');
  console.log('   3. Check car data: GET http://localhost:3001/api/cars/:id');

  if (!envVarsMissing) {
    console.log('\n🚀 Ready to populate images!');
    console.log('Run: node scripts/populate-car-images.js');
  }

  console.log('\n✨ IMAGIN.studio integration setup complete!');
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupIMAGINIntegration().catch(console.error);
}