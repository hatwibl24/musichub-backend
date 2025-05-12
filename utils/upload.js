const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Upload functions for different file types
const uploadUtils = {
    // Upload profile photo
    async uploadProfilePhoto(file) {
        try {
            const result = await cloudinary.uploader.upload(file.buffer, {
                folder: 'profile-photos',
                resource_type: 'image',
                format: 'jpg',
                transformation: [
                    { width: 400, height: 400, crop: 'fill' },
                    { quality: 'auto' }
                ]
            });
            return result.secure_url;
        } catch (error) {
            console.error('Profile photo upload error:', error);
            throw error;
        }
    },

    // Upload song file
    async uploadSong(file) {
        try {
            const result = await cloudinary.uploader.upload(file.buffer, {
                folder: 'songs',
                resource_type: 'video', // Cloudinary uses 'video' for audio files
                format: 'mp3',
                transformation: [
                    { quality: 'auto' }
                ]
            });
            return {
                url: result.secure_url,
                duration: result.duration,
                format: result.format,
                bytes: result.bytes
            };
        } catch (error) {
            console.error('Song upload error:', error);
            throw error;
        }
    },

    // Upload cover art (for songs, albums, or playlists)
    async uploadCoverArt(file) {
        try {
            const result = await cloudinary.uploader.upload(file.buffer, {
                folder: 'covers',
                resource_type: 'image',
                format: 'jpg',
                transformation: [
                    { width: 500, height: 500, crop: 'fill' },
                    { quality: 'auto' }
                ]
            });
            return result.secure_url;
        } catch (error) {
            console.error('Cover art upload error:', error);
            throw error;
        }
    },

    // Delete file from Cloudinary
    async deleteFile(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('File deletion error:', error);
            throw error;
        }
    },

    // Get public ID from Cloudinary URL
    getPublicId(url) {
        try {
            const parts = url.split('/');
            const filename = parts[parts.length - 1];
            return filename.split('.')[0];
        } catch (error) {
            console.error('Error getting public ID:', error);
            return null;
        }
    }
};

module.exports = {
    upload,
    uploadUtils
}; 