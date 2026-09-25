import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Play, Users, Trophy, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TournamentLobby() {
    const { id } = useParams();
    const { user } = useAuth();
    const [tournament, setTournament] = useState(null);
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTourney = async () => {
            try {
                const res = await axios.get(`${API_URL}/tournament/${id}`);
                setTournament(res.data);
                
                if (res.data.status === 'completed' || res.data.status === 'live') {
                    const lbRes = await axios.get(`${API_URL}/leaderboard/${id}`);
                    setLeaderboard(lbRes.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchTourney();
    }, [id]);

    useEffect(() => {
        const fetchPlayers = async () => {
            if (!tournament || tournament.adminId !== user.id) return;
            try {
                const res = await axios.get(`${API_URL}/players?seriesId=${tournament.seriesId}`);
                setPlayers(res.data);
                if (res.data.length > 0) setSelectedPlayer(res.data[0]._id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPlayers();
    }, [tournament, user.id]);

    const startAuction = async () => {
        if (!selectedPlayer) {
            alert('Please select a player first.');
            return;
        }
        try {
            await axios.post(`${API_URL}/auction/start`, { tournamentId: id, playerId: selectedPlayer });
            navigate(`/auction/${id}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Error starting auction');
        }
    };

    if (!tournament) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    const isAdmin = tournament.adminId === user.id;

    return (
        <div className="container" style={{ padding: '20px', maxWidth: '1000px' }}>
            <Link to="/dashboard" className="back-btn"><ChevronLeft size={18} /> Back to Dashboard</Link>
            
            {tournament.status === 'completed' && (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card" 
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#000', textAlign: 'center', padding: '50px', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, pointerEvents: 'none' }}>🏆</div>
                    <Trophy size={80} style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>TOURNAMENT CHAMPION</h2>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>👑 {leaderboard[0]?.teamName || 'Calculating...'}</p>
                    <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Finished with {leaderboard[0]?.points || 0} Total Points</p>
                </motion.div>
            )}

            <div className="flex-col-mobile-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>{tournament.name}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Invite Code: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{tournament.inviteCode}</span></p>
                </div>
                <div className="text-center-mobile" style={{ textAlign: 'right' }}>
                    <div className={`badge ${tournament.status === 'live' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '8px 16px', marginBottom: '10px', display: 'inline-block' }}>
                        {tournament.status.toUpperCase()}
                    </div>
                    <p>Total Budget: ₹{(tournament.totalBudget/10000000).toFixed(1)} Cr</p>
                </div>
            </div>

            <div className="grid">
                <div className="card">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><Users size={24} /> Participants ({tournament.users.length})</h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {tournament.users.map(u => (
                            <li key={u._id} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold' }}>{u.username}</span>
                                <span style={{ color: 'var(--accent-primary)' }}>{u.teamName}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><Play size={24} /> Auction Actions</h2>
                    {tournament.status === 'auction' || tournament.status === 'live' ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Auction is active!</p>
                            <Link to={`/auction/${id}`} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>Join Auction Room</Link>
                        </div>
                    ) : isAdmin ? (
                        <div>
                            <p style={{ marginBottom: '15px', color: 'var(--text-muted)' }}>Building your squad? Start with the next available player automatically.</p>
                            <button 
                                onClick={async () => {
                                    try {
                                        await axios.post(`${API_URL}/auction/auto-start`, { tournamentId: id });
                                        navigate(`/auction/${id}`);
                                    } catch (err) {
                                        alert(err.response?.data?.message || 'Error starting auto-auction');
                                    }
                                }} 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '15px', marginBottom: '20px', fontSize: '1.1rem' }}
                            >
                                Start Next Player Auction
                            </button>

                            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />
                            <select 
                                className="input-field"
                                value={selectedPlayer}
                                onChange={(e) => setSelectedPlayer(e.target.value)}
                                style={{ marginBottom: '15px' }}
                            >
                                {players.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.role})</option>
                                ))}
                            </select>
                            <button onClick={startAuction} className="btn btn-outline" style={{ width: '100%' }}>Start Selected Player</button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Waiting for admin...</p>
                        </div>
                    )}
                </div>
                
                <div className="card">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><Trophy size={24} color="var(--accent-primary)" /> Scoring</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                        <div><div style={{ color: 'var(--text-muted)' }}>Run</div><div>+{tournament.pointSystem.run}</div></div>
                        <div><div style={{ color: 'var(--text-muted)' }}>Wicket</div><div>+{tournament.pointSystem.wicket}</div></div>
                        <div><div style={{ color: 'var(--text-muted)' }}>Catch</div><div>+{tournament.pointSystem.catch}</div></div>
                        <div><div style={{ color: 'var(--text-muted)' }}>Captain</div><div>{tournament.pointSystem.captainMultiplier}x</div></div>
                    </div>
                </div>

                <div className="card">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}><Trophy size={24} /> Quick Links</h2>
                    <Link to={`/squad/${id}`} className="btn btn-outline" style={{ display: 'block', textAlign: 'center', marginBottom: '10px' }}>My Squad</Link>
                    <Link to={`/leaderboard/${id}`} className="btn btn-outline" style={{ display: 'block', textAlign: 'center' }}>Leaderboard</Link>
                </div>
            </div>
        </div>
    );
}
