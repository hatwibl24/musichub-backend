const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.MONGODB_URI = process.env.MONGODB_URI;
        this.options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
    }

    async connect() {
        try {
            if (mongoose.connection.readyState === 1) {
                console.log('MongoDB is already connected');
                return;
            }

            await mongoose.connect(this.MONGODB_URI, this.options);
            
            mongoose.connection.on('connected', () => {
                console.log('MongoDB connected successfully');
            });

            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
            });

            // Handle process termination
            process.on('SIGINT', this.closeConnection.bind(this));
            process.on('SIGTERM', this.closeConnection.bind(this));
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            process.exit(1);
        }
    }

    async closeConnection() {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
            process.exit(1);
        }
    }

    // Get current connection state
    getConnectionState() {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
            99: 'uninitialized'
        };
        return states[mongoose.connection.readyState];
    }

    // Check if connected
    isConnected() {
        return mongoose.connection.readyState === 1;
    }
}

module.exports = new DatabaseConnection(); 