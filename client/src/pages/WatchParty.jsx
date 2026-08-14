import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import PartyHeader from '../components/PartyHeader';
import VideoPlayer from '../components/VideoPlayer';

function WatchParty() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'participants'

  const isHost = party && user && (party.host?._id === user._id || party.host === user._id);

  // Fetch party metadata
  useEffect(() => {
    const fetchParty = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/parties/${roomId}`);
        if (res.data.success && res.data.party) {
          setParty(res.data.party);
        } else {
          setError('Watch party not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to join watch party.');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchParty();
    }
  }, [roomId]);

  // Handle Socket.IO connection & room joining
  useEffect(() => {
    if (!socket || !isConnected || !party || !user) return;

    socket.emit('join-room', {
      roomId: party.roomId,
      userId: user._id,
      name: user.name,
      isHost
    });

    socket.on('room-users', (usersList) => {
      setParticipants(usersList);
    });

    socket.on('party-ended', ({ message }) => {
      alert(message || 'The host has ended this watch party.');
      navigate('/dashboard');
    });

    return () => {
      socket.emit('leave-room', { roomId: party.roomId });
      socket.off('room-users');
      socket.off('party-ended');
    };
  }, [socket, isConnected, party, user, isHost, navigate]);

  const handleLeaveParty = () => {
    if (socket && party) {
      socket.emit('leave-room', { roomId: party.roomId });
    }
    navigate('/dashboard');
  };

  const handleEndParty = async () => {
    if (!window.confirm('Are you sure you want to end this watch party for everyone?')) return;
    try {
      if (socket && party) {
        socket.emit('end-party', { roomId: party.roomId });
      }
      await API.delete(`/parties/${party.roomId}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to end party:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Connecting to Watch Party...</p>
      </div>
    );
  }

  if (error || !party) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-card fade-in" style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Watch Party Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'This party room does not exist or has ended.'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Header */}
      <PartyHeader
        party={party}
        isHost={isHost}
        participantCount={participants.length}
        onLeaveParty={handleLeaveParty}
        onEndParty={handleEndParty}
      />

      {/* Main Room Layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '1rem',
        padding: '1rem',
        overflow: 'hidden',
        height: 'calc(100vh - 65px)'
      }}>
        {/* Left Side: Theater & Call Stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          {/* Main Video Theater */}
          <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <VideoPlayer
              videoUrl={party.videoUrl}
              roomId={party.roomId}
              socket={socket}
              isHost={isHost}
            />
          </div>

          {/* WebRTC Video Call Grid Shell */}
          <div className="glass-card" style={{ height: '140px', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📹 Video Grid Shell</div>
          </div>
        </div>

        {/* Right Side: Chat & Participants Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--bg-glass-border)' }}>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: activeTab === 'chat' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: 'none',
                color: activeTab === 'chat' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: activeTab === 'chat' ? 600 : 500,
                cursor: 'pointer',
                borderBottom: activeTab === 'chat' ? '2px solid var(--primary)' : 'none'
              }}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: activeTab === 'participants' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: 'none',
                color: activeTab === 'participants' ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: activeTab === 'participants' ? 600 : 500,
                cursor: 'pointer',
                borderBottom: activeTab === 'participants' ? '2px solid var(--primary)' : 'none'
              }}
            >
              👥 People ({participants.length})
            </button>
          </div>

          {/* Panel Content */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
            {activeTab === 'chat' ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Chat message feed shell</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {participants.map((p) => (
                  <div key={p.socketId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)' }}>
                    <span>{p.name}</span>
                    {p.isHost && <span className="badge badge-host">HOST</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchParty;
