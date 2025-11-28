import { query } from '../config/db.js';

async function testConnection() {
    try {
        console.log('Testing connection to AWS RDS...');
        const result = await query('SELECT NOW() as time');
        console.log('✅ Connection successful!');
        console.log('Server Time:', result.rows[0].time);
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err);
        process.exit(1);
    }
}

testConnection();
