import React, { useState, useEffect, useRef } from 'react';

function Chat({ roomId, socket, user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming chat messages
    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, { ...msg, type: 'user' }]);
    };

    // Listen for user join system alert
    const handleUserJoined = ({ name }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}-${Math.random()}`,
          type: 'system',
          message: `👋 ${name} joined the party`
        }
      ]);
    };

    // Listen for user left system alert
    const handleUserLeft = ({ name }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}-${Math.random()}`,
          type: 'system',
          message: `🚪 ${name} left the party`
        }
      ]);
    };

    socket.on('chat-message', handleChatMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('chat-message', handleChatMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !user) return;

    socket.emit('chat-message', {
      roomId,
      username: user.name,
      message: inputMessage.trim(),
      timestamp: new Date().toISOString()
    });

    setInputMessage('');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages Feed */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '2rem' }}>
            💬 Chat history is empty. Say hello to everyone!
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem 0.5rem', borderRadius: '12px', margin: '0.25rem 0' }}>
                  {msg.message}
                </div>
              );
            }

            const isSelf = msg.username === user?.name;

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isSelf ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelf ? 'var(--primary)' : 'var(--accent)' }}>
                    {msg.username}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: isSelf ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isSelf ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  maxWidth: '85%',
                  wordBreak: 'break-word',
                  lineHeight: 1.4
                }}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--bg-glass-border)' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 0.9rem', fontSize: '0.875rem' }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
