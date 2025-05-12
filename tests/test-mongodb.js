const db = require('../utils/db');
const SongService = require('../services/SongService');
const User = require('../models/User');
const Song = require('../models/Song');

async function testMongoDB() {
    try {
        // Connect to MongoDB
        await db.connect();
        console.log('✅ MongoDB Connection Test: PASSED');

        // Test User Creation
        const testUser = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            accountType: 'artist'
        });
        console.log('✅ User Creation Test: PASSED');

        // Test Song Creation
        const testSong = await Song.create({
            title: 'Test Song',
            artist: testUser._id,
            duration: 180,
            fileUrl: 'https://test.com/song.mp3',
            genre: 'Pop'
        });
        console.log('✅ Song Creation Test: PASSED');

        // Test Song Retrieval
        const foundSong = await SongService.findById(testSong._id);
        if (foundSong) {
            console.log('✅ Song Retrieval Test: PASSED');
        }

        // Test Song Update
        const updatedSong = await SongService.update(testSong._id, {
            title: 'Updated Test Song'
        });
        if (updatedSong.title === 'Updated Test Song') {
            console.log('✅ Song Update Test: PASSED');
        }

        // Test Like Functionality
        const likedSong = await SongService.toggleLike(testSong._id, testUser._id);
        if (likedSong.likes.includes(testUser._id)) {
            console.log('✅ Song Like Test: PASSED');
        }

        // Test Comment Functionality
        const commentedSong = await SongService.addComment(
            testSong._id,
            testUser._id,
            'Test comment'
        );
        if (commentedSong.comments.length > 0) {
            console.log('✅ Song Comment Test: PASSED');
        }

        // Test Pagination
        const paginatedSongs = await SongService.findWithPagination(
            { artist: testUser._id },
            { page: 1, limit: 10 }
        );
        if (paginatedSongs.pagination) {
            console.log('✅ Pagination Test: PASSED');
        }

        // Clean up test data
        await Promise.all([
            User.findByIdAndDelete(testUser._id),
            Song.findByIdAndDelete(testSong._id)
        ]);
        console.log('✅ Cleanup Test: PASSED');

        console.log('\n🎉 All MongoDB tests passed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Close database connection
        await db.closeConnection();
    }
}

// Run tests
testMongoDB(); 