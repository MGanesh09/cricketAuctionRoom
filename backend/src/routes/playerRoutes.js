const express = require('express');
const Player = require('../models/Player');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const { role, team, sort, seriesId } = req.query;
        let query = {};
        if (role) query.role = role;
        if (team) query.country = team;
        if (seriesId) query.seriesIds = seriesId;

        let playersQuery = Player.find(query);

        if (sort === 'runs') {
            playersQuery = playersQuery.sort({ 'stats.runs': -1 });
        } else if (sort === 'wickets') {
            playersQuery = playersQuery.sort({ 'stats.wickets': -1 });
        }

        let result = await playersQuery.exec();

        // Fallback: If no players match the specific series, return all players so the auction doesn't break
        if (result.length === 0 && seriesId) {
            delete query.seriesIds;
            let fallbackQuery = Player.find(query);
            if (sort === 'runs') fallbackQuery = fallbackQuery.sort({ 'stats.runs': -1 });
            else if (sort === 'wickets') fallbackQuery = fallbackQuery.sort({ 'stats.wickets': -1 });
            result = await fallbackQuery.exec();
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ message: 'Not found' });
        res.json(player);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
