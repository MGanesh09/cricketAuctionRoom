const express = require('express');
const Squad = require('../models/Squad');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:tournamentId', auth, async (req, res) => {
    try {
        const squad = await Squad.findOne({ tournamentId: req.params.tournamentId, userId: req.user.id })
                                 .populate('players.playerId')
                                 .populate('captainId')
                                 .populate('viceCaptainId');
        if (!squad) return res.status(404).json({ message: 'Squad not found' });
        res.json(squad);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/set-captain', auth, async (req, res) => {
    try {
        const { tournamentId, captainId, viceCaptainId } = req.body;
        
        const squad = await Squad.findOne({ tournamentId, userId: req.user.id });
        if (!squad) return res.status(404).json({ message: 'Squad not found' });

        if (captainId === viceCaptainId && captainId !== '') {
            return res.status(400).json({ message: 'Captain and Vice Captain must be different players' });
        }

        // Validate that players exist in squad
        const squadPlayerIds = squad.players.map(p => p.playerId.toString());
        if (captainId && !squadPlayerIds.includes(captainId)) {
            return res.status(400).json({ message: 'Captain must be in your squad' });
        }
        if (viceCaptainId && !squadPlayerIds.includes(viceCaptainId)) {
            return res.status(400).json({ message: 'Vice Captain must be in your squad' });
        }

        squad.captainId = captainId || undefined;
        squad.viceCaptainId = viceCaptainId || undefined;

        await squad.save();
        res.json(squad);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
