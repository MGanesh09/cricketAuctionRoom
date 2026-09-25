const express = require('express');
const mongoose = require('mongoose');
const FantasyPoints = require('../models/FantasyPoints');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:id', auth, async (req, res) => {
    try {
        const points = await FantasyPoints.aggregate([
            { $match: { tournamentId: new mongoose.Types.ObjectId(req.params.id) } },
            { $group: { _id: '$userId', totalPoints: { $sum: '$points' } } },
            { $sort: { totalPoints: -1 } }
        ]);

        const populatedPoints = await User.populate(points, { path: '_id', select: 'username teamName' });

        const leaderboard = (populatedPoints || [])
            .filter(p => p && p._id)
            .map(p => ({
                userId: p._id._id || p._id,
                username: p._id.username || 'Anonymous',
                teamName: p._id.teamName || 'Team',
                points: p.totalPoints || 0
            }));

        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
