import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '0.9rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-15zm8.25 4.875l4.5 3a.75.75 0 010 1.25l-4.5 3A.75.75 0 0111.25 16v-6a.75.75 0 011.5-.125z"/>
          </svg>
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.4rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          WATCH PARTY
        </span>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link
          to="/"
          style={{
            color: isActive('/') ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: isActive('/') ? 600 : 500,
            fontSize: '0.95rem'
          }}
        >
          Home
        </Link>

        {isAuthenticated && (
          <>
            <Link
              to="/dashboard"
              style={{
                color: isActive('/dashboard') ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive('/dashboard') ? 600 : 500,
                fontSize: '0.95rem'
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/create-party"
              style={{
                color: isActive('/create-party') ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive('/create-party') ? 600 : 500,
                fontSize: '0.95rem'
              }}
            >
              Create Party
            </Link>
            <Link
              to="/join-party"
              style={{
                color: isActive('/join-party') ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive('/join-party') ? 600 : 500,
                fontSize: '0.95rem'
              }}
            >
              Join Party
            </Link>
          </>
        )}
      </div>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
              👋 {user?.name}
            </span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
