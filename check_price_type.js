
import { createClient } from '@supabase/supabase-js';
import dotenv from './backend/node_modules/dotenv/lib/main.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPriceType() {
    console.log('Checking price_min data types...');

    const { data, error } = await supabase
        .from('cars')
        .select('id, brand, price_min, price_max')
        .limit(5);

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Sample Data:');
        data.forEach(car => {
            console.log(`ID: ${car.id}`);
            console.log(`Brand: ${car.brand}`);
            console.log(`price_min: ${car.price_min} (Type: ${typeof car.price_min})`);
            console.log(`price_max: ${car.price_max} (Type: ${typeof car.price_max})`);
            console.log('---');
        });
    } else {
        console.log('No cars found.');
    }
}

checkPriceType();
