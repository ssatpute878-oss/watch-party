import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <main style={{ flex: 1, padding: '2.5rem 1.25rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="fade-in">
          <span className="badge badge-room" style={{ marginBottom: '1.25rem', fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
            🎬 Real-time WebRTC & Socket.IO Platform
          </span>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 50%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '850px',
            margin: '0 auto 1rem auto'
          }}>
            Watch Together. Stay Together.
          </h1>
          <p style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
            color: 'var(--text-muted)',
            maxWidth: '650px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}>
            Create a private room, invite your friends, watch videos together in real-time, chat, and connect seamlessly through live video calls.
          </p>

          <div className="hero-cta-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                  Create Watch Party
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                  Join Watch Party
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginTop: '1rem'
        }}>
          <div className="glass-card">
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Synchronized Playback</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Play, pause, and seek events stay synced instantly across all participants without video lag.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>📹</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>WebRTC Video Call</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Crystal clear peer-to-peer audio and video calling while enjoying your favorite videos together.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>💬</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Real-time Room Chat</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Send instant messages, reactions, and live comments inside room-scoped chat channels.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🖥️</div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Screen Sharing</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Share your browser window, full display, or video stream with participants at high quality.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem 1rem',
        borderTop: '1px solid var(--bg-glass-border)',
        color: 'var(--text-dim)',
        fontSize: '0.85rem'
      }}>
        Watch Party &copy; {new Date().getFullYear()} — Built with React, Node.js, Socket.IO & WebRTC.
      </footer>
    </div>
  );
}

export default Home;
