import React, { useEffect, useRef, useState } from 'react';

function VideoPlayer({ videoUrl, roomId, socket, isHost }) {
  const videoRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');

  // Handle Socket Events for Sync
  useEffect(() => {
    if (!socket || !roomId) return;

    // Listen for remote play
    socket.on('video-play', ({ currentTime, senderId }) => {
      if (!videoRef.current) return;
      isRemoteUpdate.current = true;

      // Sync time if drift > 0.5s
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      }

      videoRef.current.play().then(() => {
        setIsPlaying(true);
        showSyncBadge('▶️ Synced Play');
      }).catch(err => console.error('Auto-play error:', err));
    });

    // Listen for remote pause
    socket.on('video-pause', ({ currentTime }) => {
      if (!videoRef.current) return;
      isRemoteUpdate.current = true;
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      }
      videoRef.current.pause();
      setIsPlaying(false);
      showSyncBadge('⏸️ Synced Pause');
    });

    // Listen for remote seek
    socket.on('video-seek', ({ currentTime }) => {
      if (!videoRef.current) return;
      isRemoteUpdate.current = true;
      videoRef.current.currentTime = currentTime;
      showSyncBadge(`⏩ Synced to ${formatTime(currentTime)}`);
    });

    // Handle initial sync request (Host responds to new joiners)
    socket.on('request-initial-sync-from-host', ({ requesterId }) => {
      if (isHost && videoRef.current) {
        socket.emit('provide-initial-sync', {
          targetSocketId: requesterId,
          currentTime: videoRef.current.currentTime,
          isPlaying: !videoRef.current.paused,
          videoUrl
        });
      }
    });

    // Listen for initial sync state (For newly joined participants)
    socket.on('video-sync', ({ currentTime, isPlaying }) => {
      if (!videoRef.current) return;
      isRemoteUpdate.current = true;
      videoRef.current.currentTime = currentTime;
      if (isPlaying) {
        videoRef.current.play().catch(err => console.error(err));
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      showSyncBadge('🔄 Initial State Synced');
    });

    // Request initial sync on load
    socket.emit('request-initial-sync', { roomId });

    return () => {
      socket.off('video-play');
      socket.off('video-pause');
      socket.off('video-seek');
      socket.off('request-initial-sync-from-host');
      socket.off('video-sync');
    };
  }, [socket, roomId, isHost, videoUrl]);

  const showSyncBadge = (msg) => {
    setSyncNotice(msg);
    setTimeout(() => setSyncNotice(''), 2500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Local Video Event Handlers
  const handlePlay = () => {
    setIsPlaying(true);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (socket && videoRef.current) {
      socket.emit('video-play', { roomId, currentTime: videoRef.current.currentTime });
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (socket && videoRef.current) {
      socket.emit('video-pause', { roomId, currentTime: videoRef.current.currentTime });
    }
  };

  const handleSeeked = () => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    if (socket && videoRef.current) {
      socket.emit('video-seek', { roomId, currentTime: videoRef.current.currentTime });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
      {/* Synchronization Toast Badge */}
      {syncNotice && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 20,
          background: 'rgba(19, 27, 46, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--primary)',
          color: '#ffffff',
          padding: '0.4rem 0.9rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.2s ease'
        }}>
          {syncNotice}
        </div>
      )}

      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeeked}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          outline: 'none'
        }}
      />
    </div>
  );
}

export default VideoPlayer;
