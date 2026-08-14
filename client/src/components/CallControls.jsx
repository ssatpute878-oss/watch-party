import React, { useState, useRef } from 'react';

function CallControls({
  isMicOn,
  isCameraOn,
  isScreenSharing,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onLeaveParty,
  isHost
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);

  // Host optional local MediaRecorder session recording
  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording host browser display/media
      try {
        const captureStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        const chunks = [];
        const recorder = new MediaRecorder(captureStream);

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `watch-party-session-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);

        captureStream.getVideoTracks()[0].onended = () => {
          if (recorder.state !== 'inactive') {
            recorder.stop();
            setIsRecording(false);
          }
        };
      } catch (err) {
        console.warn('Session recording cancelled or unsupported:', err.message);
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '0.75rem 1.5rem',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--bg-glass-border)',
      borderBottomLeftRadius: 'var(--radius-lg)',
      borderBottomRightRadius: 'var(--radius-lg)'
    }}>
      {/* Microphone Toggle */}
      <button
        onClick={onToggleMic}
        className={`btn btn-icon ${isMicOn ? 'active' : 'muted'}`}
        title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
      >
        {isMicOn ? '🎤' : '🎙️'}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={onToggleCamera}
        className={`btn btn-icon ${isCameraOn ? 'active' : 'muted'}`}
        title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
      >
        {isCameraOn ? '📷' : '📹'}
      </button>

      {/* Screen Sharing Toggle */}
      <button
        onClick={onToggleScreenShare}
        className={`btn btn-icon ${isScreenSharing ? 'active' : 'btn-secondary'}`}
        title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
      >
        🖥️
      </button>

      {/* Host Optional Local Session Recording */}
      {isHost && (
        <button
          onClick={handleToggleRecording}
          className={`btn btn-icon ${isRecording ? 'muted' : 'btn-secondary'}`}
          title={isRecording ? 'Stop Recording Session' : 'Record Session (Host Only)'}
          style={{ position: 'relative' }}
        >
          {isRecording ? '⏹️' : '⏺️'}
        </button>
      )}

      {/* Leave Call / Party */}
      <button
        onClick={onLeaveParty}
        className="btn btn-danger"
        style={{ padding: '0.6rem 1.25rem', borderRadius: '24px', fontSize: '0.9rem' }}
        title="Leave Party Room"
      >
        📞 Leave Party
      </button>
    </div>
  );
}

export default CallControls;
