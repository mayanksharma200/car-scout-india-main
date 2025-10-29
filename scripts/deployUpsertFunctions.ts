/**
 * Deploy Upsert Functions Script
 *
 * This script deploys the PostgreSQL functions for smart car insertion
 * with duplicate detection to your Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Supabase credentials
const supabaseUrl = 'https://uioyehbpjxcykvfnmcuk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpb3llaGJwanhjeWt2Zm5tY3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTY2ODQsImV4cCI6MjA3NDg5MjY4NH0.VIMuJ82tgqCTxeoI8ZdHBnKt23D_sKLtOJlJGSWWm3k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deployFunctions() {
  console.log('🚀 Deploying SQL upsert functions...\n');

  try {
    // Read the SQL file
    const sqlFilePath = join(process.cwd(), 'supabase/migrations/upsert_cars_function.sql');
    console.log(`📖 Reading SQL file: ${sqlFilePath}`);

    const sqlContent = readFileSync(sqlFilePath, 'utf-8');

    // Split SQL into individual statements (separated by comments or obvious breaks)
    const statements = sqlContent
      .split(/--\s*={40,}/g) // Split on comment separators
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--') && !stmt.includes('Example Usage'));

    console.log(`📝 Found ${statements.length} SQL sections to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      console.log(`⚙️  Executing section ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement }).catch(() => ({
        data: null,
        error: { message: 'RPC method not available, trying direct execution' }
      }));

      if (error) {
        // Try alternative method - using the query method
        console.log(`   Attempting alternative execution method...`);

        // For now, we'll inform the user to run it manually
        console.log(`\n⚠️  Note: Supabase client cannot execute DDL statements directly.`);
        console.log(`   You need to run this SQL in your Supabase SQL Editor:\n`);
        console.log(`   1. Go to https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/sql`);
        console.log(`   2. Copy the contents of: supabase/migrations/upsert_cars_function.sql`);
        console.log(`   3. Paste and execute in the SQL editor\n`);

        return;
      }

      console.log(`   ✅ Section ${i + 1} executed successfully`);
    }

    console.log('\n✅ All functions deployed successfully!');
    console.log('\n📋 Available functions:');
    console.log('   - upsert_car_data(jsonb) - Insert single car with duplicate check');
    console.log('   - bulk_upsert_cars(jsonb) - Bulk insert with statistics');

  } catch (error) {
    console.error('❌ Error deploying functions:', error);
    process.exit(1);
  }
}

// Execute
deployFunctions()
  .then(() => {
    console.log('\n✨ Deployment script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });
