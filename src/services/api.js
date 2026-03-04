const API_BASE = process.env.REACT_APP_API_URL || '';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Only send fields the backend expects (avoids sending unknown keys that could cause DB errors) */
const registerPayload = (data) => ({
  name: data.name,
  email: data.email,
  password: data.password,
  role: data.role,
  phone_no: data.phone_no != null ? String(data.phone_no).trim() : '',
});

export const authAPI = {
  register: (data) =>
    fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(registerPayload(data)),
    }).then((r) => r.json()),
  login: (data) =>
    fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
};

export const coursesAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/api/courses?${q}`, { headers: getAuthHeader() }).then((r) => r.json());
  },
  getById: (id) =>
    fetch(`${API_BASE}/api/courses/${id}`, { headers: getAuthHeader() }).then((r) => r.json()),
  getLessons: (courseId) =>
    fetch(`${API_BASE}/api/courses/${courseId}/lessons`, { headers: getAuthHeader() }).then((r) =>
      r.json()
    ),
};

export const enrollAPI = {
  myCourses: () =>
    fetch(`${API_BASE}/api/enroll`, { headers: getAuthHeader() }).then((r) => r.json()),
  enroll: (courseId) =>
    fetch(`${API_BASE}/api/enroll/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    }).then((r) => r.json()),
};

export const progressAPI = {
  get: (courseId) =>
    fetch(`${API_BASE}/api/progress/${courseId}`, { headers: getAuthHeader() }).then((r) => r.json()),
  complete: (lessonId) =>
    fetch(`${API_BASE}/api/progress/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ lessonId }),
    }).then((r) => r.json()),
  setLastWatched: (lessonId) =>
    fetch(`${API_BASE}/api/progress/watch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ lessonId }),
    }).then((r) => r.json()),
};
