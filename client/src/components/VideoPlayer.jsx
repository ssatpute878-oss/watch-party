import React, { useEffect, useRef, useState } from 'react';

// Helper to extract YouTube Video ID
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

function VideoPlayer({ videoUrl, roomId, socket, isHost }) {
  const videoRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [videoError, setVideoError] = useState('');

  const youtubeId = getYouTubeVideoId(videoUrl);

  // Handle Socket Events for Sync (For standard video player)
  useEffect(() => {
    if (!socket || !roomId || youtubeId) return;

    // Listen for remote play
    socket.on('video-play', ({ currentTime, senderId }) => {
      if (!videoRef.current || senderId === socket.id) return;
      isRemoteUpdate.current = true;

      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      }

      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
        showSyncBadge('▶️ Synced Play');
      }).catch(err => {
        console.warn('Autoplay blocked by browser policy:', err.message);
        setAutoplayBlocked(true);
      });
    });

    // Listen for remote pause
    socket.on('video-pause', ({ currentTime, senderId }) => {
      if (!videoRef.current || senderId === socket.id) return;
      isRemoteUpdate.current = true;
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      }
      videoRef.current.pause();
      setIsPlaying(false);
      showSyncBadge('⏸️ Synced Pause');
    });

    // Listen for remote seek / 10s skip
    socket.on('video-seek', ({ currentTime, senderId }) => {
      if (!videoRef.current || senderId === socket.id) return;
      isRemoteUpdate.current = true;
      videoRef.current.currentTime = currentTime;
      showSyncBadge(`⏩ Synced to ${formatTime(currentTime)}`);
    });

    // Handle initial sync request
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

    // Listen for initial sync state
    socket.on('video-sync', ({ currentTime, isPlaying }) => {
      if (!videoRef.current) return;
      isRemoteUpdate.current = true;
      videoRef.current.currentTime = currentTime;
      if (isPlaying) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }).catch(() => {
          setAutoplayBlocked(true);
        });
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
  }, [socket, roomId, isHost, videoUrl, youtubeId]);

  const showSyncBadge = (msg) => {
    setSyncNotice(msg);
    setTimeout(() => setSyncNotice(''), 2500);
  };

  const handleManualReSync = () => {
    if (socket && roomId) {
      socket.emit('request-initial-sync', { roomId });
      showSyncBadge('🔄 Requesting Sync...');
    }
  };

  const handleSkipTime = (seconds) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, videoRef.current.currentTime + seconds);
    videoRef.current.currentTime = newTime;
    showSyncBadge(seconds > 0 ? `⏩ +${seconds}s` : `⏪ ${seconds}s`);

    if (socket && roomId) {
      socket.emit('video-seek', { roomId, currentTime: newTime });
    }
  };

  const handleStartPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
        if (socket && roomId) {
          socket.emit('video-play', { roomId, currentTime: videoRef.current.currentTime });
        }
      }).catch(err => console.error('Play click error:', err));
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Local Video Event Handlers
  const handlePlay = () => {
    setIsPlaying(true);
    setAutoplayBlocked(false);
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

  const handleSeeking = () => {
    if (isRemoteUpdate.current) {
      return;
    }
    if (socket && videoRef.current) {
      socket.emit('video-seek', { roomId, currentTime: videoRef.current.currentTime });
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

  const handleMediaError = (e) => {
    console.error('Video Load Error:', e);
    setVideoError('Unable to load video stream. Please verify the video URL is a direct MP4 link or YouTube URL.');
  };

  // 1. YouTube Video Embed Player
  if (youtubeId) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <iframe
          title="YouTube Watch Party Video"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&enablejsapi=1`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Standard HTML5 Video Player
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
      {/* Synchronization Toast Badge */}
      {syncNotice && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 20,
          background: 'rgba(19, 27, 46, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--primary)',
          color: '#ffffff',
          padding: '0.35rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeIn 0.2s ease'
        }}>
          {syncNotice}
        </div>
      )}

      {/* Control Overlay: Skip -10s, Re-Sync, Skip +10s */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
        <button
          onClick={() => handleSkipTime(-10)}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          title="Skip 10 seconds back (Syncs for everyone)"
        >
          ⏪ -10s
        </button>

        <button
          onClick={() => handleSkipTime(10)}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          title="Skip 10 seconds forward (Syncs for everyone)"
        >
          ⏩ +10s
        </button>

        <button
          onClick={handleManualReSync}
          className="btn btn-secondary"
          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
          title="Click to re-sync video timestamp with host"
        >
          🔄 Re-Sync
        </button>
      </div>

      {/* Browser Autoplay Blocked Overlay */}
      {autoplayBlocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 30,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.3rem' }}>▶️ Click to Join Video Playback</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px' }}>
            Browser security policy requires user interaction before playing audio/video.
          </p>
          <button onClick={handleStartPlay} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            Start Watching
          </button>
        </div>
      )}

      {/* Video Load Error Banner */}
      {videoError ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
          <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1rem auto' }}>{videoError}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            URL: <code style={{ wordBreak: 'break-all' }}>{videoUrl}</code>
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeking={handleSeeking}
          onSeeked={handleSeeked}
          onError={handleMediaError}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            outline: 'none'
          }}
        />
      )}
    </div>
  );
}

export default VideoPlayer;
