const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure cloudinary with credentials
cloudinary.config({
  cloud_name: 'dfxumfggj',
  api_key: '956321388789384',
  api_secret: 'o30vwQGJz0i05NZDFnQqNI1HOKY'
});

// Test image upload
async function uploadImage() {
  try {
    // You can replace this with an actual image path
    const imagePath = path.join(__dirname, 'test-files', 'sample-image.jpg');
    
    if (!fs.existsSync(imagePath)) {
      console.log('❌ Test image not found. Please place a sample image at:', imagePath);
      return;
    }

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'musichub/test',
      resource_type: 'image'
    });

    console.log('✅ Image uploaded successfully!');
    console.log('Image URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  } catch (error) {
    console.error('❌ Error uploading image:', error.message);
  }
}

// Test audio upload
async function uploadAudio() {
  try {
    // You can replace this with an actual audio file path
    const audioPath = path.join(__dirname, 'test-files', 'sample-audio.mp3');
    
    if (!fs.existsSync(audioPath)) {
      console.log('❌ Test audio not found. Please place a sample audio at:', audioPath);
      return;
    }

    const result = await cloudinary.uploader.upload(audioPath, {
      folder: 'musichub/test',
      resource_type: 'video', // Cloudinary uses 'video' for audio files
      use_filename: true
    });

    console.log('✅ Audio uploaded successfully!');
    console.log('Audio URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
  } catch (error) {
    console.error('❌ Error uploading audio:', error.message);
  }
}

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, 'test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
  console.log('Created test-files directory. Please add sample files there.');
}

// Run the tests
async function runTests() {
  console.log('Testing Cloudinary uploads...');
  await uploadImage();
  await uploadAudio();
}

runTests(); 