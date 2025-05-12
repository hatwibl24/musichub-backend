const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middleware/auth');
const { Album, User } = require('../models/init-db');

// Configure Cloudinary storage for audio files
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'musichub/songs',
    resource_type: 'video', // Cloudinary uses 'video' for audio files
    allowed_formats: ['mp3', 'wav', 'ogg'],
    use_filename: true
  }
});

// Configure Cloudinary storage for cover art
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'musichub/covers',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }]
  }
});

const uploadAudio = multer({ storage: audioStorage });
const uploadImage = multer({ storage: imageStorage });

// Get all songs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const songs = await Song.find()
      .populate('artist', 'username profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Song.countDocuments();

    res.json({
      songs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get song by ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist', 'username profilePhoto')
      .populate('album', 'title coverArt');

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Increment play count
    song.plays += 1;
    await song.save();

    res.json(song);
  } catch (error) {
    console.error('Error fetching song:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload a new song (requires authentication)
router.post('/', auth, uploadAudio.single('audioFile'), uploadImage.single('coverArt'), async (req, res) => {
  try {
    const { title, genre, albumId } = req.body;
    const duration = parseFloat(req.body.duration);

    if (!req.files || !req.files.audioFile) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const newSong = new Song({
      title,
      artist: req.user.id,
      album: albumId || null,
      duration,
      fileUrl: req.files.audioFile.path,
      coverArt: req.files.coverArt ? req.files.coverArt.path : 'default-cover.jpg',
      genre
    });

    await newSong.save();

    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error uploading song:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike a song
router.put('/like/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Check if already liked
    const likeIndex = song.likes.findIndex(
      like => like.toString() === req.user.id
    );

    if (likeIndex === -1) {
      // Add like
      song.likes.push(req.user.id);
    } else {
      // Remove like
      song.likes.splice(likeIndex, 1);
    }

    await song.save();
    res.json({ likes: song.likes });
  } catch (error) {
    console.error('Error liking song:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a song (artist only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Check if user is the song owner
    if (song.artist.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete from Cloudinary
    if (song.fileUrl) {
      const publicId = song.fileUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`musichub/songs/${publicId}`, { resource_type: 'video' });
    }
    
    if (song.coverArt && !song.coverArt.includes('default-cover')) {
      const publicId = song.coverArt.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`musichub/covers/${publicId}`);
    }

    await song.remove();
    res.json({ message: 'Song removed' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all songs/albums
router.get('/albums', async (req, res) => {
    try {
        const albums = await Album.find();
        res.json(albums);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new album
router.post('/', auth, uploadImage.single('coverImage'), async (req, res) => {
    try {
        const { title, artist, releaseYear, genre, tracks } = req.body;
        
        const album = new Album({
            title,
            artist,
            coverImage: req.file ? req.file.path : undefined,
            releaseYear,
            genre,
            tracks: JSON.parse(tracks)
        });

        await album.save();
        res.status(201).json(album);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get album by ID
router.get('/:id', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }
        res.json(album);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update album
router.put('/:id', auth, uploadImage.single('coverImage'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.coverImage = req.file.path;
        }
        if (req.body.tracks) {
            updateData.tracks = JSON.parse(req.body.tracks);
        }

        const album = await Album.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }
        res.json(album);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete album
router.delete('/:id', auth, async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        // Delete cover image from Cloudinary if it exists
        if (album.coverImage) {
            const publicId = album.coverImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`musichub/covers/${publicId}`);
        }

        // Delete audio files from Cloudinary if they exist
        for (const track of album.tracks) {
            if (track.audioFile) {
                const publicId = track.audioFile.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`musichub/songs/${publicId}`, { resource_type: 'video' });
            }
        }

        await album.deleteOne();
        res.json({ message: 'Album deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 