import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';

function JoinParty() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanRoomId = roomId.trim();

    if (!cleanRoomId) {
      setError('Please enter a Room ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await API.get(`/parties/${cleanRoomId}`);
      if (res.data.success && res.data.party) {
        navigate(`/party/${cleanRoomId}`);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Watch party not found or inactive. Please check the Room ID.');
      } else {
        setError(err.response?.data?.message || 'Failed to verify watch party room.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '540px', margin: '0 auto', width: '100%' }}>
        <div className="glass-card fade-in">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Join Watch Party</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Enter the unique Room ID provided by your host to join the session.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Room ID / Code</label>
              <input
                type="text"
                name="roomId"
                className="form-input"
                placeholder="e.g. room-a1b2c3d4"
                value={roomId}
                onChange={(e) => { setRoomId(e.target.value); setError(''); }}
                required
                style={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '0.05em' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Enter Party Room'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default JoinParty;
