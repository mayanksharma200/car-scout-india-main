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

async function checkCounts() {
    try {
        const client = await pool.connect();
        console.log("Connected to database");

        const tables = ['cars', 'leads', 'profiles', 'admin_activities'];

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`${table}: ${res.rows[0].count}`);
            } catch (e) {
                console.log(`${table}: Error - ${e.message}`);
            }
        }

        client.release();
    } catch (err) {
        console.error("Error connecting:", err);
    } finally {
        await pool.end();
    }
}

checkCounts();
