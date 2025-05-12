const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountType: { type: String, enum: ['user', 'artist'], default: 'user' },
    profile: {
        photo: String,
        bio: String,
        location: String,
        website: String
    },
    following: [String],
    followers: [String],
    likedContent: [{ type: mongoose.Schema.Types.Mixed }],
    createdAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }
});

// Album Schema
const albumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    coverImage: String,
    releaseYear: Number,
    genre: String,
    tracks: [{
        title: String,
        duration: String,
        audioFile: String
    }],
    createdAt: { type: Date, default: Date.now },
    likes: [String],
    plays: { type: Number, default: 0 }
});

// Playlist Schema
const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    creator: { type: String, required: true },
    coverImage: String,
    description: String,
    tracks: [{
        albumId: String,
        trackIndex: Number,
        addedAt: { type: Date, default: Date.now }
    }],
    isPublic: { type: Boolean, default: true },
    likes: [String],
    createdAt: { type: Date, default: Date.now }
});

// Feed Item Schema
const feedItemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user: {
        name: String,
        avatar: String
    },
    content: {
        type: { type: String, enum: ['album', 'playlist', 'track'] },
        title: String,
        description: String,
        image: String
    },
    time: { type: Date, default: Date.now },
    likes: [String],
    comments: [{
        id: String,
        username: String,
        userAvatar: String,
        text: String,
        time: Date,
        likes: [String]
    }]
});

// Create models
const User = mongoose.model('User', userSchema);
const Album = mongoose.model('Album', albumSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const FeedItem = mongoose.model('FeedItem', feedItemSchema);

// Function to initialize database
async function initializeDatabase() {
    try {
        // Check if collections exist
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);

        // Create collections if they don't exist
        if (!collectionNames.includes('users')) {
            await mongoose.connection.db.createCollection('users');
            console.log('✅ Users collection created');
        }

        if (!collectionNames.includes('albums')) {
            await mongoose.connection.db.createCollection('albums');
            console.log('✅ Albums collection created');
        }

        if (!collectionNames.includes('playlists')) {
            await mongoose.connection.db.createCollection('playlists');
            console.log('✅ Playlists collection created');
        }

        if (!collectionNames.includes('feeditems')) {
            await mongoose.connection.db.createCollection('feeditems');
            console.log('✅ Feed Items collection created');
        }

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    }
}

module.exports = {
    User,
    Album,
    Playlist,
    FeedItem,
    initializeDatabase
}; 