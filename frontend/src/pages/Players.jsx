import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function Players() {
    const [players, setPlayers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await axios.get(`${API_URL}/players`);
                setPlayers(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPlayers();
    }, []);

    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Player Database</h1>
            <input 
                type="text" 
                className="input-field" 
                placeholder="Search players..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ maxWidth: '400px', marginBottom: '40px' }}
            />

            <div className="grid">
                {filteredPlayers.map(p => (
                    <div key={p._id} className="card">
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>{p.name}</h3>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <span className="badge">{p.role}</span>
                            <span className="badge">{p.country || 'INT'}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>Base Price: <strong style={{ color: '#fff' }}>₹{p.basePrice.toLocaleString()}</strong></p>
                    </div>
                ))}
            </div>
            {filteredPlayers.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No players found.</p>}
        </div>
    );
}
