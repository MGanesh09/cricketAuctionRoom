const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const tournamentRoutes = require('./src/routes/tournamentRoutes');
const playerRoutes = require('./src/routes/playerRoutes');
const squadRoutes = require('./src/routes/squadRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const auctionRoutes = require('./src/routes/auctionRoutes');
const matchRoutes = require('./src/routes/matchRoutes');
const setupAuctionSocket = require('./src/socket/auctionHandler');
const { startCronJobs } = require('./src/cron/fetchData');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // For dev, allow all
        methods: ['GET', 'POST']
    }
});
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/user', require('./src/routes/userRoutes'));
app.use('/tournament', tournamentRoutes);
app.use('/players', playerRoutes);
app.use('/squad', squadRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/auction', auctionRoutes);
app.use('/matches', matchRoutes);

// Socket.io
setupAuctionSocket(io);

// Start Cron Jobs
const { fetchPlayers: seedPlayers } = require('./src/cron/fetchData');
const Player = require('./src/models/Player');
startCronJobs();

// Initial seed only if database is empty
const seedDummyPlayers = require('./src/cron/dummySeed');
Player.countDocuments().then(async count => {
    if (count === 0) {
        console.log('Database empty, seeding fallback players immediately...');
        await seedDummyPlayers();
        seedPlayers().catch(err => console.log('CricAPI seed notice:', err.message));
    } else {
        console.log(`Player database already seeded with ${count} players.`);
    }
}).catch(err => {
    console.error('Player count / seed error:', err.message);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong on our end', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Process-level Error Handlers to prevent collapse
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    // Optional: decide if you want to exit the process here
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
