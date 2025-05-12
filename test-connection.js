const connectDB = require('./config/database');
const cloudinary = require('./config/cloudinary');
require('dotenv').config();

async function testConnections() {
    try {
        // Test MongoDB Connection
        await connectDB();
        console.log('✅ MongoDB Connected Successfully');

        // Test Cloudinary Connection
        const cloudinaryTest = await cloudinary.api.ping();
        console.log('✅ Cloudinary Connected Successfully');
        
    } catch (error) {
        console.error('❌ Connection Test Failed:', error);
        process.exit(1);
    }
}

testConnections(); 