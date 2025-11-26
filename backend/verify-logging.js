import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function verifyLogging() {
    try {
        console.log('🚀 Verifying image_generation_logs table...');

        const testLog = {
            source: 'test_verification',
            image_count: 1,
            cost: 0.03,
            metadata: { test: true },
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('image_generation_logs')
            .insert([testLog])
            .select();

        if (error) {
            console.error('❌ Insertion failed:', error);
        } else {
            console.log('✅ Insertion successful:', data);

            // Clean up
            const { error: deleteError } = await supabase
                .from('image_generation_logs')
                .delete()
                .eq('id', data[0].id);

            if (deleteError) {
                console.warn('⚠️ Failed to clean up test log:', deleteError);
            } else {
                console.log('✅ Test log cleaned up');
            }
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

verifyLogging();
