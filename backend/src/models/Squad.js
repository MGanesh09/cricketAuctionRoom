const mongoose = require('mongoose');

const squadSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    budgetRemaining: { type: Number, required: true, min: [0, 'Insufficient budget'] },
    players: [{
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        boughtFor: { type: Number }
    }],
    captainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    viceCaptainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
}, { timestamps: true });

squadSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Squad', squadSchema);
