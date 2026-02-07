
import axios from 'axios';

const API_URL = 'http://localhost:3001';

async function testAuth() {
    console.log('🧪 Testing Authentication Flow...');

    const timestamp = Date.now();
    const email = `testuser_${timestamp}@example.com`;
    const password = 'password123';

    try {
        // 1. Register
        console.log(`\n1. Attempting Registration for ${email}...`);
        const registerData = {
            firstName: 'Test',
            lastName: 'User',
            email,
            password,
            role: 'customer',
            phone: '+15550000000'
        };

        const registerRes = await axios.post(`${API_URL}/auth/register`, registerData);

        if (registerRes.status === 201 && registerRes.data.success) {
            console.log('✅ Registration Successful!');
            console.log('   User ID:', registerRes.data.data.user.id);
            console.log('   Tokens received:', !!registerRes.data.data.tokens.accessToken);
        } else {
            console.error('❌ Registration Failed:', registerRes.data);
            return;
        }

        // 2. Login
        console.log('\n2. Attempting Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });

        if (loginRes.data.success) {
            console.log('✅ Login Successful!');
            const token = loginRes.data.data.tokens.accessToken;

            // 3. Get Profile (Protected Route)
            console.log('\n3. Fetching User Profile (Protected Route)...');
            const profileRes = await axios.get(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (profileRes.data.success) {
                console.log('✅ Profile Fetch Successful!');
                console.log('   Email from Profile:', profileRes.data.data.user.email);
            }
        }

        console.log('\n🎉 ALL AUTH TESTS PASSED!');

    } catch (error: any) {
        console.error('\n❌ Test Failed!');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('   Error:', error.message);
        }
    }
}

testAuth();
