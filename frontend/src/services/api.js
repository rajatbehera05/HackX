const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal API helper for HackX
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hackx_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.error || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.code = data.code;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (payload) => request('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // AI Pipeline
  analyzeProblem: (id) => request(`/ai/projects/${id}/analyze`, { method: 'POST' }),
  generateIdeas: (id) => request(`/ai/projects/${id}/generate-ideas`, { method: 'POST' }),
  compareIdeas: (id) => request(`/ai/projects/${id}/compare`),
  selectIdea: (id, ideaId) => request(`/ai/projects/${id}/select-idea`, { method: 'POST', body: JSON.stringify({ ideaId }) }),
  generateDifferentiators: (id, ideaId) => request(`/ai/projects/${id}/differentiators`, { method: 'POST', body: JSON.stringify({ ideaId }) }),
  generateTechStack: (id, payload) => request(`/ai/projects/${id}/tech-stack`, { method: 'POST', ...(payload ? { body: JSON.stringify(payload) } : {}) }),
  generateArchitecture: (id, payload) => request(`/ai/projects/${id}/architecture`, { method: 'POST', ...(payload ? { body: JSON.stringify(payload) } : {}) }),
  generateRoadmap: (id, payload) => request(`/ai/projects/${id}/roadmap`, { method: 'POST', ...(payload ? { body: JSON.stringify(payload) } : {}) }),
  generatePitch: (id, payload) => request(`/ai/projects/${id}/pitch`, { method: 'POST', ...(payload ? { body: JSON.stringify(payload) } : {}) }),
  recommendTeamRoles: (id, payload) => request(`/ai/projects/${id}/team-roles`, { method: 'POST', ...(payload ? { body: JSON.stringify(payload) } : {}) }),
};
