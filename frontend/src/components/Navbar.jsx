import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Layout, LogOut, User, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (!user) return;
        const socket = io(SOCKET_URL);
        
        socket.on('connect', () => {
            socket.emit('joinNotifications', { userId: user.id });
        });

        socket.on('auctionStartedNotify', (data) => {
            setNotification(data);
            setTimeout(() => setNotification(null), 8000);
        });

        return () => socket.disconnect();
    }, [user]);

    if (!user) return null;

    return (
        <>
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 10 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ 
                            position: 'fixed', 
                            top: 80, 
                            right: 40, 
                            zIndex: 1000, 
                            background: 'var(--bg-card)', 
                            border: '1px solid var(--accent-primary)',
                            padding: '15px 20px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            maxWidth: '350px'
                        }}
                    >
                        <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '50%' }}>
                            <Bell size={20} color="var(--accent-primary)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Auction Started!</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notification.tournamentName} is auctioning {notification.playerName}</div>
                            <Link to={`/auction/${notification.tournamentId}`} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '5px', display: 'block' }}>Join Now →</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav style={{ 
                background: 'rgba(15, 23, 42, 0.8)', 
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '15px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'var(--accent-primary)', padding: '5px', borderRadius: '8px' }}>
                    <Layout size={20} color="#000" />
                </div>
                <span className="d-none-mobile" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>CricketAuction</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/dashboard" style={{ color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                    <Home size={18} /> <span className="d-none-mobile">Dashboard</span>
                </Link>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', textDecoration: 'none' }}>
                        <User size={16} color="var(--accent-primary)" />
                        <span className="d-none-mobile" style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.teamName}</span>
                    </Link>
                    <button 
                        onClick={() => {
                            logout();
                            window.location.href = '/';
                        }} 
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '5px' }}
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </nav>
        </>
    );
}
