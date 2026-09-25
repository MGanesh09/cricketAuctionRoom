const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const auctionSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true, unique: true },
    currentPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null },
    currentBid: { type: Number, default: 0 },
    highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    bids: [bidSchema],
    status: { type: String, enum: ['idle', 'active', 'paused', 'completed'], default: 'idle' },
    timerEndsAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);
