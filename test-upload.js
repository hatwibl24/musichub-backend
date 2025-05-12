const { uploadUtils } = require('./utils/upload');
const fs = require('fs');
const path = require('path');

async function testUploads() {
    try {
        // Create test files directory if it doesn't exist
        const testDir = path.join(__dirname, 'test-files');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir);
        }

        // Test profile photo upload
        const testImagePath = path.join(testDir, 'test-profile.jpg');
        if (fs.existsSync(testImagePath)) {
            const imageBuffer = fs.readFileSync(testImagePath);
            const profileUrl = await uploadUtils.uploadProfilePhoto({
                buffer: imageBuffer
            });
            console.log('✅ Profile photo uploaded:', profileUrl);
        }

        // Test song upload
        const testSongPath = path.join(testDir, 'test-song.mp3');
        if (fs.existsSync(testSongPath)) {
            const songBuffer = fs.readFileSync(testSongPath);
            const songData = await uploadUtils.uploadSong({
                buffer: songBuffer
            });
            console.log('✅ Song uploaded:', songData);
        }

        // Test cover art upload
        const testCoverPath = path.join(testDir, 'test-cover.jpg');
        if (fs.existsSync(testCoverPath)) {
            const coverBuffer = fs.readFileSync(testCoverPath);
            const coverUrl = await uploadUtils.uploadCoverArt({
                buffer: coverBuffer
            });
            console.log('✅ Cover art uploaded:', coverUrl);
        }

        console.log('\n🎉 All upload tests completed successfully!');
    } catch (error) {
        console.error('❌ Upload test failed:', error);
    }
}

testUploads(); 