import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export const useWebRTC = (socket, roomId, user) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map()); // Map<socketId, { stream, userInfo }>
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState('');

  const peerConnectionsRef = useRef(new Map()); // Map<socketId, RTCPeerConnection>
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  // Initialize Local Media Stream (Camera & Microphone)
  useEffect(() => {
    let isMounted = true;

    const initLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (isMounted) {
          localStreamRef.current = stream;
          setLocalStream(stream);
        }
      } catch (err) {
        console.warn('Camera/Microphone permission denied or unavailable:', err.message);
        setMediaError('Camera/Microphone permission denied. You can still watch & chat!');
        
        // Attempt audio-only fallback
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          if (isMounted) {
            localStreamRef.current = audioStream;
            setLocalStream(audioStream);
            setIsCameraOn(false);
          }
        } catch (audioErr) {
          console.warn('Audio-only fallback also failed:', audioErr.message);
        }
      }
    };

    initLocalMedia();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
      }
    };
  }, []);

  // Helper to create RTCPeerConnection for a peer
  const createPeerConnection = useCallback((targetSocketId) => {
    if (peerConnectionsRef.current.has(targetSocketId)) {
      return peerConnectionsRef.current.get(targetSocketId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to PeerConnection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          targetSocketId,
          candidate: event.candidate
        });
      }
    };

    // Handle Remote Track Received
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(targetSocketId) || {};
        updated.set(targetSocketId, {
          ...existing,
          stream: remoteStream
        });
        return updated;
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeerConnection(targetSocketId);
      }
    };

    peerConnectionsRef.current.set(targetSocketId, pc);
    return pc;
  }, [socket]);

  const removePeerConnection = useCallback((targetSocketId) => {
    if (peerConnectionsRef.current.has(targetSocketId)) {
      const pc = peerConnectionsRef.current.get(targetSocketId);
      pc.close();
      peerConnectionsRef.current.delete(targetSocketId);
    }

    setRemoteStreams((prev) => {
      const updated = new Map(prev);
      updated.delete(targetSocketId);
      return updated;
    });
  }, []);

  // Handle Socket Signaling Events
  useEffect(() => {
    if (!socket) return;

    // Handle offer from another peer
    const handleOffer = async ({ callerSocketId, offer, callerInfo }) => {
      try {
        const pc = createPeerConnection(callerSocketId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          targetSocketId: callerSocketId,
          answer
        });

        if (callerInfo) {
          setRemoteStreams((prev) => {
            const updated = new Map(prev);
            const existing = updated.get(callerSocketId) || {};
            updated.set(callerSocketId, { ...existing, ...callerInfo });
            return updated;
          });
        }
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    };

    // Handle answer from another peer
    const handleAnswer = async ({ answerSocketId, answer }) => {
      try {
        const pc = peerConnectionsRef.current.get(answerSocketId);
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error('Error handling WebRTC answer:', err);
      }
    };

    // Handle ICE Candidate from another peer
    const handleIceCandidate = async ({ candidateSocketId, candidate }) => {
      try {
        const pc = peerConnectionsRef.current.get(candidateSocketId);
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE Candidate:', err);
      }
    };

    // Handle user join -> Initiate WebRTC offer to new peer
    const handleUserJoined = async (newUser) => {
      if (newUser.socketId === socket.id) return;
      try {
        const pc = createPeerConnection(newUser.socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
          targetSocketId: newUser.socketId,
          offer,
          callerInfo: newUser
        });
      } catch (err) {
        console.error('Error initiating WebRTC offer:', err);
      }
    };

    // Handle user left -> Close peer connection
    const handleUserLeft = ({ socketId }) => {
      removePeerConnection(socketId);
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, createPeerConnection, removePeerConnection]);

  // Toggle Audio (Microphone)
  const toggleAudio = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      const nextState = !audioTrack.enabled;
      audioTrack.enabled = nextState;
      setIsMicOn(nextState);
      if (socket && roomId) {
        socket.emit('mic-toggle', { roomId, enabled: nextState });
      }
    }
  };

  // Toggle Video (Camera)
  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      const nextState = !videoTrack.enabled;
      videoTrack.enabled = nextState;
      setIsCameraOn(nextState);
      if (socket && roomId) {
        socket.emit('camera-toggle', { roomId, enabled: nextState });
      }
    }
  };

  // Screen Sharing Integration (getDisplayMedia + Track Swapping)
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      // Replace video track across all peer connections
      peerConnectionsRef.current.forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(screenTrack);
        }
      });

      // Update local stream preview
      setLocalStream(displayStream);
      setIsScreenSharing(true);

      if (socket && roomId) {
        socket.emit('screen-share-toggle', { roomId, isSharing: true });
      }

      // Handle user stopping screen share via browser bar
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn('Screen sharing cancelled or denied:', err.message);
    }
  };

  const stopScreenShare = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    // Restore original camera track
    if (localStreamRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      if (cameraTrack) {
        peerConnectionsRef.current.forEach((pc) => {
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(cameraTrack);
          }
        });
      }
      setLocalStream(localStreamRef.current);
    }

    setIsScreenSharing(false);
    if (socket && roomId) {
      socket.emit('screen-share-toggle', { roomId, isSharing: false });
    }
  };

  return {
    localStream,
    remoteStreams,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    mediaError,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  };
};

export default useWebRTC;
