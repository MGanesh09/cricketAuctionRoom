const mongoose = require('mongoose');

const fantasyPointsSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' }, // Reference to the match
    points: { type: Number, default: 0 },
    breakdown: { type: Object, default: {} } // Could store { playerId: pointsEarned }
}, { timestamps: true });

module.exports = mongoose.model('FantasyPoints', fantasyPointsSchema);
