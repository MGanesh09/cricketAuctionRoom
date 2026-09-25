const cron = require('node-cron');
const axios = require('axios');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Squad = require('../models/Squad');
const FantasyPoints = require('../models/FantasyPoints');

const API_KEY = process.env.CRICKET_API_KEY || '3f1ce9f8-4e5a-487c-8814-43a74acadd71';
const BASE_URL = 'https://api.cricapi.com/v1';

const fetchPlayers = async () => {
    try {
        console.log('Fetching active series and squads from CricAPI...');
        
        // Fetch active series (first page)
        const seriesRes = await axios.get(`${BASE_URL}/series`, {
            params: { apikey: API_KEY, offset: 0 }
        });

        if (!seriesRes.data?.data) return;

        // Get series IDs from top series AND active tournaments
        const topSeriesIds = seriesRes.data.data.slice(0, 3).map(s => s.id);
        const tourneySeriesIds = await Tournament.find({ status: { $ne: 'completed' } }).distinct('seriesId');
        
        // Merge and remove duplicates
        const seriesToFetch = [...new Set([...topSeriesIds, ...tourneySeriesIds])];

        for (const seriesId of seriesToFetch) {
            console.log(`Fetching squad for series ID: ${seriesId}`);
            const squadRes = await axios.get(`${BASE_URL}/series_squads`, {
                params: { apikey: API_KEY, id: seriesId }
            });

            if (squadRes.data?.data) {
                for (const squad of squadRes.data.data) {
                    if (squad.players) {
                        for (const p of squad.players) {
                            await Player.findOneAndUpdate(
                                { cricApiId: p.id },
                                { 
                                    cricApiId: p.id, 
                                    name: p.name, 
                                    country: p.country || squad.teamName, 
                                    role: p.role || 'unknown',
                                    playerImg: p.playerImg,
                                    $addToSet: { seriesIds: seriesId }
                                },
                                { upsert: true, new: true }
                            );
                        }
                    }
                }
            }
        }
        console.log('Player database updated with series squads.');
    } catch (err) {
        console.error('Error fetching players:', err.message);
    }
};

const calculateFantasyPoints = async () => {
    try {
        console.log('Calculating Fantasy Points for specific series...');
        
        // Find all active tournaments
        const tournaments = await Tournament.find({ status: { $in: ['auction', 'live'] } });
        
        for (const tournament of tournaments) {
            // Fetch matches for this specific series ONLY
            const response = await axios.get(`${BASE_URL}/series_info`, {
                params: { apikey: API_KEY, id: tournament.seriesId }
            });

            if (!response.data || !response.data.data || !response.data.data.matchList) continue;

            const matches = response.data.data.matchList.filter(m => m.matchEnded);
            
            for (const matchInfo of matches) {
                // Check if we already processed this match
                const existingMatch = await Match.findOne({ cricApiId: matchInfo.id });
                if (existingMatch && existingMatch.status === 'processed') continue; // Skip if already processed

                // Fetch scorecard to get points
                const scorecardRes = await axios.get(`${BASE_URL}/match_scorecard`, {
                    params: { apikey: API_KEY, id: matchInfo.id }
                });

                if (!scorecardRes.data?.data?.scorecard || scorecardRes.data.data.scorecard.length === 0) {
                    console.log(`Skipping match ${matchInfo.id}: Scorecard empty or match abandoned.`);
                    continue;
                }
                
                const scorecard = scorecardRes.data.data.scorecard;
                const playerPoints = {}; // map of cricApiId to points
                
                const ptsSys = tournament.pointSystem; // using dynamic point system

                for (const inning of scorecard) {
                    if (inning.batting) {
                        inning.batting.forEach(bat => {
                            if (!bat.batsman?.id) return;
                            let pts = (bat.r || 0) * ptsSys.run; 
                            pts += (bat['4s'] || 0) * ptsSys.four; 
                            pts += (bat['6s'] || 0) * ptsSys.six; 
                            // Duck Penalty: 0 runs and is out
                            if (bat.r === 0 && bat.dismissalText && bat.dismissalText.toLowerCase() !== 'not out') {
                                pts += (ptsSys.duck || -2);
                            }
                            playerPoints[bat.batsman.id] = (playerPoints[bat.batsman.id] || 0) + pts;
                        });
                    }
                    if (inning.bowling) {
                        inning.bowling.forEach(bowl => {
                            if (!bowl.bowler?.id) return;
                            let wickets = bowl.w || 0;
                            let pts = wickets * ptsSys.wicket; 
                            pts += (bowl.m || 0) * ptsSys.maiden; 
                            
                            // Wicket Haul Bonuses
                            if (wickets >= 5) pts += (ptsSys.fiveWicket || 20);
                            else if (wickets >= 3) pts += (ptsSys.threeWicket || 10);
                            
                            playerPoints[bowl.bowler.id] = (playerPoints[bowl.bowler.id] || 0) + pts;
                        });
                    }
                    if (inning.catching) {
                        inning.catching.forEach(cat => {
                            if (!cat.catcher?.id) return;
                            let pts = (cat.catch || 0) * ptsSys.catch; 
                            playerPoints[cat.catcher.id] = (playerPoints[cat.catcher.id] || 0) + pts;
                        });
                    }
                }

                // Get all players from DB to map CricAPI IDs to our Mongo IDs
                const apiPlayerIds = Object.keys(playerPoints);
                const dbPlayers = await Player.find({ cricApiId: { $in: apiPlayerIds } });
                const playerMap = {};
                dbPlayers.forEach(p => playerMap[p.cricApiId] = p._id.toString());

                // Now award points to squads in this tournament
                const squads = await Squad.find({ tournamentId: tournament._id });
                for (const squad of squads) {
                    let totalSquadPoints = 0;
                    
                    squad.players.forEach(squadPlayer => {
                        const pid = squadPlayer.playerId.toString();
                        const apiId = Object.keys(playerMap).find(key => playerMap[key] === pid);
                        if (apiId && playerPoints[apiId]) {
                            let pts = playerPoints[apiId];
                            
                            // Multipliers
                            if (squad.captainId && squad.captainId.toString() === pid) pts *= Number(ptsSys.captainMultiplier || 2);
                            else if (squad.viceCaptainId && squad.viceCaptainId.toString() === pid) pts *= Number(ptsSys.viceCaptainMultiplier || 1.5);
                            
                            totalSquadPoints += pts;
                        }
                    });

                    if (totalSquadPoints > 0) {
                        // Store points
                        let fp = await Match.findOneAndUpdate(
                            { cricApiId: matchInfo.id },
                            { cricApiId: matchInfo.id, name: matchInfo.name, status: 'processed' },
                            { upsert: true, new: true }
                        );

                        await FantasyPoints.findOneAndUpdate(
                            { tournamentId: tournament._id, userId: squad.userId, matchId: fp._id },
                            { points: totalSquadPoints },
                            { upsert: true, new: true }
                        );
                    }
                }
            }
        }
        console.log('Fantasy points calculation complete.');
        
        // AUTO-CLEANUP: Delete data older than 30 days to save storage
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await Match.deleteMany({ status: 'processed', createdAt: { $lt: thirtyDaysAgo } });
        console.log('Old processed matches cleaned up.');

    } catch (err) {
        console.error('Error in daily tasks:', err.message);
    }
};

const startCronJobs = () => {
    // Run daily at 4 AM
    cron.schedule('0 4 * * *', () => {
        console.log('Running daily cron jobs at 4 AM');
        fetchPlayers();
        calculateFantasyPoints();
    });
};

module.exports = { startCronJobs, fetchPlayers, calculateFantasyPoints };
