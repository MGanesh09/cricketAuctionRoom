const Player = require('../models/Player');

const defaultSeries = ['87c62aac-bc3c-4738-ab93-19da0690488f', 't20-wc-2026', 'ind-vs-aus-2026'];

const dummyPlayers = [
    { cricApiId: 'dummy-1', name: 'Virat Kohli', role: 'batsman', country: 'India', basePrice: 20000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-2', name: 'MS Dhoni', role: 'wk', country: 'India', basePrice: 20000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-3', name: 'Jasprit Bumrah', role: 'bowler', country: 'India', basePrice: 20000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-4', name: 'Rohit Sharma', role: 'batsman', country: 'India', basePrice: 20000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-5', name: 'Ben Stokes', role: 'all-rounder', country: 'England', basePrice: 15000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-6', name: 'Pat Cummins', role: 'bowler', country: 'Australia', basePrice: 20000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-7', name: 'Rashid Khan', role: 'bowler', country: 'Afghanistan', basePrice: 18000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-8', name: 'AB de Villiers', role: 'batsman', country: 'South Africa', basePrice: 15000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-9', name: 'Hardik Pandya', role: 'all-rounder', country: 'India', basePrice: 15000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-10', name: 'Kane Williamson', role: 'batsman', country: 'New Zealand', basePrice: 12000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-11', name: 'Trent Boult', role: 'bowler', country: 'New Zealand', basePrice: 10000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-12', name: 'David Warner', role: 'batsman', country: 'Australia', basePrice: 12000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-13', name: 'Shakib Al Hasan', role: 'all-rounder', country: 'Bangladesh', basePrice: 10000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-14', name: 'Kagiso Rabada', role: 'bowler', country: 'South Africa', basePrice: 12000000, seriesIds: defaultSeries },
    { cricApiId: 'dummy-15', name: 'KL Rahul', role: 'wk', country: 'India', basePrice: 15000000, seriesIds: defaultSeries }
];

async function seedDummyPlayers() {
    try {
        for (const p of dummyPlayers) {
            await Player.findOneAndUpdate(
                { cricApiId: p.cricApiId },
                { $set: p },
                { upsert: true, new: true }
            );
        }
        console.log('Dummy fallback players seeded successfully!');
    } catch (err) {
        console.error('Error seeding dummy players:', err.message);
    }
}

module.exports = seedDummyPlayers;
