
import { createClient } from '@supabase/supabase-js';
import dotenv from './backend/node_modules/dotenv/lib/main.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCityCounts() {
    console.log('Checking city price distribution...');

    const cityColumns = [
        'mumbai_price',
        'delhi_price',
        'bangalore_price',
        'chennai_price',
        'hyderabad_price',
        'pune_price',
        'kolkata_price',
        'ahmedabad_price'
    ];

    const results = {};

    for (const col of cityColumns) {
        const { count, error } = await supabase
            .from('cars')
            .select('*', { count: 'exact', head: true })
            .not(col, 'is', null);

        if (error) {
            console.error(`Error checking ${col}:`, error.message);
        } else {
            results[col] = count;
        }
    }

    console.log('City Counts (Non-null prices):');
    console.table(results);
}

checkCityCounts();
