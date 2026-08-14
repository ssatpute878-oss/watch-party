import React, { useEffect, useRef } from 'react';

// Single Stream Tile Component
const VideoTile = ({ stream, isLocal, name, isHost, audioEnabled, videoEnabled, isScreenSharing }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{
      position: 'relative',
      width: '160px',
      height: '110px',
      minWidth: '160px',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      background: '#1E293B',
      border: isScreenSharing ? '2px solid var(--accent)' : '1px solid var(--bg-glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {videoEnabled !== false ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '1.1rem'
          }}>
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Camera Off</span>
        </div>
      )}

      {/* Badges Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '6px',
        left: '6px',
        right: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(11, 15, 25, 0.75)',
        backdropFilter: 'blur(4px)',
        padding: '0.15rem 0.4rem',
        borderRadius: '4px',
        fontSize: '0.7rem'
      }}>
        <span style={{ color: '#ffffff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>
          {isLocal ? `${name} (You)` : name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {audioEnabled === false && <span title="Microphone Muted" style={{ fontSize: '0.7rem' }}>🔇</span>}
          {isScreenSharing && <span title="Screen Sharing" style={{ fontSize: '0.7rem' }}>🖥️</span>}
        </div>
      </div>

      {isHost && (
        <span className="badge badge-host" style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '0.6rem', padding: '0.15rem 0.35rem' }}>
          HOST
        </span>
      )}
    </div>
  );
};

const VideoCall = ({ localStream, remoteStreams, currentUser, isMicOn, isCameraOn, isScreenSharing }) => {
  const remotePeersArray = Array.from(remoteStreams.entries());

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      overflowX: 'auto',
      padding: '0.25rem'
    }}>
      {/* Local Video Tile */}
      <VideoTile
        stream={localStream}
        isLocal={true}
        name={currentUser?.name || 'You'}
        isHost={currentUser?.isHost}
        audioEnabled={isMicOn}
        videoEnabled={isCameraOn}
        isScreenSharing={isScreenSharing}
      />

      {/* Remote Peer Video Tiles */}
      {remotePeersArray.map(([socketId, peerData]) => (
        <VideoTile
          key={socketId}
          stream={peerData.stream}
          isLocal={false}
          name={peerData.name || peerData.username || 'Peer'}
          isHost={peerData.isHost}
          audioEnabled={peerData.audioEnabled}
          videoEnabled={peerData.videoEnabled}
          isScreenSharing={peerData.screenSharing}
        />
      ))}
    </div>
  );
}

export default VideoCall;
