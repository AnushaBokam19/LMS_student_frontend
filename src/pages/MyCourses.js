import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollAPI } from '../services/api';

export function MyCourses() {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await enrollAPI.myCourses();
        if (res.error) throw new Error(res.error);
        setEnrolled(res.courses || []);
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', minHeight: 'calc(100vh - 52px)', background: '#fce8fa' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, minHeight: 'calc(100vh - 52px)', background: '#fce8fa' }}>{error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', minHeight: 'calc(100vh - 52px)', background: '#fce8fa' }}>
      <h1 style={{ marginBottom: 24, color: '#1a1a2e' }}>My Courses</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Go to Courses to enroll. Enrolled courses will appear here and you can open them to learn.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {enrolled.length === 0 ? (
          <p style={{ color: '#888' }}>No courses yet. <Link to="/courses">Browse courses</Link> to enroll.</p>
        ) : (
          enrolled.map((c) => (
            <Link
              key={c.id}
              to={`/learn/${c.id}`}
              style={{
                display: 'block',
                padding: 16,
                background: '#fff',
                border: '1px solid #eee',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <strong>{c.title}</strong> — {c.instructorName}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
