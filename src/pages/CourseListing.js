import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coursesAPI, enrollAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function CourseListing() {
  const [data, setData] = useState({ courses: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await coursesAPI.list({ page, limit: 9, search, category });
      if (res.error) throw new Error(res.error);
      setData({ courses: res.courses || [], pagination: res.pagination || {} });
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search, category]);

  useEffect(() => {
    if (user?.role !== 'student') return;
    enrollAPI.myCourses().then((res) => {
      if (res.courses) setEnrolledIds(new Set(res.courses.map((c) => c.id)));
    }).catch(() => {});
  }, [user?.role]);

  const handleEnroll = async (courseId) => {
    if (user?.role !== 'student') return;
    setEnrollingId(courseId);
    try {
      const res = await enrollAPI.enroll(courseId);
      if (res.error) throw new Error(res.error);
      fetchCourses();
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  const total = data.pagination.total || 0;
  const limit = data.pagination.limit || 9;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Courses</h1>
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={styles.searchInput}
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={styles.select}
        >
          <option value="">All categories</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Fullstack">Fullstack</option>
          <option value="Database">Database</option>
          <option value="DevOps">DevOps</option>
          <option value="Cloud">Cloud</option>
          <option value="AI/ML">AI/ML</option>
        </select>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {loading ? (
        <p style={styles.loading}>Loading courses...</p>
      ) : (
        <>
          <div style={styles.grid}>
            {data.courses.map((c) => (
              <div key={c.id} style={styles.card}>
                <Link to={`/courses/${c.id}`} style={styles.cardLink}>
                  <img
                    src={c.thumbnail || 'https://via.placeholder.com/320x180?text=Course'}
                    alt={c.title}
                    style={styles.thumbnail}
                  />
                  <h3 style={styles.cardTitle}>{c.title}</h3>
                  <p style={styles.instructor}>{c.instructorName || 'Instructor'}</p>
                  <p style={styles.desc}>{c.description?.slice(0, 80)}...</p>
                </Link>
                {user?.role === 'student' && (
                  <button
                    type="button"
                    onClick={() => (enrolledIds.has(c.id) ? navigate(`/learn/${c.id}`) : handleEnroll(c.id))}
                    disabled={enrollingId === c.id}
                    style={styles.enrollBtn}
                  >
                    {enrollingId === c.id ? 'Enrolling...' : enrolledIds.has(c.id) ? 'Go to course' : 'Enroll'}
                  </button>
                )}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={styles.pageBtn}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 24,
    maxWidth: 1200,
    margin: '0 auto',
    minHeight: 'calc(100vh - 52px)',
    background: '#fce8fa',
  },
  title: { marginBottom: 24, color: '#1a1a2e' },
  filters: { display: 'flex', gap: 12, marginBottom: 24 },
  searchInput: { padding: 10, width: 260, border: '1px solid #ddd', borderRadius: 8 },
  select: { padding: 10, border: '1px solid #ddd', borderRadius: 8 },
  error: { color: '#e94560', marginBottom: 16 },
  loading: { padding: 40, textAlign: 'center' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 24,
  },
  card: {
    border: '1px solid #eee',
    borderRadius: 12,
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardLink: { textDecoration: 'none', color: 'inherit', display: 'block' },
  thumbnail: { width: '100%', height: 180, objectFit: 'cover' },
  cardTitle: { padding: '12px 16px 0', margin: 0, fontSize: 18 },
  instructor: { padding: '4px 16px', margin: 0, color: '#666', fontSize: 14 },
  desc: { padding: '8px 16px 12px', margin: 0, color: '#555', fontSize: 14 },
  enrollBtn: {
    margin: '0 16px 16px',
    padding: '10px 20px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    width: 'calc(100% - 32px)',
  },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 32 },
  pageBtn: { padding: '8px 16px', cursor: 'pointer' },
  pageInfo: { color: '#666' },
};
