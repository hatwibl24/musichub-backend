const express = require('express');
const router = express.Router();
const { upload, uploadUtils } = require('../utils/upload');
const auth = require('../middleware/auth');

// Upload profile photo
router.post('/profile-photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const photoUrl = await uploadUtils.uploadProfilePhoto(req.file);
        
        // Update user profile in database
        await User.findByIdAndUpdate(req.user.userId, { profilePhoto: photoUrl });

        res.json({ url: photoUrl });
    } catch (error) {
        console.error('Profile photo upload error:', error);
        res.status(500).json({ message: 'Error uploading profile photo' });
    }
});

// Upload song with cover
router.post('/song', auth, upload.fields([
    { name: 'song', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files.song) {
            return res.status(400).json({ message: 'No song file uploaded' });
        }

        // Upload song
        const songData = await uploadUtils.uploadSong(req.files.song[0]);
        
        // Upload cover if provided
        let coverUrl = 'default-cover.jpg';
        if (req.files.cover) {
            coverUrl = await uploadUtils.uploadCoverArt(req.files.cover[0]);
        }

        // Create song record in database
        const song = await Song.create({
            title: req.body.title,
            artist: req.user.userId,
            fileUrl: songData.url,
            duration: songData.duration,
            coverArt: coverUrl,
            genre: req.body.genre
        });

        res.status(201).json({ song });
    } catch (error) {
        console.error('Song upload error:', error);
        res.status(500).json({ message: 'Error uploading song' });
    }
});

// Upload album cover
router.post('/album-cover', auth, upload.single('cover'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const coverUrl = await uploadUtils.uploadCoverArt(req.file);
        res.json({ url: coverUrl });
    } catch (error) {
        console.error('Album cover upload error:', error);
        res.status(500).json({ message: 'Error uploading album cover' });
    }
});

// Upload playlist cover
router.post('/playlist-cover', auth, upload.single('cover'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const coverUrl = await uploadUtils.uploadCoverArt(req.file);
        res.json({ url: coverUrl });
    } catch (error) {
        console.error('Playlist cover upload error:', error);
        res.status(500).json({ message: 'Error uploading playlist cover' });
    }
});

// Delete file from Cloudinary
router.delete('/file', auth, async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        const publicId = uploadUtils.getPublicId(url);
        if (publicId) {
            await uploadUtils.deleteFile(publicId);
            res.json({ message: 'File deleted successfully' });
        } else {
            res.status(400).json({ message: 'Invalid URL' });
        }
    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ message: 'Error deleting file' });
    }
});

module.exports = router; 