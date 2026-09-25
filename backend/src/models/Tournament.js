const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    inviteCode: { type: String, required: true, unique: true },
    totalBudget: { type: Number, default: 100000000 },
    squadSize: { type: Number, default: 24 },
    auctionType: { type: String, enum: ['live', 'auto-bid'], default: 'live' },
    status: { type: String, enum: ['upcoming', 'auction', 'live', 'completed'], default: 'upcoming' },
    seriesId: { type: String, required: true, default: '87c62aac-bc3c-4738-ab93-19da0690488f' }, // Default to IPL 2026
    pointSystem: {
        run: { type: Number, default: 1 },
        four: { type: Number, default: 1 },
        six: { type: Number, default: 2 },
        duck: { type: Number, default: -2 }, // Minus points for duck
        wicket: { type: Number, default: 25 },
        threeWicket: { type: Number, default: 10 }, // Bonus
        fiveWicket: { type: Number, default: 20 }, // Bonus
        maiden: { type: Number, default: 10 },
        catch: { type: Number, default: 8 },
        captainMultiplier: { type: Number, default: 2 },
        viceCaptainMultiplier: { type: Number, default: 1.5 }
    },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
