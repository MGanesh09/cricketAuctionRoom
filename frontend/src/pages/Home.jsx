import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Gavel, TrendingUp, Zap, Shield } from 'lucide-react';
import Scoreboard from '../components/Scoreboard';

export default function Home() {
  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* Hero Section */}
      <div style={{ position: 'relative', padding: '100px 20px', textAlign: 'center', overflow: 'hidden' }}>
        {/* Animated Background Glows */}
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{ position: 'absolute', top: '-10%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', zIndex: 0 }}
        />
        <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity }}
            style={{ position: 'absolute', bottom: '10%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', zIndex: 0 }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="badge-success" style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '30px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid var(--success)' }}>
                🚀 The Future of Fantasy Cricket is Here
            </div>
            <h1 style={{ fontSize: '5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px' }}>
                Build Your <span style={{ background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Dynasty</span>
            </h1>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                Experience the most intense real-time auction platform. Bid, build, and dominate the leaderboard in the ultimate cricket fantasy arena.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <Link to="/login" className="btn btn-primary" style={{ padding: '18px 40px', fontSize: '1.2rem' }}>Start Your Auction</Link>
                <a href="#features" className="btn btn-outline" style={{ padding: '18px 40px', fontSize: '1.2rem' }}>Explore Features</a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live Scoreboard Preview */}
      <div className="container" style={{ marginBottom: '100px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card" 
            style={{ padding: '40px', background: 'var(--bg-glass)', backdropFilter: 'blur(20px)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Zap color="var(--accent-primary)" fill="var(--accent-primary)" /> Live Match Center
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>REAL-TIME DATA</span>
                </div>
            </div>
            <Scoreboard />
          </motion.div>
      </div>

      {/* Features Grid */}
      <div id="features" className="container" style={{ paddingBottom: '100px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '60px' }}>Why <span style={{ color: 'var(--accent-primary)' }}>CricketAuction?</span></h2>
        <div className="grid">
            {[
                { icon: <Gavel size={32} />, title: "Live Real-Time Auction", desc: "Experience the thrill of a live auction with sub-second bid latency and real-time budget tracking." },
                { icon: <Shield size={32} />, title: "Custom Point Systems", desc: "Create your own rules. Customize points for runs, wickets, and bonuses to match your league's style." },
                { icon: <TrendingUp size={32} />, title: "Live Leaderboards", desc: "Watch your rank climb in real-time as match results are synced directly from the global database." },
                { icon: <Users size={32} />, title: "Global Communities", desc: "Join thousands of managers. Create private leagues with friends or battle in public tournaments." }
            ].map((f, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="card"
                    whileHover={{ translateY: -10, borderColor: 'var(--accent-primary)' }}
                >
                    <div style={{ background: 'rgba(6, 182, 212, 0.1)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--accent-primary)' }}>
                        {f.icon}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{f.title}</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
                </motion.div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 20px', textAlign: 'center' }}>
          <div className="container">
              <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '20px' }}>CricketAuction</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>The ultimate playground for cricket strategists.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                  <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy</a>
                  <a href="#" style={{ color: 'var(--text-muted)' }}>Terms</a>
                  <a href="#" style={{ color: 'var(--text-muted)' }}>Support</a>
              </div>
          </div>
      </footer>

    </div>
  );
}
