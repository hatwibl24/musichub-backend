const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// First, let's log the environment variables
console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '****' : undefined);

// Configure cloudinary with your credentials
cloudinary.config({
    cloud_name: 'dfxumfggj',
    api_key: '956321388789384',
    api_secret: 'o30vwQGJz0i05NZDFnQqNI1HOKY'
});

// Test the connection
async function testCloudinary() {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Connection Test: PASSED');
        console.log('Connection result:', result);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testCloudinary(); 