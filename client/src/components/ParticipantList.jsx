import React from 'react';

function ParticipantList({ participants, currentUserId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
        {participants.length} {participants.length === 1 ? 'Participant' : 'Participants'} in Room:
      </div>

      {participants.map((p) => {
        const isSelf = p.userId === currentUserId || p.socketId === currentUserId;

        return (
          <div
            key={p.socketId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: isSelf ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.04)',
              border: isSelf ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--bg-glass-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#ffffff' }}>
                {p.name} {isSelf && '(You)'}
              </span>
              {p.isHost && <span className="badge badge-host">HOST</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span title={p.audioEnabled ? 'Microphone Active' : 'Microphone Muted'}>
                {p.audioEnabled !== false ? '🎤' : '🔇'}
              </span>
              <span title={p.videoEnabled ? 'Camera Active' : 'Camera Off'}>
                {p.videoEnabled !== false ? '📷' : '🚫'}
              </span>
              {p.screenSharing && (
                <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>
                  🖥️ Sharing
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ParticipantList;
