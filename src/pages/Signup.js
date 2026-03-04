import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, validateRegisterPayload } from '../constants/auth';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone_no, setPhone_no] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validation = validateRegisterPayload({ name, email, password, role, phone_no });
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    setLoading(true);
    try {
      await register(
        validation.data.name,
        validation.data.email,
        validation.data.password,
        validation.data.role,
        validation.data.phone_no
      );
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sign Up</h1>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phone_no}
            onChange={(e) => setPhone_no(e.target.value)}
            style={styles.input}
            autoComplete="tel"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={styles.input}
          />
          <div>
            <label style={styles.label}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  },
  card: {
    background: '#fff',
    padding: 40,
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: 400,
  },
  title: { marginBottom: 24, color: '#1a1a2e' },
  error: { color: '#e94560', marginBottom: 12, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  input: {
    padding: 12,
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 16,
    width: '100%',
    boxSizing: 'border-box',
  },
  label: { display: 'block', marginBottom: 6, color: '#333' },
  select: {
    padding: 12,
    border: '1px solid #ddd',
    borderRadius: 8,
    fontSize: 16,
    width: '100%',
  },
  button: {
    padding: 14,
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer',
  },
  footer: { marginTop: 20, textAlign: 'center', color: '#666' },
};
