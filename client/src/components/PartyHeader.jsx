import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PartyHeader({ party, isHost, participantCount, onLeaveParty, onEndParty }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = async () => {
    const inviteUrl = `${window.location.origin}/party/${party?.roomId}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
    }
  };

  return (
    <header className="glass-panel" style={{
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '0.85rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      {/* Left info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
        >
          &larr; Dashboard
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {party?.name || 'Watch Party'}
            {isHost && <span className="badge badge-host">HOST</span>}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem' }}>
            <span className="badge badge-room">ID: {party?.roomId}</span>
            <button
              onClick={handleCopyInvite}
              className="btn btn-secondary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              {copied ? '✅ Link Copied!' : '📋 Copy Invite'}
            </button>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--bg-glass-border)'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
          <span>{participantCount} Active {participantCount === 1 ? 'User' : 'Users'}</span>
        </div>

        {isHost ? (
          <button onClick={onEndParty} className="btn btn-danger" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
            End Party
          </button>
        ) : (
          <button onClick={onLeaveParty} className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
            Leave Party
          </button>
        )}
      </div>
    </header>
  );
}

export default PartyHeader;
