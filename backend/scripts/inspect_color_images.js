import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

async function inspectImages() {
    try {
        const client = await pool.connect();
        console.log("Connected to database");

        const res = await client.query(`
            SELECT id, brand, model, color_variant_images 
            FROM cars 
            WHERE color_variant_images IS NOT NULL 
            AND color_variant_images::text != '{}' 
            AND color_variant_images::text != 'null'
            LIMIT 1
        `);

        if (res.rows.length > 0) {
            console.log("Found car with color_variant_images:");
            console.log(JSON.stringify(res.rows[0].color_variant_images, null, 2));
        } else {
            console.log("No cars found with color_variant_images");
        }

        client.release();
    } catch (err) {
        console.error("Error inspecting images:", err);
    } finally {
        await pool.end();
    }
}

inspectImages();
