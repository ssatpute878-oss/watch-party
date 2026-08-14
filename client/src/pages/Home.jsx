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
      <main style={{ flex: 1, padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="fade-in">
          <span className="badge badge-room" style={{ marginBottom: '1.25rem', fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            🎬 Real-time WebRTC & Socket.IO Platform
          </span>
          <h1 style={{
            fontSize: 'calc(2.5rem + 1.5vw)',
            marginBottom: '1.25rem',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 50%, #EC4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '850px',
            margin: '0 auto 1.25rem auto'
          }}>
            Watch Together. Stay Together.
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: '650px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6
          }}>
            Create a private room, invite your friends, watch videos together in real-time, chat, and connect seamlessly through live video calls.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                  Create Watch Party
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
                  Join Watch Party
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          <div className="glass-card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Synchronized Playback</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Play, pause, and seek events stay synced instantly across all participants without video lag.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📹</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>WebRTC Video Call</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Crystal clear peer-to-peer audio and video calling while enjoying your favorite videos together.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Real-time Room Chat</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Send instant messages, reactions, and live comments inside room-scoped chat channels.
            </p>
          </div>

          <div className="glass-card">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🖥️</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Screen Sharing</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Share your browser window, full display, or video stream with participants at high quality.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        borderTop: '1px solid var(--bg-glass-border)',
        color: 'var(--text-dim)',
        fontSize: '0.875rem'
      }}>
        Watch Party &copy; {new Date().getFullYear()} — Built with React, Node.js, Socket.IO & WebRTC.
      </footer>
    </div>
  );
}

export default Home;
