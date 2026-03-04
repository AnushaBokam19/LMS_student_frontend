import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { coursesAPI, progressAPI } from '../services/api';

function getVideoId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  return m ? m[1] : null;
}

function flattenLessons(sections) {
  const list = [];
  (sections || []).forEach((sec) => {
    (sec.lessons || []).forEach((l) => list.push({ ...l, sectionTitle: sec.title }));
  });
  return list;
}

export function Learning() {
  const { courseId } = useParams();
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const lessons = flattenLessons(sections);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        coursesAPI.getLessons(courseId),
        progressAPI.get(courseId).catch(() => null),
      ]);
      if (Array.isArray(lessonsRes)) {
        setSections(lessonsRes);
      } else if (lessonsRes?.error) {
        throw new Error(lessonsRes.error);
      } else {
        setSections([]);
      }
      if (progressRes && !progressRes.error) {
        setProgress(progressRes);
      } else {
        setProgress(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set initial selected lesson: last watched or first
  useEffect(() => {
    if (lessons.length === 0) return;
    if (selectedLesson) return;
    const lastId = progress?.lastWatchedLessonId;
    const found = lastId ? lessons.find((l) => l.id === lastId) : null;
    setSelectedLesson(found || lessons[0]);
  }, [lessons, progress?.lastWatchedLessonId, selectedLesson]);

  // Notify backend when user opens a lesson (resume)
  useEffect(() => {
    if (!selectedLesson || !progress) return;
    progressAPI.setLastWatched(selectedLesson.id).catch(() => {});
  }, [selectedLesson?.id]);

  const markComplete = async () => {
    if (!selectedLesson) return;
    try {
      const res = await progressAPI.complete(selectedLesson.id);
      if (res && !res.error) setProgress(res);
    } catch (_) {}
  };

  const currentIndex = lessons.findIndex((l) => l.id === selectedLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const videoId = selectedLesson ? (selectedLesson.videoId || getVideoId(selectedLesson.youtubeUrl)) : null;
  const isCompleted = progress?.completedLessons?.includes(selectedLesson?.id);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40 }}>{error}</div>;

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.progressBarWrap}>
          <div style={styles.progressLabel}>Progress: {progress?.percentage ?? 0}%</div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress?.percentage ?? 0}%` }} />
          </div>
        </div>
        <ul style={styles.lessonList}>
          {sections.map((sec) => (
            <li key={sec.id} style={styles.sectionItem}>
              <span style={styles.sectionTitle}>{sec.title}</span>
              <ul style={styles.lessonSubList}>
                {(sec.lessons || []).map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(l)}
                      style={{
                        ...styles.lessonBtn,
                        ...(selectedLesson?.id === l.id ? styles.lessonBtnActive : {}),
                      }}
                    >
                      {progress?.completedLessons?.includes(l.id) && '✓ '}
                      {l.title}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </aside>
      <main style={styles.main}>
        {selectedLesson && (
          <>
            <h2 style={styles.lessonTitle}>{selectedLesson.title}</h2>
            <div style={styles.videoWrap}>
              {videoId ? (
                <iframe
                  title={selectedLesson.title}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={styles.iframe}
                />
              ) : (
                <div style={styles.placeholder}>Invalid or missing video URL</div>
              )}
            </div>
            <div style={styles.actions}>
              <button
                type="button"
                onClick={markComplete}
                disabled={isCompleted}
                style={styles.completeBtn}
              >
                {isCompleted ? 'Completed' : 'Mark as complete'}
              </button>
              <div style={styles.navBtns}>
                {prevLesson && (
                  <button
                    type="button"
                    onClick={() => setSelectedLesson(prevLesson)}
                    style={styles.navBtn}
                  >
                    ← Previous
                  </button>
                )}
                {nextLesson && (
                  <button
                    type="button"
                    onClick={() => setSelectedLesson(nextLesson)}
                    style={styles.navBtn}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: 'calc(100vh - 52px)', background: '#f5f5f5' },
  sidebar: {
    width: 320,
    background: '#fff',
    borderRight: '1px solid #eee',
    overflowY: 'auto',
    padding: 16,
  },
  progressBarWrap: { marginBottom: 20 },
  progressLabel: { fontSize: 14, marginBottom: 6, color: '#333' },
  progressTrack: { height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#1a1a2e', borderRadius: 4, transition: 'width 0.3s' },
  lessonList: { listStyle: 'none', padding: 0, margin: 0 },
  sectionItem: { marginBottom: 16 },
  sectionTitle: { fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 8 },
  lessonSubList: { listStyle: 'none', padding: 0, margin: 0 },
  lessonBtn: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 6,
    fontSize: 14,
  },
  lessonBtnActive: { background: '#1a1a2e', color: '#fff' },
  main: { flex: 1, padding: 24, overflowY: 'auto' },
  lessonTitle: { margin: '0 0 16px', color: '#1a1a2e' },
  videoWrap: { position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: 24 },
  iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 8 },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  actions: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 },
  completeBtn: {
    padding: '10px 20px',
    background: '#0f9d58',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  navBtns: { display: 'flex', gap: 12, marginLeft: 'auto' },
  navBtn: {
    padding: '10px 16px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
};
