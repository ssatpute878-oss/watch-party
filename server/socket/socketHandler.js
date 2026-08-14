// In-memory room participant store: { [roomId]: Map<socketId, participantObj> }
const roomParticipants = new Map();

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room
    socket.on('join-room', ({ roomId, userId, name, isHost }) => {
      socket.join(roomId);
      socket.currentRoom = roomId;

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }

      const roomMap = roomParticipants.get(roomId);
      const participantInfo = {
        socketId: socket.id,
        userId: userId || socket.id,
        name: name || 'Guest User',
        isHost: !!isHost,
        audioEnabled: true,
        videoEnabled: true,
        screenSharing: false
      };

      roomMap.set(socket.id, participantInfo);

      const participantsList = Array.from(roomMap.values());

      // Send updated user list to all in room
      io.to(roomId).emit('room-users', participantsList);

      // Broadcast user-joined to other participants
      socket.to(roomId).emit('user-joined', participantInfo);

      console.log(`User ${name} (${socket.id}) joined room ${roomId}`);
    });

    // Toggle Microphone
    socket.on('mic-toggle', ({ roomId, enabled }) => {
      const roomMap = roomParticipants.get(roomId);
      if (roomMap && roomMap.has(socket.id)) {
        const user = roomMap.get(socket.id);
        user.audioEnabled = enabled;
        io.to(roomId).emit('participant-audio-toggle', { socketId: socket.id, enabled });
        io.to(roomId).emit('room-users', Array.from(roomMap.values()));
      }
    });

    // Toggle Camera
    socket.on('camera-toggle', ({ roomId, enabled }) => {
      const roomMap = roomParticipants.get(roomId);
      if (roomMap && roomMap.has(socket.id)) {
        const user = roomMap.get(socket.id);
        user.videoEnabled = enabled;
        io.to(roomId).emit('participant-video-toggle', { socketId: socket.id, enabled });
        io.to(roomId).emit('room-users', Array.from(roomMap.values()));
      }
    });

    // Toggle Screen Share
    socket.on('screen-share-toggle', ({ roomId, isSharing }) => {
      const roomMap = roomParticipants.get(roomId);
      if (roomMap && roomMap.has(socket.id)) {
        const user = roomMap.get(socket.id);
        user.screenSharing = isSharing;
        io.to(roomId).emit('participant-screen-toggle', { socketId: socket.id, isSharing });
        io.to(roomId).emit('room-users', Array.from(roomMap.values()));
      }
    });

    // Video Playback Controls (Play, Pause, Seek, Sync)
    socket.on('video-play', ({ roomId, currentTime }) => {
      io.to(roomId).emit('video-play', { currentTime, senderId: socket.id });
    });

    socket.on('video-pause', ({ roomId, currentTime }) => {
      io.to(roomId).emit('video-pause', { currentTime, senderId: socket.id });
    });

    socket.on('video-seek', ({ roomId, currentTime }) => {
      io.to(roomId).emit('video-seek', { currentTime, senderId: socket.id });
    });

    socket.on('request-initial-sync', ({ roomId }) => {
      // Ask host or any existing member for current state
      socket.to(roomId).emit('request-initial-sync-from-host', { requesterId: socket.id });
    });

    socket.on('provide-initial-sync', ({ targetSocketId, currentTime, isPlaying, videoUrl }) => {
      io.to(targetSocketId).emit('video-sync', { currentTime, isPlaying, videoUrl });
    });

    // Real-time Chat Messages
    socket.on('chat-message', ({ roomId, username, message, timestamp }) => {
      const chatData = {
        id: `${socket.id}-${Date.now()}`,
        socketId: socket.id,
        username: username || 'Anonymous',
        message: message || '',
        timestamp: timestamp || new Date().toISOString()
      };
      io.to(roomId).emit('chat-message', chatData);
    });

    // WebRTC Signaling Events (Mesh)
    socket.on('webrtc-offer', ({ targetSocketId, offer, callerInfo }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        callerSocketId: socket.id,
        offer,
        callerInfo
      });
    });

    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        answerSocketId: socket.id,
        answer
      });
    });

    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        candidateSocketId: socket.id,
        candidate
      });
    });

    // Host End Party
    socket.on('end-party', ({ roomId }) => {
      io.to(roomId).emit('party-ended', { message: 'The host has ended this watch party.' });
      roomParticipants.delete(roomId);
    });

    // Leave room explicitly
    socket.on('leave-room', ({ roomId }) => {
      cleanUpUserFromRoom(socket, roomId, io);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.currentRoom) {
        cleanUpUserFromRoom(socket, socket.currentRoom, io);
      }
    });
  });
};

function cleanUpUserFromRoom(socket, roomId, io) {
  socket.leave(roomId);
  const roomMap = roomParticipants.get(roomId);

  if (roomMap) {
    const user = roomMap.get(socket.id);
    roomMap.delete(socket.id);

    if (roomMap.size === 0) {
      roomParticipants.delete(roomId);
    } else {
      io.to(roomId).emit('room-users', Array.from(roomMap.values()));
      if (user) {
        io.to(roomId).emit('user-left', { socketId: socket.id, name: user.name });
      }
    }
  }
}

module.exports = handleSocketConnection;
