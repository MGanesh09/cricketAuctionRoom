const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Squad = require('../models/Squad');
const FantasyPoints = require('../models/FantasyPoints');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Total Lifetime Points
        const pointsAgg = await FantasyPoints.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: '$points' } } }
        ]);
        const totalPoints = pointsAgg[0]?.total || 0;

        // 2. Tournaments Participated
        const tournaments = await Tournament.find({ users: userId });
        const tournamentsPlayed = tournaments.length;

        // 3. Tournaments Won
        const completedTournaments = tournaments.filter(t => t.status === 'completed');
        let tournamentsWon = 0;
        
        for (const t of completedTournaments) {
            const lb = await FantasyPoints.aggregate([
                { $match: { tournamentId: t._id } },
                { $group: { _id: '$userId', total: { $sum: '$points' } } },
                { $sort: { total: -1 } }
            ]);
            if (lb.length > 0 && lb[0]._id.toString() === userId) {
                tournamentsWon++;
            }
        }

        // 4. Most Expensive Player Bought
        const squads = await Squad.find({ userId }).populate('players.playerId');
        let maxPrice = 0;
        let topPlayer = null;
        
        squads.forEach(s => {
            s.players.forEach(p => {
                if (p.boughtFor > maxPrice) {
                    maxPrice = p.boughtFor;
                    topPlayer = {
                        name: p.playerId?.name,
                        role: p.playerId?.role,
                        country: p.playerId?.country,
                        boughtFor: p.boughtFor
                    };
                }
            });
        });

        const userDoc = await User.findById(userId).select('username teamName');

        res.json({
            user: { 
                username: userDoc?.username || req.user.username, 
                teamName: userDoc?.teamName || req.user.teamName || 'Cricket Titans' 
            },
            stats: {
                totalPoints,
                tournamentsPlayed,
                tournamentsWon,
                topPlayer
            }
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ message: 'Server error fetching profile data' });
    }
});

module.exports = router;
