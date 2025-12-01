import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

async function testSql() {
    try {
        const client = await pool.connect();
        console.log("Connected to database");

        // Query to select car ID and calculated image count
        const query = `
            SELECT 
                id, 
                brand, 
                model,
                (
                    COALESCE(array_length(images, 1), 0) + 
                    COALESCE((
                        SELECT COUNT(*)
                        FROM jsonb_each(color_variant_images) AS color
                        CROSS JOIN LATERAL jsonb_object_keys(color.value -> 'images')
                    ), 0)
                ) as total_image_count
            FROM cars 
            WHERE color_variant_images IS NOT NULL 
            AND color_variant_images::text != '{}'
            LIMIT 5;
        `;

        const res = await client.query(query);
        console.table(res.rows);

        client.release();
    } catch (err) {
        console.error("Error testing SQL:", err);
    } finally {
        await pool.end();
    }
}

testSql();
