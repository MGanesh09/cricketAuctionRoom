import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Zap } from 'lucide-react';

export default function Scoreboard() {
    const [matches, setMatches] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [matchRes, seriesRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/matches/recent`),
                    axios.get(`${API_URL}/matches/series`)
                ]);

                if (!isMounted) return;

                if (matchRes.status === 'fulfilled' && Array.isArray(matchRes.value.data)) {
                    setMatches(matchRes.value.data.slice(0, 5));
                }
                if (seriesRes.status === 'fulfilled' && Array.isArray(seriesRes.value.data)) {
                    setSeries(seriesRes.value.data.slice(0, 4));
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching scoreboard data:', err);
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 300000); // Auto-refresh every 5m
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading Live Scores...</div>;

    return (
        <div className="scoreboard-section" style={{ marginTop: '40px' }}>
            <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Zap size={24} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '1.8rem' }}>Live Match Scoreboard</h2>
            </div>
            
            <div className="match-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '50px' }}>
                {matches.map((match) => (
                    <motion.div 
                        key={match.id}
                        className="card"
                        whileHover={{ scale: 1.02 }}
                        style={{ padding: '15px', borderLeft: '4px solid var(--accent-primary)' }}
                    >
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{match.matchType?.toUpperCase() || 'MATCH'}</span>
                            <span>{match.date}</span>
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
                            {match.teams?.[0] || 'Team A'} vs {match.teams?.[1] || 'Team B'}
                        </div>
                        <div style={{ color: 'var(--success)', fontSize: '0.9rem', marginBottom: '5px' }}>
                            {match.status}
                        </div>
                        {match.score ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {Array.isArray(match.score) ? match.score.map((s, idx) => (
                                    <div key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                        {s.inning}: <span style={{ fontWeight: 'bold' }}>{s.r}/{s.w} ({s.o})</span>
                                    </div>
                                )) : (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                                        Score: <span style={{ fontWeight: 'bold' }}>{match.score.r}/{match.score.w} ({match.score.o})</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {match.matchStarted ? 'Match in progress...' : 'Match scheduled'}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <Trophy size={24} color="var(--accent-secondary)" />
                <h2 style={{ fontSize: '1.8rem' }}>Running Series</h2>
            </div>

            <div className="series-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {series.map((s) => (
                    <motion.div 
                        key={s.id}
                        className="card"
                        whileHover={{ scale: 1.02, borderColor: 'var(--accent-secondary)' }}
                        style={{ cursor: 'pointer', padding: '15px' }}
                    >
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{s.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <Calendar size={14} />
                            <span>{s.startDate} to {s.endDate}</span>
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                            <span className="badge">T20: {s.t20 || 0}</span>
                            <span className="badge">ODI: {s.odi || 0}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
