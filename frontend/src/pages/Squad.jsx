import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { Shield, Star } from 'lucide-react';

export default function Squad() {
    const { tournamentId } = useParams();
    const [squad, setSquad] = useState(null);
    const [captainId, setCaptainId] = useState('');
    const [viceCaptainId, setViceCaptainId] = useState('');

    useEffect(() => {
        const fetchSquad = async () => {
            try {
                const res = await axios.get(`${API_URL}/squad/${tournamentId}`);
                setSquad(res.data);
                if (res.data.captainId) setCaptainId(res.data.captainId._id);
                if (res.data.viceCaptainId) setViceCaptainId(res.data.viceCaptainId._id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSquad();
    }, [tournamentId]);

    const saveRoles = async () => {
        try {
            await axios.post(`${API_URL}/squad/set-captain`, { tournamentId, captainId, viceCaptainId });
            alert('Roles saved successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving roles');
        }
    };

    if (!squad) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem' }}>My Squad</h1>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Budget Remaining</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{squad.budgetRemaining.toLocaleString()}</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={24} /> Set Captain & Vice Captain</h2>
                <div className="grid">
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Captain (2x Points)</label>
                        <select className="input-field" value={captainId} onChange={e => setCaptainId(e.target.value)}>
                            <option value="">Select Captain</option>
                            {squad.players.filter(p => p?.playerId).map(p => (
                                <option key={p.playerId._id} value={p.playerId._id}>{p.playerId.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Vice Captain (1.5x Points)</label>
                        <select className="input-field" value={viceCaptainId} onChange={e => setViceCaptainId(e.target.value)}>
                            <option value="">Select Vice Captain</option>
                            {squad.players.filter(p => p?.playerId).map(p => (
                                <option key={p.playerId._id} value={p.playerId._id}>{p.playerId.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={saveRoles} className="btn btn-primary" style={{ marginTop: '10px' }}>Save Roles</button>
            </div>

            <h2 style={{ marginBottom: '20px' }}>Players ({squad.players.length}/24)</h2>
            <div className="grid">
                {squad.players.filter(p => p?.playerId).map(p => (
                    <div key={p.playerId._id} className="card" style={{ position: 'relative' }}>
                        {captainId === p.playerId._id && <div style={{ position: 'absolute', top: 10, right: 10, color: 'gold' }}><Star size={24} fill="gold" /></div>}
                        {viceCaptainId === p.playerId._id && <div style={{ position: 'absolute', top: 10, right: 10, color: 'silver' }}><Star size={24} fill="silver" /></div>}
                        
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', border: '2px solid var(--accent-primary)' }}>
                                {p.playerId.playerImg ? (
                                    <img src={p.playerId.playerImg} alt={p.playerId.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>?</div>
                                )}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{p.playerId.name}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.playerId.role}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <span>Bought for:</span>
                            <strong style={{ color: 'var(--accent-primary)' }}>₹{p.boughtFor?.toLocaleString()}</strong>
                        </div>
                    </div>
                ))}
            </div>
            {squad.players.length === 0 && <p style={{ color: 'var(--text-muted)' }}>You haven't bought any players yet. Join the auction to build your squad!</p>}
            
            <div style={{ marginTop: '40px' }}>
                <Link to={`/tournament/${tournamentId}`} className="btn btn-outline">Back to Tournament</Link>
            </div>
        </div>
    );
}
