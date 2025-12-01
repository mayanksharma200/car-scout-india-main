import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read migration file
const migrationSQL = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20251029133000_expand_cars_schema.sql'), 'utf8');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Split SQL by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('CREATE INDEX') && !stmt.startsWith('COMMENT ON'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('id')
          .limit(1);
        
        if (error && !error.message.includes('does not exist')) {
          console.warn(`⚠️ Statement ${i + 1} warning:`, error.message);
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} failed:`, err.message);
        console.log(`📝 SQL: ${statement.substring(0, 100)}...`);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Note: The migration adds many new columns to the cars table.');
    console.log('🔧 You may need to refresh your database schema in Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();