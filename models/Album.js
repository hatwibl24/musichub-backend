const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: String,
    coverArt: {
        type: String,
        default: 'default-album-cover.jpg'
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    releaseDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    genre: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Index for search functionality
albumSchema.index({ title: 'text', genre: 'text' });

module.exports = mongoose.model('Album', albumSchema); 