import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Star, TrendingUp, Award, User, Target, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_URL}/user/profile`);
                setProfile(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading Profile Data...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px' }}>
            <Link to="/dashboard" className="back-btn"><ChevronLeft size={18} /> Back to Dashboard</Link>
            {/* Header Section */}
            <div className="flex-col-mobile-center" style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '50px' }}>
                <div style={{ 
                    width: '120px', height: '120px', borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)'
                }}>
                    <User size={60} color="#fff" />
                </div>
                <div className="flex-col-mobile-center">
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '5px', textTransform: 'capitalize' }}>{user.username}</h1>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="badge badge-success" style={{ fontSize: '1.2rem' }}>{user.teamName}</span>
                        {profile?.stats?.tournamentsWon > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fbbf24', fontWeight: 'bold' }}>
                                <Trophy size={18} /> {profile.stats.tournamentsWon}x Champion
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                
                {/* Total Points */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="card" 
                    style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)', border: '1px solid rgba(56,189,248,0.2)' }}
                >
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}><TrendingUp size={150} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(56,189,248,0.1)', padding: '15px', borderRadius: '12px' }}>
                            <TrendingUp size={30} color="var(--accent-primary)" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-muted)' }}>Career Points</h2>
                    </div>
                    <p style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0, background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {profile?.stats?.totalPoints.toLocaleString()}
                    </p>
                </motion.div>

                {/* Tournaments Played */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card" 
                    style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)', border: '1px solid rgba(167,139,250,0.2)' }}
                >
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}><Target size={150} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(167,139,250,0.1)', padding: '15px', borderRadius: '12px' }}>
                            <Target size={30} color="var(--accent-secondary)" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-muted)' }}>Tournaments</h2>
                    </div>
                    <p style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                        {profile?.stats?.tournamentsPlayed}
                    </p>
                </motion.div>
            </div>

            {/* Hall of Fame / Most Expensive Player */}
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star color="#fbbf24" /> Hall of Fame
            </h2>
            
            {profile?.stats?.topPlayer ? (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="card" 
                    style={{ 
                        background: 'linear-gradient(135deg, #1f2937, #111827)', 
                        border: '1px solid rgba(251,191,36,0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Gold mesh effect */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(251,191,36,0.1), transparent 50%)', pointerEvents: 'none' }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '5px' }}>Most Expensive Purchase</p>
                            <h3 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: '#fbbf24' }}>{profile.stats.topPlayer.name}</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{profile.stats.topPlayer.role}</span>
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{profile.stats.topPlayer.country}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <Award size={60} color="#fbbf24" style={{ marginBottom: '10px', opacity: 0.8 }} />
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>₹{(profile.stats.topPlayer.boughtFor/10000000).toFixed(2)} Cr</p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <p>No players purchased yet. Join an auction to start building your legacy!</p>
                </div>
            )}
        </div>
    );
}
