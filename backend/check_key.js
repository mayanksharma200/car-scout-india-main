import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const key = process.env.SUPABASE_SERVICE_KEY;
if (!key) {
    console.log("No SUPABASE_SERVICE_KEY found");
} else {
    try {
        const payload = JSON.parse(atob(key.split('.')[1]));
        console.log("Key Role:", payload.role);
    } catch (e) {
        console.log("Invalid Key format");
    }
}
