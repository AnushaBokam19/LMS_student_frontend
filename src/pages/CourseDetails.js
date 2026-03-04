import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI, enrollAPI, progressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await coursesAPI.getById(courseId);
        if (cancelled) return;
        if (res.error) throw new Error(res.error);
        setCourse(res);
        if (user?.role === 'student' && user) {
          const prog = await progressAPI.get(courseId).catch(() => null);
          if (!cancelled && prog && !prog.error) setProgress(prog);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load course');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId, user?.role]);

  const handleEnroll = async () => {
    if (user?.role !== 'student') return;
    setEnrolling(true);
    try {
      const res = await enrollAPI.enroll(courseId);
      if (res.error) throw new Error(res.error);
      const prog = await progressAPI.get(courseId);
      setProgress(prog);
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const goToLearning = () => navigate(`/learn/${courseId}`);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error || !course) return <div style={{ padding: 40 }}>{error || 'Course not found'}</div>;

  const isEnrolled = progress !== null;
  const totalLessons = course.totalLessons || 0;
  const totalDuration = course.totalDuration || 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <img
          src={course.thumbnail || 'https://via.placeholder.com/800x400?text=Course'}
          alt={course.title}
          style={styles.thumb}
        />
        <div style={styles.headerText}>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.instructor}>Instructor: {course.instructorName}</p>
          <p style={styles.meta}>{totalLessons} lessons · {totalDuration} min total</p>
          {user?.role === 'student' && (
            <>
              {isEnrolled ? (
                <button type="button" onClick={goToLearning} style={styles.primaryBtn}>
                  Go to course
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  style={styles.primaryBtn}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div style={styles.body}>
        <h2>Description</h2>
        <p style={styles.desc}>{course.description || 'No description.'}</p>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 900, margin: '0 auto' },
  header: { display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' },
  thumb: { width: 320, height: 180, objectFit: 'cover', borderRadius: 12 },
  headerText: { flex: 1, minWidth: 200 },
  title: { margin: '0 0 8px', color: '#1a1a2e' },
  instructor: { margin: '0 0 4px', color: '#666' },
  meta: { margin: '0 0 16px', color: '#888' },
  primaryBtn: {
    padding: '12px 24px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 16,
  },
  body: { marginTop: 24 },
  desc: { color: '#555', lineHeight: 1.6 },
};
