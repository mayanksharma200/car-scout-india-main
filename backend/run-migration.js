import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  try {
    console.log('🚀 Running migration: add_ideogram_images_column.sql');

    const migrationPath = path.join(__dirname, 'migrations', 'add_ideogram_images_column.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Migration SQL loaded');

    // Execute the migration using Supabase SQL function
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);

      // Try alternative method - execute statements one by one
      console.log('🔄 Trying alternative method...');

      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📝 Executing ${statements.length} SQL statements...`);

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt) {
          console.log(`  ${i + 1}/${statements.length}: Executing statement...`);

          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: stmt + ';'
          });

          if (stmtError) {
            console.error(`  ❌ Statement ${i + 1} failed:`, stmtError.message);
          } else {
            console.log(`  ✅ Statement ${i + 1} executed successfully`);
          }
        }
      }
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('📊 Result:', data);
    }

    console.log('\n📋 Verifying column was added...');

    // Verify the column exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('cars')
      .select('ideogram_images')
      .limit(1);

    if (tableError) {
      console.error('⚠️ Verification warning:', tableError.message);
      console.log('\n💡 The column might already exist or the migration may need to be run manually.');
      console.log('\nTo run manually, execute the following in your Supabase SQL editor:');
      console.log('----------------------------------------');
      console.log(migrationSQL);
      console.log('----------------------------------------');
    } else {
      console.log('✅ Column verification successful!');
      console.log('🎉 Migration completed and verified!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('\n💡 Please run the migration manually in Supabase SQL editor.');
    console.log('Migration file location:', path.join(__dirname, 'migrations', 'add_ideogram_images_column.sql'));
  }
}

runMigration().then(() => {
  console.log('\n✅ Migration script completed');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Migration script failed:', error);
  process.exit(1);
});
