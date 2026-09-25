const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    cricApiId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    country: { type: String },
    role: { type: String }, // e.g., batsman, bowler, all-rounder, wk
    playerImg: { type: String },
    seriesIds: [{ type: String }],
    basePrice: { type: Number, default: 2000000 } // Default 20 lakhs
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
