const Auction = require('../models/Auction');
const Squad = require('../models/Squad');
const Tournament = require('../models/Tournament');
const jwt = require('jsonwebtoken');

const activeTimers = {}; // Store intervals

function startAuctionCountdown(io, tournamentId) {
    if (activeTimers[tournamentId]) clearInterval(activeTimers[tournamentId]);

    activeTimers[tournamentId] = setInterval(async () => {
        try {
            const currentAuction = await Auction.findOne({ tournamentId }).populate('currentPlayerId').populate('highestBidder');
            if (!currentAuction || currentAuction.status !== 'active') {
                clearInterval(activeTimers[tournamentId]);
                delete activeTimers[tournamentId];
                return;
            }

            const timeRemaining = Math.max(0, new Date(currentAuction.timerEndsAt).getTime() - Date.now());
            io.to(tournamentId).emit('auctionTimerUpdate', { timeRemaining });

            if (timeRemaining <= 0) {
                clearInterval(activeTimers[tournamentId]);
                delete activeTimers[tournamentId];

                // Player sold or unsold
                currentAuction.status = 'idle';
                await currentAuction.save();

                if (currentAuction.highestBidder) {
                    await Squad.findOneAndUpdate(
                        { tournamentId, userId: currentAuction.highestBidder._id },
                        { 
                            $push: { players: { playerId: currentAuction.currentPlayerId._id, boughtFor: currentAuction.currentBid } },
                            $inc: { budgetRemaining: -currentAuction.currentBid }
                        }
                    );

                    io.to(tournamentId).emit('playerSold', {
                        playerId: currentAuction.currentPlayerId?._id,
                        playerName: currentAuction.currentPlayerId?.name || 'Player',
                        amount: currentAuction.currentBid,
                        winnerId: currentAuction.highestBidder._id,
                        winnerName: currentAuction.highestBidder.username
                    });
                } else {
                    io.to(tournamentId).emit('playerUnsold', {
                        playerId: currentAuction.currentPlayerId?._id,
                        playerName: currentAuction.currentPlayerId?.name || 'Player'
                    });
                }
            }
        } catch (err) {
            console.error('Auction timer error:', err);
            clearInterval(activeTimers[tournamentId]);
            delete activeTimers[tournamentId];
        }
    }, 1000);
}

function setupAuctionSocket(io) {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('joinAuction', ({ tournamentId, token }) => {
            try {
                const jwtSecret = process.env.JWT_SECRET || 'cricketAuction_default_jwt_secret';
                const decoded = jwt.verify(token, jwtSecret);
                socket.join(tournamentId);
                socket.user = decoded;
                console.log(`User ${decoded.username} joined auction room ${tournamentId}`);
            } catch (err) {
                socket.emit('error', 'Invalid token');
            }
        });

        socket.on('joinNotifications', ({ userId }) => {
            socket.join('global_notifications');
            console.log(`User ${userId} joined global notifications`);
        });

        socket.on('placeBid', async ({ tournamentId }) => {
            if (!socket.user) return socket.emit('error', 'Not authenticated');

            try {
                const auction = await Auction.findOne({ tournamentId }).populate('currentPlayerId');
                if (!auction || auction.status !== 'active') return socket.emit('error', 'Auction not active');

                const tournament = await Tournament.findById(tournamentId);
                const squad = await Squad.findOne({ tournamentId, userId: socket.user.id });

                if (!squad) return socket.emit('error', 'Squad not found');

                // Determine next bid amount
                let nextBid = auction.currentBid;
                if (auction.bids.length > 0) {
                    if (nextBid < 5000000) nextBid += 200000;
                    else if (nextBid < 10000000) nextBid += 500000;
                    else nextBid += 1000000;
                }

                if (squad.players.length >= (tournament?.squadSize || 24)) {
                    return socket.emit('error', 'Squad is already full');
                }

                if (squad.budgetRemaining < nextBid) {
                    return socket.emit('error', 'Insufficient budget');
                }

                if (auction.highestBidder && auction.highestBidder.toString() === socket.user.id) {
                    return socket.emit('error', 'You are already the highest bidder');
                }

                // ATOMIC UPDATE: Only update if currentBid is still what we retrieved
                const updatedAuction = await Auction.findOneAndUpdate(
                    { _id: auction._id, currentBid: auction.currentBid, status: 'active' },
                    { 
                        $set: { 
                            currentBid: nextBid, 
                            highestBidder: socket.user.id,
                            timerEndsAt: new Date(Date.now() + 15000)
                        },
                        $push: { bids: { userId: socket.user.id, amount: nextBid } }
                    },
                    { new: true }
                );

                if (!updatedAuction) {
                    return socket.emit('error', 'Bid was too slow, try again');
                }

                io.to(tournamentId).emit('newHighestBid', {
                    currentBid: updatedAuction.currentBid,
                    highestBidderId: updatedAuction.highestBidder,
                    highestBidderName: socket.user.username,
                    timerEndsAt: updatedAuction.timerEndsAt
                });

                // Restart countdown with new timer
                startAuctionCountdown(io, tournamentId);

            } catch (err) {
                console.error('Bid error:', err);
                socket.emit('error', 'Bid failed');
            }
        });

        // LIVE CHAT FEATURE
        socket.on('chatMessage', ({ tournamentId, text }) => {
            if (!socket.user) return;
            io.to(tournamentId).emit('receiveChatMessage', {
                user: socket.user.username,
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}

setupAuctionSocket.startAuctionCountdown = startAuctionCountdown;

module.exports = setupAuctionSocket;
