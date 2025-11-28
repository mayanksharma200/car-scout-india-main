
import axios from 'axios';

async function testApi() {
    try {
        console.log('Testing /api/cars...');
        const response = await axios.get('http://localhost:8080/api/cars', {
            params: {
                status: 'active',
                limit: 500
            }
        });
        console.log('Success:', response.status);
        console.log('Data count:', response.data.data.length);
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message);
        if (error.response && error.response.data) {
            console.error('Error details:', error.response.data);
        }
    }
}

testApi();
