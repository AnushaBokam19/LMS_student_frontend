import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="app-nav"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#1a1a2e',
        color: '#eee',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <Link to="/" style={{ color: '#eee', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
        LMS
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {isAuthenticated ? (
          <>
            <Link to="/courses" style={{ color: '#eee', textDecoration: 'none' }}>
              Courses
            </Link>
            {user?.role === 'student' && (
              <Link to="/my-courses" style={{ color: '#eee', textDecoration: 'none' }}>
                My Courses
              </Link>
            )}
            <span style={{ opacity: 0.9 }}>{user?.name}</span>
            <span style={{ fontSize: 12, opacity: 0.7 }}>({user?.role})</span>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                background: '#e94560',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#eee', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/signup" style={{ color: '#eee', textDecoration: 'none' }}>
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
