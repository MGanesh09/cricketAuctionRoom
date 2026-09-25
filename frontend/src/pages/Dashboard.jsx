import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [inviteCode, setInviteCode] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [activeSeries, setActiveSeries] = useState([]);
    const [seriesError, setSeriesError] = useState(null);
    const [newTourney, setNewTourney] = useState({ 
        name: '', 
        budget: 100000000,
        seriesId: '',
        run: 1, four: 1, six: 2, wicket: 25, maiden: 10, catch: 8, captainMultiplier: 2, viceCaptainMultiplier: 1.5
    });
    
    const navigate = useNavigate();

    const fetchTournaments = async () => {
        try {
            const res = await axios.get(`${API_URL}/tournament/my`);
            setTournaments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchActiveSeries = async () => {
        try {
            const res = await axios.get(`${API_URL}/matches/series`);
            setActiveSeries(res.data.slice(0, 10)); // Top 10 series
            if (res.data.length > 0) setNewTourney(prev => ({ ...prev, seriesId: res.data[0].id }));
            setSeriesError(null);
        } catch (err) {
            console.error(err);
            setSeriesError(err.response?.data?.message || 'Failed to load series. Check your API key.');
        }
    };

    useEffect(() => {
        fetchTournaments();
        fetchActiveSeries();
    }, []);

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/tournament/join`, { inviteCode });
            navigate(`/tournament/${res.data._id}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/tournament/create`, { 
                name: newTourney.name, 
                totalBudget: newTourney.budget,
                seriesId: newTourney.seriesId,
                pointSystem: {
                    run: newTourney.run,
                    four: newTourney.four,
                    six: newTourney.six,
                    wicket: newTourney.wicket,
                    maiden: newTourney.maiden,
                    catch: newTourney.catch,
                    captainMultiplier: newTourney.captainMultiplier,
                    viceCaptainMultiplier: newTourney.viceCaptainMultiplier
                }
            });
            navigate(`/tournament/${res.data._id}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create');
        }
    };

    return (
        <div className="container" style={{ padding: '20px 0' }}>
            <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Welcome, {user?.username}</h1>
                    <p style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>Team: {user?.teamName}</p>
                </div>
            </div>

            <div className="grid">
                <div className="card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={24} color="var(--accent-primary)" /> Join Tournament
                    </h3>
                    <form onSubmit={handleJoin} className="flex-col-mobile" style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            className="input-field" 
                            style={{ marginBottom: 0 }}
                            placeholder="Enter Invite Code" 
                            value={inviteCode} 
                            onChange={(e) => setInviteCode(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="btn btn-primary">Join</button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={24} color="var(--success)" /> Create Tournament
                    </h3>
                    {!showCreate ? (
                        <button onClick={() => setShowCreate(true)} className="btn btn-outline" style={{ width: '100%' }}>Create New</button>
                    ) : (
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="text" className="input-field" placeholder="Tournament Name" value={newTourney.name} onChange={(e) => setNewTourney({ ...newTourney, name: e.target.value })} required />
                            
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select Live Series</label>
                            <select 
                                className="input-field" 
                                value={newTourney.seriesId} 
                                onChange={(e) => setNewTourney({ ...newTourney, seriesId: e.target.value })}
                                required
                            >
                                {activeSeries.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                                {activeSeries.length === 0 && !seriesError && <option value="">Loading series...</option>}
                                {seriesError && <option value="">Error: {seriesError}</option>}
                            </select>
                            {seriesError && (
                                <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>
                                    {seriesError} <button onClick={fetchActiveSeries} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
                                </p>
                            )}

                            <h4 style={{ color: 'var(--text-muted)' }}>Custom Fantasy Points</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div><label style={{fontSize:'0.8rem'}}>Run</label><input type="number" className="input-field" value={newTourney.run} onChange={(e) => setNewTourney({ ...newTourney, run: e.target.value })} /></div>
                                <div><label style={{fontSize:'0.8rem'}}>Wicket</label><input type="number" className="input-field" value={newTourney.wicket} onChange={(e) => setNewTourney({ ...newTourney, wicket: e.target.value })} /></div>
                                <div><label style={{fontSize:'0.8rem'}}>Four Bonus</label><input type="number" className="input-field" value={newTourney.four} onChange={(e) => setNewTourney({ ...newTourney, four: e.target.value })} /></div>
                                <div><label style={{fontSize:'0.8rem'}}>Six Bonus</label><input type="number" className="input-field" value={newTourney.six} onChange={(e) => setNewTourney({ ...newTourney, six: e.target.value })} /></div>
                                <div><label style={{fontSize:'0.8rem'}}>Catch</label><input type="number" className="input-field" value={newTourney.catch} onChange={(e) => setNewTourney({ ...newTourney, catch: e.target.value })} /></div>
                                <div><label style={{fontSize:'0.8rem'}}>Maiden</label><input type="number" className="input-field" value={newTourney.maiden} onChange={(e) => setNewTourney({ ...newTourney, maiden: e.target.value })} /></div>
                            </div>
                            <button type="submit" className="btn btn-primary">Start Now</button>
                        </form>
                    )}
                </div>
            </div>

            <h2 style={{ marginTop: '50px', marginBottom: '24px' }}>My Tournaments</h2>
            {tournaments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You haven't joined any tournaments yet.</p>
            ) : (
                <div className="grid">
                    <AnimatePresence>
                        {tournaments.map((t, index) => (
                            <motion.div 
                                key={t._id} 
                                className="card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{t.name}</h2>
                                    <span className={`badge ${t.status === 'live' ? 'badge-success' : 'badge-danger'}`}>
                                        {t.status.toUpperCase()}
                                    </span>
                                </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Invite Code: <strong style={{ color: '#fff' }}>{t.inviteCode}</strong></p>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(t.inviteCode);
                                        alert('Invite code copied!');
                                    }}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
                                >
                                    Copy
                                </button>
                             </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Budget: ₹{(t.totalBudget/10000000).toFixed(1)} Cr</p>
                            
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>My Rank</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)', margin: 0 }}>#{t.userRank}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Players</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>{t.totalUsers}</p>
                                </div>
                             </div>

                             <div style={{ display: 'flex', gap: '10px' }}>
                                <Link to={`/tournament/${t._id}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>Enter</Link>
                                <Link to={`/squad/${t._id}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center' }}>My Squad</Link>
                                {t.adminId === user.id && (
                                    <button 
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this tournament?')) {
                                                axios.delete(`${API_URL}/tournament/${t._id}`)
                                                    .then(() => fetchTournaments())
                                                    .catch(() => alert('Failed to delete'));
                                            }
                                        }}
                                        className="btn btn-danger" 
                                        style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
