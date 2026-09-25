import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${API_URL}/leaderboard/${id}`);
                setLeaderboard(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '40px' }}>Loading Standings...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
                <Link to={`/tournament/${id}`} style={{ color: 'var(--text-muted)' }}><ArrowLeft size={24} /></Link>
                <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Trophy color="gold" size={32} /> Tournament Leaderboard
                </h1>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '20px', textAlign: 'left' }}>Rank</th>
                            <th style={{ padding: '20px', textAlign: 'left' }}>Team & Manager</th>
                            <th style={{ padding: '20px', textAlign: 'right' }}>Total Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, index) => (
                            <motion.tr 
                                key={entry.userId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <td style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {index === 0 && <Medal color="gold" size={20} />}
                                        {index === 1 && <Medal color="silver" size={20} />}
                                        {index === 2 && <Medal color="#CD7F32" size={20} />}
                                        <span style={{ fontWeight: index < 3 ? 'bold' : 'normal', fontSize: '1.2rem' }}>
                                            #{index + 1}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: index === 0 ? 'var(--accent-primary)' : '#fff' }}>
                                            {entry.teamName}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{entry.username}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--success)' }}>
                                    {entry.points.toLocaleString()}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {leaderboard.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No points calculated yet. Standings will update once matches are processed!
                    </div>
                )}
            </div>
        </div>
    );
}
