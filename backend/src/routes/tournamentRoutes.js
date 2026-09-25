const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const Squad = require('../models/Squad');
const FantasyPoints = require('../models/FantasyPoints');
const Auction = require('../models/Auction');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create', auth, async (req, res) => {
    try {
        const { name, totalBudget, squadSize, auctionType, pointSystem, seriesId } = req.body;
        
        let inviteCode;
        let isUnique = false;
        while (!isUnique) {
            inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
            const existing = await Tournament.findOne({ inviteCode });
            if (!existing) isUnique = true;
        }

        const tournament = new Tournament({
            name,
            inviteCode,
            totalBudget: totalBudget || 100000000,
            squadSize: squadSize || 24,
            auctionType: auctionType || 'live',
            seriesId: seriesId || undefined,
            pointSystem: pointSystem || undefined,
            adminId: req.user.id,
            users: [req.user.id]
        });

        await tournament.save();

        // Create squad for admin
        const squad = new Squad({
            tournamentId: tournament._id,
            userId: req.user.id,
            budgetRemaining: tournament.totalBudget,
            players: []
        });
        await squad.save();

        res.status(201).json(tournament);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/join', auth, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        
        const tournament = await Tournament.findOne({ inviteCode });
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        if (tournament.status === 'completed') {
            return res.status(400).json({ message: 'This tournament has already ended' });
        }

        if (tournament.users.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already joined' });
        }

        tournament.users.push(req.user.id);
        await tournament.save();

        const squad = new Squad({
            tournamentId: tournament._id,
            userId: req.user.id,
            budgetRemaining: tournament.totalBudget,
            players: []
        });
        await squad.save();

        res.json(tournament);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/my', auth, async (req, res) => {
    try {
        const tournaments = await Tournament.find({ users: req.user.id });
        
        // Calculate rank for each tournament
        const tournamentsWithRank = await Promise.all(tournaments.map(async (t) => {
            const points = await FantasyPoints.aggregate([
                { $match: { tournamentId: t._id } },
                { $group: { _id: '$userId', totalPoints: { $sum: '$points' } } },
                { $sort: { totalPoints: -1 } }
            ]);

            const rankIndex = points.findIndex(p => p._id.toString() === req.user.id);
            const rank = rankIndex === -1 ? '-' : rankIndex + 1;

            return {
                ...t._doc,
                userRank: rank,
                totalUsers: t.users.length
            };
        }));

        res.json(tournamentsWithRank);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('users', 'username teamName');
        if (!tournament) return res.status(404).json({ message: 'Not found' });
        res.json(tournament);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        
        if (tournament.adminId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only admins can delete tournaments' });
        }

        await Tournament.findByIdAndDelete(req.params.id);
        await Squad.deleteMany({ tournamentId: req.params.id });
        // Also cleanup auctions if they exist
        await Auction.deleteMany({ tournamentId: req.params.id });
        await FantasyPoints.deleteMany({ tournamentId: req.params.id });

        res.json({ message: 'Tournament deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
