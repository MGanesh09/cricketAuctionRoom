const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    cricApiId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    matchType: { type: String },
    status: { type: String, default: 'upcoming' }, // upcoming, live, completed, cancelled
    date: { type: Date },
    venue: { type: String },
    teams: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
