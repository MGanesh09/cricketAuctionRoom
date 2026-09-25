const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.CRICKET_API_KEY || '3f1ce9f8-4e5a-487c-8814-43a74acadd71';
const BASE_URL = 'https://api.cricapi.com/v1';

// Default mock series fallback in case CricAPI quota runs out or network fails
const fallbackSeries = [
    {
        id: '87c62aac-bc3c-4738-ab93-19da0690488f',
        name: 'Indian Premier League 2026',
        startDate: '2026-03-22',
        endDate: '2026-05-26',
        odi: 0,
        t20: 74,
        test: 0,
        squads: 10,
        matches: 74
    },
    {
        id: 't20-wc-2026',
        name: 'ICC Men\'s T20 World Championship 2026',
        startDate: '2026-06-01',
        endDate: '2026-06-29',
        odi: 0,
        t20: 55,
        test: 0,
        squads: 20,
        matches: 55
    },
    {
        id: 'ind-vs-aus-2026',
        name: 'India vs Australia T20I Series',
        startDate: '2026-09-15',
        endDate: '2026-10-02',
        odi: 3,
        t20: 5,
        test: 0,
        squads: 2,
        matches: 8
    },
    {
        id: 'the-hundred-2026',
        name: 'The Hundred Men\'s Competition 2026',
        startDate: '2026-07-23',
        endDate: '2026-08-18',
        odi: 0,
        t20: 32,
        test: 0,
        squads: 8,
        matches: 32
    }
];

const fallbackMatches = [
    {
        id: 'mock-m1',
        name: 'India vs Australia, 3rd T20I',
        matchType: 't20',
        status: 'India won by 6 wickets',
        date: '2026-09-25',
        dateTimeGMT: '2026-09-25T14:00:00',
        teams: ['India', 'Australia'],
        score: [
            { inning: 'Australia Inning', r: 186, w: 6, o: 20 },
            { inning: 'India Inning', r: 187, w: 4, o: 19.2 }
        ],
        matchStarted: true,
        matchEnded: true
    },
    {
        id: 'mock-m2',
        name: 'Chennai Super Kings vs Mumbai Indians',
        matchType: 't20',
        status: 'CSK need 24 runs in 18 balls',
        date: '2026-09-25',
        dateTimeGMT: '2026-09-25T18:30:00',
        teams: ['Chennai Super Kings', 'Mumbai Indians'],
        score: [
            { inning: 'Mumbai Indians', r: 195, w: 5, o: 20 },
            { inning: 'Chennai Super Kings', r: 172, w: 3, o: 17 }
        ],
        matchStarted: true,
        matchEnded: false
    },
    {
        id: 'mock-m3',
        name: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
        matchType: 't20',
        status: 'Match scheduled to start at 7:30 PM IST',
        date: '2026-09-26',
        dateTimeGMT: '2026-09-26T14:00:00',
        teams: ['Royal Challengers Bengaluru', 'Kolkata Knight Riders'],
        score: null,
        matchStarted: false,
        matchEnded: false
    }
];

// Simple in-memory cache
const cache = {
    series: { data: null, lastFetched: 0 },
    recent: { data: null, lastFetched: 0 }
};
const SERIES_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MATCH_CACHE_DURATION = 3 * 60 * 60 * 1000;   // 3 hours

// Get active series
router.get('/series', async (req, res) => {
    try {
        const now = Date.now();
        if (cache.series.data && (now - cache.series.lastFetched < SERIES_CACHE_DURATION)) {
            return res.json(cache.series.data);
        }

        console.log('Fetching series from CricAPI...');
        const response = await axios.get(`${BASE_URL}/series`, {
            params: { apikey: API_KEY, offset: 0 },
            timeout: 5000
        });
        
        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const seriesData = response.data.data;
            cache.series = { data: seriesData, lastFetched: now };
            return res.json(seriesData);
        }
        
        console.warn('CricAPI series not available, using fallback series data');
        res.json(fallbackSeries);
    } catch (err) {
        console.warn('Series fetch warning, falling back to mock series:', err.message);
        res.json(fallbackSeries);
    }
});

// Get matches for yesterday, today, tomorrow
router.get('/recent', async (req, res) => {
    try {
        const now = Date.now();
        if (cache.recent.data && (now - cache.recent.lastFetched < MATCH_CACHE_DURATION)) {
            return res.json(cache.recent.data);
        }

        console.log('Fetching recent matches from CricAPI...');
        const response = await axios.get(`${BASE_URL}/currentMatches`, {
            params: { apikey: API_KEY, offset: 0 },
            timeout: 5000
        });

        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const matchData = response.data.data;
            cache.recent = { data: matchData, lastFetched: now };
            return res.json(matchData);
        }

        console.warn('CricAPI current matches not available, using fallback matches');
        res.json(fallbackMatches);
    } catch (err) {
        console.warn('Matches fetch warning, falling back to mock matches:', err.message);
        res.json(fallbackMatches);
    }
});

module.exports = router;
