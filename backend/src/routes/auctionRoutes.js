const express = require('express');
const Auction = require('../models/Auction');
const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Squad = require('../models/Squad');
const auth = require('../middleware/auth');
const setupAuctionSocket = require('../socket/auctionHandler');

const router = express.Router();

router.post('/start', auth, async (req, res) => {
    try {
        const { tournamentId, playerId } = req.body;
        
        if (!tournamentId || !playerId) {
            return res.status(400).json({ message: 'Missing tournamentId or playerId' });
        }
        
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament || tournament.adminId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const player = await Player.findById(playerId);
        if (!player) return res.status(404).json({ message: 'Player not found' });

        // Check if player already sold
        const alreadySold = await Squad.findOne({ 
            tournamentId, 
            'players.playerId': playerId 
        });
        if (alreadySold) {
            return res.status(400).json({ message: 'Player is already sold' });
        }

        let auction = await Auction.findOne({ tournamentId });
        if (auction && auction.status === 'active') {
            return res.status(400).json({ message: 'Auction already in progress' });
        }

        if (!auction) auction = new Auction({ tournamentId });

        auction.currentPlayerId = playerId;
        auction.currentBid = player.basePrice;
        auction.highestBidder = null;
        auction.bids = [];
        auction.status = 'active';
        auction.timerEndsAt = new Date(Date.now() + 30000);

        await auction.save();
        tournament.status = 'auction';
        await tournament.save();

        const io = req.app.get('socketio');
        if (io) {
            // Emit to tournament room so users in room get updated
            io.to(tournamentId).emit('auctionStarted', {
                auctionId: auction._id,
                player,
                currentBid: auction.currentBid,
                timerEndsAt: auction.timerEndsAt
            });

            // Emit notification globally
            io.to('global_notifications').emit('auctionStartedNotify', {
                tournamentId,
                tournamentName: tournament.name,
                playerName: player.name
            });

            // Start countdown timer immediately
            setupAuctionSocket.startAuctionCountdown(io, tournamentId);
        }

        res.json(auction);
    } catch (err) {
        console.error('Auction Start Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/auto-start', auth, async (req, res) => {
    try {
        const { tournamentId } = req.body;
        
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament || tournament.adminId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // 1. Get all players sold in this tournament
        const soldPlayers = await Squad.find({ tournamentId }).distinct('players.playerId');

        // 2. Find a player from the series who is NOT in soldPlayers
        let nextPlayer = tournament.seriesId ? await Player.findOne({ 
            seriesIds: tournament.seriesId,
            _id: { $nin: soldPlayers }
        }) : null;

        // Fallback: If no player matches seriesId, pick any unsold player in DB
        if (!nextPlayer) {
            nextPlayer = await Player.findOne({
                _id: { $nin: soldPlayers }
            });
        }

        if (!nextPlayer) {
            tournament.status = 'live';
            await tournament.save();
            return res.status(404).json({ message: 'No more players available. Tournament is now LIVE!' });
        }

        // 3. Check if an auction is already active
        let auction = await Auction.findOne({ tournamentId });
        if (auction && auction.status === 'active') {
            return res.status(400).json({ message: 'An auction is already in progress' });
        }

        if (!auction) auction = new Auction({ tournamentId });

        auction.currentPlayerId = nextPlayer._id;
        auction.currentBid = nextPlayer.basePrice;
        auction.highestBidder = null;
        auction.bids = [];
        auction.status = 'active';
        auction.timerEndsAt = new Date(Date.now() + 30000);

        await auction.save();
        tournament.status = 'auction';
        await tournament.save();

        const io = req.app.get('socketio');
        if (io) {
            // Emit to tournament room
            io.to(tournamentId).emit('auctionStarted', {
                auctionId: auction._id,
                player: nextPlayer,
                currentBid: auction.currentBid,
                timerEndsAt: auction.timerEndsAt
            });

            // Emit notification globally
            io.to('global_notifications').emit('auctionStartedNotify', {
                tournamentId,
                tournamentName: tournament.name,
                playerName: nextPlayer.name
            });

            // Start countdown timer immediately
            setupAuctionSocket.startAuctionCountdown(io, tournamentId);
        }

        res.json({ auction, player: nextPlayer });
    } catch (err) {
        console.error('Auto-Start Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:tournamentId', auth, async (req, res) => {
    try {
        const auction = await Auction.findOne({ tournamentId: req.params.tournamentId })
                                     .populate('currentPlayerId')
                                     .populate('highestBidder', 'username teamName')
                                     .populate('bids.userId', 'username teamName');
        res.json(auction);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/history/:tournamentId', auth, async (req, res) => {
    try {
        const squads = await Squad.find({ tournamentId: req.params.tournamentId }).populate('players.playerId').populate('userId', 'username');
        let history = [];
        squads.forEach(s => {
            if (s && s.players) {
                s.players.forEach(p => {
                    history.push({
                        playerName: p.playerId?.name || 'Unknown Player',
                        boughtFor: p.boughtFor,
                        winner: s.userId?.username || 'Unknown User',
                        time: p._id && typeof p._id.getTimestamp === 'function' ? p._id.getTimestamp() : new Date()
                    });
                });
            }
        });
        // Sort by time descending
        history.sort((a, b) => new Date(b.time) - new Date(a.time));
        res.json(history.slice(0, 5));
    } catch (err) {
        console.error('History fetch error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
