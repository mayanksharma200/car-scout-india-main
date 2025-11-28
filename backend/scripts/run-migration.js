import { query, getClient } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const client = await getClient();
    try {
        console.log('🚀 Starting migration...');

        const schemaPath = path.join(__dirname, '../migrations/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Reading schema.sql...');

        await client.query('BEGIN');
        await client.query(schemaSql);
        await client.query('COMMIT');

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

runMigration();
