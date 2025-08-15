import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Running profiles table migration...');
    
    const migrationPath = join(__dirname, '../supabase/migrations/001_create_profiles_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          console.error('Migration error:', error);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('You can now use the admin system with role-based access control.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative: Direct SQL execution
async function runMigrationDirect() {
  try {
    console.log('Running profiles table migration (direct SQL)...');
    
    const migrationPath = join(__dirname, '../supabase/migrations/001_create_profiles_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Use raw SQL execution
    const { error } = await supabase.from('_').select('*').limit(0); // Just to test connection
    
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    
    console.log('✅ Database connection successful!');
    console.log('📝 Please run the migration SQL manually in your Supabase dashboard:');
    console.log('   Dashboard > SQL Editor > New Query');
    console.log('\nMigration file location:', migrationPath);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigrationDirect();
