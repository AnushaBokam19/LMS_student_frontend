import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Learning Management System</h1>
      <p style={styles.subtitle}>Learn from YouTube-based courses. Enroll, watch, track progress.</p>
      {isAuthenticated ? (
        <div style={styles.actions}>
          <Link to="/courses" style={styles.button}>Browse Courses</Link>
          {user?.role === 'student' && (
            <Link to="/my-courses" style={styles.buttonSecondary}>My Courses</Link>
          )}
        </div>
      ) : (
        <div style={styles.actions}>
          <Link to="/login" style={styles.button}>Login</Link>
          <Link to="/signup" style={styles.buttonSecondary}>Sign Up</Link>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 52px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: '#fce8fa',
    color: '#333',
  },
  title: { marginBottom: 12, fontSize: 32 },
  subtitle: { marginBottom: 32, opacity: 0.9 },
  actions: { display: 'flex', gap: 16 },
  button: {
    padding: '14px 28px',
    background: '#e94560',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 8,
    fontWeight: 600,
  },
  buttonSecondary: {
    padding: '14px 28px',
    background: 'transparent',
    color: '#1a1a2e',
    textDecoration: 'none',
    borderRadius: 8,
    border: '2px solid #1a1a2e',
  },
};
