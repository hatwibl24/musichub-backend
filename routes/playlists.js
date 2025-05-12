const express = require('express');
const router = express.Router();
const { Playlist } = require('../models/init-db');
const auth = require('../middleware/auth');

// Get all playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find();
        res.json(playlists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new playlist
router.post('/', auth, async (req, res) => {
    try {
        const { name, coverImage, description, tracks, isPublic } = req.body;
        
        const playlist = new Playlist({
            name,
            creator: req.user.userId,
            coverImage,
            description,
            tracks: tracks || [],
            isPublic: isPublic !== undefined ? isPublic : true
        });

        await playlist.save();
        res.status(201).json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get playlist by ID
router.get('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        res.json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update playlist
router.put('/:id', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check if user owns the playlist
        if (playlist.creator.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this playlist' });
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        res.json(updatedPlaylist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete playlist
router.delete('/:id', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check if user owns the playlist
        if (playlist.creator.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this playlist' });
        }

        await playlist.deleteOne();
        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add track to playlist
router.post('/:id/tracks', auth, async (req, res) => {
    try {
        const { albumId, trackIndex } = req.body;
        const playlist = await Playlist.findById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check if user owns the playlist
        if (playlist.creator.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify this playlist' });
        }

        playlist.tracks.push({
            albumId,
            trackIndex,
            addedAt: new Date()
        });

        await playlist.save();
        res.json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check if user owns the playlist
        if (playlist.creator.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify this playlist' });
        }

        playlist.tracks = playlist.tracks.filter(track => 
            track._id.toString() !== req.params.trackId
        );

        await playlist.save();
        res.json(playlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 