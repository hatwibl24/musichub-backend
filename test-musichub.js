const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://music-hubadmin:l5brHsAxY6P7kfEi@cluster0.caxtybj.mongodb.net/");
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dfxumfggj',
  api_key: '956321388789384',
  api_secret: 'o30vwQGJz0i05NZDFnQqNI1HOKY'
});

// Test Cloudinary connection
const testCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary Connection Test: PASSED');
    console.log('Connection result:', result);
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
  }
};

// Test MongoDB and Cloudinary integration
const runTest = async () => {
  try {
    console.log('Testing MusicHub integrations...');
    
    // Test MongoDB connection
    await connectDB();
    
    // Test Cloudinary connection
    await testCloudinary();
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
  }
};

runTest(); 