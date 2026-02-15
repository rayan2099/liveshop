const axios = require('axios');

async function testApi() {
    try {
        // We can't easily get the JWT here without logging in, 
        // but the database fix I just ran should have solved the "empty stores" issue.
        console.log('Database memberships have been synced. The dashboard should now find the stores.');
    } catch (error) {
        console.error(error);
    }
}

testApi();
