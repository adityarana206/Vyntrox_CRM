// API utility with auto-logout on 401
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('vyntrox_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Handle 401 - auto logout
const handleUnauthorized = () => {
  // Don't redirect if already on login page
  if (window.location.pathname === '/login') return;
  
  localStorage.removeItem('vyntrox_token');
  localStorage.removeItem('vyntrox_user');
  window.location.href = '/login';
};

// Fetch with auth and auto-logout
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('vyntrox_token');
  
  // Stringify body if it's an object
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
  
  const res = await fetch(url, { ...options, headers, body });
  
  if (res.status === 401) {
    handleUnauthorized();
    return;
  }
  
  return res;
};

// GET request
export const get = (endpoint) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`);
};

// POST request
export const post = (endpoint, body) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

// PUT request
export const put = (endpoint, body) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
};

// DELETE request
export const del = (endpoint) => {
  return fetchWithAuth(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
  });
};

// ==================== DASHBOARD APIs ====================
export const getDashboardStats = (role, userId) => {
  return fetchWithAuth(`${API_BASE}/dashboard/stats?role=${role}&userId=${userId}`);
};

export const getDashboardTickets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/dashboard/tickets?${query}`);
};

export const getDashboardProjects = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/dashboard/projects?${query}`);
};

export const getDashboardTasks = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/dashboard/tasks?${query}`);
};

export const getTeamWorkload = () => {
  return fetchWithAuth(`${API_BASE}/dashboard/team-workload`);
};

// ==================== TICKET APIs ====================
export const getTickets = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/tickets?${query}`);
};

export const getTicketById = (id) => {
  return fetchWithAuth(`${API_BASE}/tickets/${id}`);
};

export const createTicketAdmin = (data) => {
  return fetchWithAuth(`${API_BASE}/tickets`, {
    method: 'POST',
    body: data,
  });
};

export const updateTicketStatus = (id, status) => {
  return fetchWithAuth(`${API_BASE}/tickets/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
};

export const getTicketActivity = (id) => {
  return fetchWithAuth(`${API_BASE}/tickets/${id}/activity`);
};

export const addTicketComment = (id, comment) => {
  return fetchWithAuth(`${API_BASE}/tickets/${id}/comments`, {
    method: 'POST',
    body: { comment },
  });
};

// ==================== TASK APIs ====================
export const getTasks = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/tasks?${query}`);
};

export const getTaskStats = () => {
  return fetchWithAuth(`${API_BASE}/tasks/stats/overview`);
};

export const getTaskById = (id) => {
  return fetchWithAuth(`${API_BASE}/tasks/${id}`);
};

export const createTask = (data) => {
  return fetchWithAuth(`${API_BASE}/tasks`, {
    method: 'POST',
    body: data,
  });
};

export const updateTask = (id, data) => {
  return fetchWithAuth(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    body: data,
  });
};

export const updateTaskStatus = (id, status) => {
  return fetchWithAuth(`${API_BASE}/tasks/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
};

export const deleteTask = (id) => {
  return fetchWithAuth(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
};

// ==================== RESOURCE APIs ====================
export const getResources = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/resources?${query}`);
};

export const getResourceById = (id) => {
  return fetchWithAuth(`${API_BASE}/resources/${id}`);
};

export const getResourceAvailability = (id) => {
  return fetchWithAuth(`${API_BASE}/resources/${id}/availability`);
};

export const getAllocationStats = () => {
  return fetchWithAuth(`${API_BASE}/resources/stats/allocation`);
};

export const updateResource = (id, data) => {
  return fetchWithAuth(`${API_BASE}/resources/${id}`, {
    method: 'PUT',
    body: data,
  });
};

// ==================== SETTINGS APIs ====================
export const getSettings = () => {
  return fetchWithAuth(`${API_BASE}/settings`);
};

export const updateProfile = (data) => {
  return fetchWithAuth(`${API_BASE}/settings/profile`, {
    method: 'PUT',
    body: data,
  });
};

export const updatePreferences = (data) => {
  return fetchWithAuth(`${API_BASE}/settings/preferences`, {
    method: 'PUT',
    body: data,
  });
};

export const changePassword = (currentPassword, newPassword) => {
  return fetchWithAuth(`${API_BASE}/settings/password`, {
    method: 'PUT',
    body: { currentPassword, newPassword },
  });
};

export const getNotificationSettings = () => {
  return fetchWithAuth(`${API_BASE}/settings/notifications`);
};

export const updateNotificationSettings = (data) => {
  return fetchWithAuth(`${API_BASE}/settings/notifications`, {
    method: 'PUT',
    body: data,
  });
};

export const getSystemSettings = () => {
  return fetchWithAuth(`${API_BASE}/settings/system`);
};
