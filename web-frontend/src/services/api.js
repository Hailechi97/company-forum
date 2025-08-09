import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method.toUpperCase(), config.url); // Debug log
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token added to request"); // Debug log
    } else {
      console.log("No token found in localStorage"); // Debug log
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error); // Debug log
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Auth
  auth: {
    login: (credentials) => apiClient.post("/auth/login", credentials),
    logout: () => apiClient.post("/auth/logout"),
    me: () => apiClient.get("/auth/me"),
    resetAllPasswords: () => apiClient.post("/auth/reset-all-passwords"),
    resetEmployeePassword: (empId) =>
      apiClient.post(`/auth/reset-employee-password/${empId}`),
  },

  // Posts
  posts: {
    getAll: (params) => apiClient.get("/posts", { params }),
    getById: (id) => apiClient.get(`/posts/${id}`),
    create: (postData) => apiClient.post("/posts", postData),
    update: (id, postData) => apiClient.put(`/posts/${id}`, postData),
    delete: (id) => apiClient.delete(`/posts/${id}`),
    like: (id, data) => apiClient.post(`/posts/${id}/like`, data),
    addComment: (id, commentData) =>
      apiClient.post(`/posts/${id}/comments`, commentData),
    getFeatured: (limit) =>
      apiClient.get("/posts/featured", { params: { limit } }),
    getPopular: (timeframe, limit) =>
      apiClient.get("/posts/popular", {
        params: { timeframe, limit },
      }),
  },

  // Comments
  comments: {
    getByPost: (postId, params) =>
      apiClient.get(`/posts/${postId}/comments`, { params }),
    create: (postId, commentData) =>
      apiClient.post(`/posts/${postId}/comments`, commentData),
    update: (id, commentData) => apiClient.put(`/comments/${id}`, commentData),
    delete: (id) => apiClient.delete(`/comments/${id}`),
    like: (id) => apiClient.post(`/comments/${id}/like`),
    unlike: (id) => apiClient.delete(`/comments/${id}/like`),
  },

  // Users
  users: {
    getProfile: () => apiClient.get("/users/profile"),
    getByDepartment: (department) =>
      apiClient.get(`/users/department/${department}`),
    getById: (id) => apiClient.get(`/users/${id}`),
    updateProfile: (id, userData) => apiClient.put(`/users/${id}`, userData),
    create: (userData) => apiClient.post("/users", userData),
    getAll: (params) => apiClient.get("/users", { params }),
    delete: (id) => apiClient.delete(`/users/${id}`),
    changePassword: (passwordData) =>
      apiClient.put("/users/change-password", passwordData),
    uploadAvatar: (formData) =>
      apiClient.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },

  // Meetings
  meetings: {
    getAll: (params) => apiClient.get("/meetings", { params }),
    getById: (id) => apiClient.get(`/meetings/${id}`),
    create: (meetingData) => apiClient.post("/meetings", meetingData),
    update: (id, meetingData) => apiClient.put(`/meetings/${id}`, meetingData),
    delete: (id) => apiClient.delete(`/meetings/${id}`),
    updateNotes: (id, notes) =>
      apiClient.put(`/meetings/${id}/notes`, { notes }),
    getCalendar: (year, month) =>
      apiClient.get(`/meetings/calendar/${year}/${month}`),
  },

  // Requests
  requests: {
    getAll: (params) => apiClient.get("/requests", { params }),
    getById: (id) => apiClient.get(`/requests/${id}`),
    create: (requestData) => apiClient.post("/requests", requestData),
    update: (id, requestData) => apiClient.put(`/requests/${id}`, requestData),
    delete: (id) => apiClient.delete(`/requests/${id}`),
    approve: (id) => apiClient.put(`/requests/${id}/approve`),
    reject: (id, rejectionReason) =>
      apiClient.put(`/requests/${id}/reject`, { rejectionReason }),
    getStatistics: (params) =>
      apiClient.get("/requests/statistics", { params }),
  },

  // Categories
  categories: {
    getAll: () => apiClient.get("/categories"),
    getById: (id) => apiClient.get(`/categories/${id}`),
    create: (categoryData) => apiClient.post("/categories", categoryData),
    update: (id, categoryData) =>
      apiClient.put(`/categories/${id}`, categoryData),
    delete: (id) => apiClient.delete(`/categories/${id}`),
  },

  // Notifications
  notifications: {
    getAll: (params) => apiClient.get("/notifications", { params }),
    getUnreadCount: () => apiClient.get("/notifications/unread-count"),
    markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.put("/notifications/mark-all-read"),
    delete: (id) => apiClient.delete(`/notifications/${id}`),
  },

  // File uploads
  upload: {
    file: (formData) =>
      apiClient.post("/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    image: (formData) =>
      apiClient.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },
};

// Specific API exports for cleaner imports
export const meetingApi = {
  getMeetings: (params = {}) =>
    api.meetings.getAll(params).then((res) => res.data.data || res.data),
  getMeetingById: (id) =>
    api.meetings.getById(id).then((res) => res.data.data || res.data),
  createMeeting: (meetingData) =>
    api.meetings.create(meetingData).then((res) => res.data.data || res.data),
  updateMeeting: (id, meetingData) =>
    api.meetings
      .update(id, meetingData)
      .then((res) => res.data.data || res.data),
  deleteMeeting: (id) =>
    api.meetings.delete(id).then((res) => res.data.data || res.data),
  updateParticipantNotes: (id, notes) =>
    api.meetings
      .updateNotes(id, notes)
      .then((res) => res.data.data || res.data),
  getCalendar: (year, month) =>
    api.meetings
      .getCalendar(year, month)
      .then((res) => res.data.data || res.data),
};

export default apiClient;
