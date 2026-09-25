const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        console.log('Registering user:', req.body);
        const { username, password, teamName } = req.body;
        
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ username, password, teamName });
        await user.save();

        const jwtSecret = process.env.JWT_SECRET || 'cricketAuction_default_jwt_secret';
        const token = jwt.sign({ id: user._id, username: user.username, teamName: user.teamName }, jwtSecret, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, username, teamName } });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const jwtSecret = process.env.JWT_SECRET || 'cricketAuction_default_jwt_secret';
        const token = jwt.sign({ id: user._id, username: user.username, teamName: user.teamName }, jwtSecret, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, teamName: user.teamName } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
