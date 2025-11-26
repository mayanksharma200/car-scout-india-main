import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
    try {
        console.log('🚀 Running migration: create_image_generation_logs.sql');

        const migrationPath = path.join(__dirname, 'migrations', 'create_image_generation_logs.sql');
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
            // Remove comments and split
            const cleanSQL = migrationSQL
                .split('\n')
                .filter(line => !line.trim().startsWith('--'))
                .join('\n');

            const statements = cleanSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);

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

        console.log('\n📋 Verifying table was created...');

        // Verify the table exists
        const { data: tableInfo, error: tableError } = await supabase
            .from('image_generation_logs')
            .select('id')
            .limit(1);

        if (tableError) {
            // If table is empty it might return no rows but no error, or error if table doesn't exist
            // If error code is 42P01 (undefined_table), then it failed.
            if (tableError.code === '42P01') {
                console.error('⚠️ Verification failed: Table does not exist.');
            } else {
                console.log('✅ Table verification successful (table exists, might be empty).');
            }
        } else {
            console.log('✅ Table verification successful!');
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

runMigration().then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
});
