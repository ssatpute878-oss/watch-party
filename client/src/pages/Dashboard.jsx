import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quickRoomId, setQuickRoomId] = useState('');
  const [error, setError] = useState('');

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (!quickRoomId.trim()) {
      setError('Please enter a valid Room ID');
      return;
    }
    navigate(`/party/${quickRoomId.trim()}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.25rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Welcome Header */}
        <div className="glass-card fade-in" style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: '0.4rem' }}>
            Welcome back, {user?.name}! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Create a new watch party room or enter an existing Room ID to join your friends.
          </p>
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Create Party Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                marginBottom: '1rem'
              }}>
                🍿
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Create Watch Party</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Host a watch session, select a video URL, invite your friends, and control playback together.
              </p>
            </div>
            <Link to="/create-party" className="btn btn-primary" style={{ width: '100%' }}>
              Create New Room
            </Link>
          </div>

          {/* Quick Join Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(236, 72, 153, 0.15)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                marginBottom: '1rem'
              }}>
                🔑
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Join Existing Party</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                Have a Room ID from a friend? Enter it below to join the room instantly.
              </p>

              {error && (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleQuickJoin} style={{ marginBottom: '0.85rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste Room ID here..."
                  value={quickRoomId}
                  onChange={(e) => { setQuickRoomId(e.target.value); setError(''); }}
                />
                <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.75rem' }}>
                  Join Room
                </button>
              </form>
            </div>
            <Link to="/join-party" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', display: 'block' }}>
              Advanced Join Options &rarr;
            </Link>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.85rem' }}>💡 How to Host & Watch</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', fontSize: '0.85rem' }}>
            <div>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.3rem' }}>1. Create or Join</strong>
              Generate a unique Room ID or use an invite link sent by your host.
            </div>
            <div>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.3rem' }}>2. Universal Video Sync</strong>
              When anyone plays, pauses, or seeks +10s forward, everyone's player stays perfectly in sync.
            </div>
            <div>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.3rem' }}>3. Live WebRTC Call</strong>
              Turn on your camera/mic or share your screen to hang out live while watching.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
