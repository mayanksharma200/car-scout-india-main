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

async function runMigration() {
    try {
        const client = await pool.connect();
        console.log("Connected to database");

        console.log("Adding loan-related columns to 'leads' table...");
        await client.query(`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS employment_type VARCHAR(255),
      ADD COLUMN IF NOT EXISTS monthly_income NUMERIC,
      ADD COLUMN IF NOT EXISTS loan_amount NUMERIC,
      ADD COLUMN IF NOT EXISTS emi_amount NUMERIC,
      ADD COLUMN IF NOT EXISTS message TEXT;
    `);

        console.log("Successfully added columns: employment_type, monthly_income, loan_amount, emi_amount, message.");

        client.release();
    } catch (err) {
        console.error("Error running migration:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
