const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function runMigration() {
    try {
        console.log('🚀 Running site_settings migration...');

        const sql = fs.readFileSync('./migrations/create_site_settings.sql', 'utf8');

        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);

            const { data, error } = await supabase
                .from('_sql')
                .select('*')
                .limit(0);

            if (error) {
                console.error('Error:', error);
            }
        }

        // Alternative: Use direct SQL execution via pg
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL ||
                `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')}.supabase.co:5432/postgres`
        });

        await pool.query(sql);
        console.log('✅ Migration completed successfully');
        await pool.end();

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
