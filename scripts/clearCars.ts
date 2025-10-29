/**
 * Clear All Cars Script
 *
 * This script removes all existing car data from the database
 * Run this before importing new car data
 */

import { createClient } from '@supabase/supabase-js';

// Supabase credentials - update these if needed
const supabaseUrl = 'https://uioyehbpjxcykvfnmcuk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpb3llaGJwanhjeWt2Zm5tY3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTY2ODQsImV4cCI6MjA3NDg5MjY4NH0.VIMuJ82tgqCTxeoI8ZdHBnKt23D_sKLtOJlJGSWWm3k';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllCars() {
  console.log('🗑️  Starting car data deletion...\n');

  try {
    // Get count before deletion
    const { count: beforeCount, error: countError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting car count:', countError);
      return;
    }

    console.log(`📊 Found ${beforeCount} cars in database`);

    if (beforeCount === 0) {
      console.log('✅ No cars to delete. Database is already empty.');
      return;
    }

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will delete all car data!');
    console.log('   This action cannot be undone.');
    console.log('\n   Proceeding in 3 seconds...');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // First, remove car references from leads to avoid foreign key constraint
    console.log('\n🔧 Removing car references from leads...');
    const { error: updateLeadsError } = await supabase
      .from('leads')
      .update({ interested_car_id: null })
      .not('interested_car_id', 'is', null);

    if (updateLeadsError) {
      console.error('❌ Error updating leads:', updateLeadsError);
      return;
    }

    // Delete all cars
    console.log('🗑️  Deleting all cars...');
    const { error: deleteError } = await supabase
      .from('cars')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.error('❌ Error deleting cars:', deleteError);
      return;
    }

    // Verify deletion
    const { count: afterCount, error: verifyError } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true });

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
      return;
    }

    console.log(`\n✅ Successfully deleted ${beforeCount} cars`);
    console.log(`📊 Remaining cars: ${afterCount}`);
    console.log('\n✨ Database is now ready for fresh data import!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Execute
clearAllCars()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
