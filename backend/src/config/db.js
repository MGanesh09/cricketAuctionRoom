const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cricketAuction';
        await mongoose.connect(uri);
        console.log(`MongoDB Connected successfully to ${uri}`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Do not crash process immediately if running in dev; retry or exit
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;

