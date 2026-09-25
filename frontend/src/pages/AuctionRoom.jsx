import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_URL, SOCKET_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MessageSquare, Send, Gavel, ChevronLeft } from 'lucide-react';

export default function AuctionRoom() {
    const { id } = useParams();
    const { user, token } = useAuth();
    const socketRef = useRef(null);
    const [auctionData, setAuctionData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [soldMessage, setSoldMessage] = useState(null);
    const [error, setError] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [squad, setSquad] = useState(null);
    const [soldHistory, setSoldHistory] = useState([]);
    
    // Chat state
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);
    
    const navigate = useNavigate();

    const fetchInitial = useCallback(async () => {
        try {
            const [aucRes, sqRes, histRes] = await Promise.all([
                axios.get(`${API_URL}/auction/${id}`),
                axios.get(`${API_URL}/squad/${id}`),
                axios.get(`${API_URL}/auction/history/${id}`)
            ]);
            
            setAuctionData(aucRes.data);
            if (aucRes.data?.timerEndsAt) {
                const tr = Math.max(0, new Date(aucRes.data.timerEndsAt).getTime() - Date.now());
                setTimeRemaining(tr);
            }
            setSquad(sqRes.data);
            setSoldHistory(histRes.data || []);
        } catch (err) {
            console.error('Error fetching auction state:', err);
        }
    }, [id]);

    useEffect(() => {
        fetchInitial();

        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('joinAuction', { tournamentId: id, token });
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('auctionStarted', () => {
            fetchInitial();
        });

        socket.on('newHighestBid', (data) => {
            setAuctionData(prev => ({
                ...prev,
                currentBid: data.currentBid,
                highestBidder: { _id: data.highestBidderId, username: data.highestBidderName }
            }));
            setError('');
        });

        socket.on('auctionTimerUpdate', (data) => {
            setTimeRemaining(data.timeRemaining);
        });

        socket.on('playerSold', (data) => {
            setSoldMessage(`${data.playerName} sold to ${data.winnerName} for ₹${data.amount?.toLocaleString()}`);
            
            if (data.winnerId === user?.id) {
                setSquad(prev => prev ? ({
                    ...prev,
                    budgetRemaining: prev.budgetRemaining - data.amount
                }) : null);
            }

            setSoldHistory(prev => [{
                playerName: data.playerName,
                boughtFor: data.amount,
                winner: data.winnerName,
                time: new Date()
            }, ...prev].slice(0, 5));

            setTimeout(() => {
                setSoldMessage(null);
                navigate(`/tournament/${id}`);
            }, 4000);
        });

        socket.on('playerUnsold', (data) => {
            setSoldMessage(`${data.playerName} went Unsold!`);
            setTimeout(() => {
                setSoldMessage(null);
                navigate(`/tournament/${id}`);
            }, 4000);
        });

        socket.on('receiveChatMessage', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('error', (msg) => {
            setError(msg);
            setTimeout(() => setError(''), 3000);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [id, token, navigate, fetchInitial, user?.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const placeBid = () => {
        if (socketRef.current) {
            socketRef.current.emit('placeBid', { tournamentId: id });
        }
    };

    const sendChat = (e) => {
        e.preventDefault();
        if (socketRef.current && chatInput.trim()) {
            socketRef.current.emit('chatMessage', { tournamentId: id, text: chatInput });
            setChatInput('');
        }
    };

    if (!auctionData || !auctionData.currentPlayerId) {
        return (
            <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Link to={`/tournament/${id}`} className="back-btn" style={{ marginBottom: '20px', display: 'inline-flex' }}>
                    <ChevronLeft size={18} /> Back to Lobby
                </Link>
                <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px' }}>
                    <h2 style={{ marginBottom: '15px' }}>Waiting for Auction to Start...</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>The tournament host has not started the next player auction round yet.</p>
                    <Link to={`/tournament/${id}`} className="btn btn-primary">Return to Tournament Lobby</Link>
                </div>
            </div>
        );
    }

    const player = auctionData.currentPlayerId;

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px' }}>
            <Link to={`/tournament/${id}`} className="back-btn"><ChevronLeft size={18} /> Back to Lobby</Link>
            {!isConnected && (
                <div style={{ background: 'var(--danger)', color: '#fff', padding: '10px', textAlign: 'center', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
                    ⚠️ Connection lost. Trying to reconnect...
                </div>
            )}
            <div className="flex-col-mobile-center" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div className={`badge ${isConnected ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
                    {isConnected ? 'Live Auction Room' : 'Disconnected'}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Budget Status</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{squad?.budgetRemaining?.toLocaleString() || 0}</p>
                    <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, ((squad?.budgetRemaining || 0) / 100000000) * 100)}%` }}
                            style={{ height: '100%', background: 'linear-gradient(to right, var(--danger), var(--success))', borderRadius: '3px' }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {soldMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ background: 'var(--success)', color: '#000', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold', width: '100%' }}
                    >
                        {soldMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-col-mobile" style={{ display: 'flex', gap: '30px' }}>
                
                {/* Main Auction Block */}
                <div className="card" style={{ flex: 2, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)' }}></div>
                    
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', position: 'relative', zIndex: 1 }}>{player.name}</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                        <span className="badge" style={{ fontSize: '1rem', background: 'rgba(255,255,255,0.1)' }}>{(player.role || 'Player').toUpperCase()}</span>
                        <span className="badge" style={{ fontSize: '1rem', background: 'rgba(255,255,255,0.1)' }}>{player.country || 'International'}</span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '30px', borderRadius: '12px', marginBottom: '30px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '10px' }}>Current Bid</p>
                        <motion.h2 
                            key={auctionData.currentBid}
                            initial={{ scale: 1.5, color: '#fff' }}
                            animate={{ scale: 1, color: 'var(--accent-primary)' }}
                            style={{ fontSize: '4rem', margin: 0 }}
                        >
                            ₹{auctionData.currentBid?.toLocaleString() || 0}
                        </motion.h2>
                        {auctionData.highestBidder && (
                            <p style={{ fontSize: '1.2rem', marginTop: '10px', color: 'var(--success)' }}>
                                Highest Bidder: {auctionData.highestBidder.username}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                        <Clock size={30} color={timeRemaining < 5000 ? 'var(--danger)' : 'var(--text-light)'} />
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: timeRemaining < 5000 ? 'var(--danger)' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
                            {(timeRemaining / 1000).toFixed(1)}s
                        </span>
                    </div>

                    {error && <p style={{ color: 'var(--danger)', marginBottom: '20px' }}>{error}</p>}

                    <button 
                        onClick={placeBid} 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '20px', fontSize: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', background: timeRemaining <= 0 ? '#555' : 'linear-gradient(135deg, var(--success), #10b981)' }}
                        disabled={timeRemaining <= 0 || (auctionData.highestBidder?._id === user?.id)}
                    >
                        <Gavel size={28} /> {auctionData.highestBidder?._id === user?.id ? 'You are Highest Bidder' : 'Place Bid'}
                    </button>
                </div>

                {/* Live Chat Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '15px' }}>
                            <MessageSquare size={20} color="var(--accent-primary)" /> Live Auction Chat
                        </h3>
                        
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {messages.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '30px' }}>No messages yet.</p>}
                            {messages.map((m, i) => (
                                <div key={i} style={{ background: m.user === user?.username ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', alignSelf: m.user === user?.username ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                    <div style={{ fontSize: '0.7rem', color: m.user === user?.username ? 'var(--accent-primary)' : 'var(--text-muted)', marginBottom: '2px' }}>{m.user}</div>
                                    <div style={{ fontSize: '0.9rem' }}>{m.text}</div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={sendChat} style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                className="input-field" 
                                style={{ margin: 0, flex: 1, fontSize: '0.9rem' }}
                                placeholder="Type a message..." 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '8px' }}><Send size={16} /></button>
                        </form>
                    </div>

                    <div className="card" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-muted)' }}>Recently Sold</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {soldHistory.map((h, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: 'bold' }}>{h.playerName}</span>
                                    <span style={{ color: 'var(--success)' }}>₹{(h.boughtFor/100000).toFixed(1)}L to {h.winner}</span>
                                </div>
                            ))}
                            {soldHistory.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No players sold yet.</p>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
