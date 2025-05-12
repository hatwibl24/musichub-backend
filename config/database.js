const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { initializeDatabase } = require('../models/init-db');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://music-hubadmin:l5brHsAxY6P7kfEi@cluster0.caxtybj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const connectDB = async () => {
    try {
        // Connect using Mongoose
        await mongoose.connect(uri, options);
        console.log('✅ MongoDB connected successfully');

        // Initialize database with collections
        await initializeDatabase();
        console.log('✅ Database initialized with required collections');

        // Additional ping test
        const client = new MongoClient(uri, options);
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("✅ Pinged your deployment. Connection verified!");
        await client.close();
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = connectDB; 