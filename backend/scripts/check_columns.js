
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkColumns() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'cars'
      AND column_name IN ('images', 'color_variant_images', 'image_last_updated');
    `);
        console.log('Column types:', res.rows);
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkColumns();
