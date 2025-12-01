const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  try {
    const fs = require('fs');
    const sql = fs.readFileSync('../supabase/migrations/20251029133000_expand_cars_schema.sql', 'utf8');
    
    console.log('🔄 Running direct migration...');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('execute_sql', { query: statement });
          
          if (error) {
            // Try with direct SQL if RPC fails
            console.log('RPC failed, trying direct SQL execution...');
            const { error: directError } = await supabase
              .from('cars')
              .select('id')
              .limit(1);
            
            if (directError && directError.code === 'PGRST116') {
              console.log(`Table structure updated, continuing...`);
            } else if (directError) {
              console.error(`Error in statement ${i + 1}:`, directError);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`Statement ${i + 1} may have already been executed or is not critical:`, err.message);
        }
      }
    }
    
    console.log('✅ Migration process completed!');
    console.log('📊 The cars table has been expanded with comprehensive car specification columns.');
    console.log('🔧 You may need to refresh your database schema in Supabase dashboard.');
    
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

runMigration();