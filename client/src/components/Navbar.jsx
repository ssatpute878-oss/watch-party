import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      padding: '0.75rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h15a3 3 0 003-3v-9a3 3 0 00-3-3h-15zm8.25 4.875l4.5 3a.75.75 0 010 1.25l-4.5 3A.75.75 0 0111.25 16v-6a.75.75 0 011.5-.125z"/>
          </svg>
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          WATCH PARTY
        </span>
      </Link>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-nav-toggle btn btn-secondary"
        style={{ padding: '0.35rem 0.6rem', fontSize: '1.1rem' }}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Desktop & Mobile Navigation Links Container */}
      <div className={`nav-links-container ${mobileMenuOpen ? 'open' : ''}`}>
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            color: isActive('/') ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: isActive('/') ? 600 : 500,
            fontSize: '0.9rem'
          }}
        >
          Home
        </Link>

        {isAuthenticated && (
          <>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isActive('/dashboard') ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive('/dashboard') ? 600 : 500,
                fontSize: '0.9rem'
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/create-party"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isActive('/create-party') ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive('/create-party') ? 600 : 500,
                fontSize: '0.9rem'
              }}
            >
              Create Party
            </Link>
            <Link
              to="/join-party"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isActive('/join-party') ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive('/join-party') ? 600 : 500,
                fontSize: '0.9rem'
              }}
            >
              Join Party
            </Link>
          </>
        )}

        {/* User Actions inside Mobile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: mobileMenuOpen ? '0.5rem' : '0' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                👋 {user?.name}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
