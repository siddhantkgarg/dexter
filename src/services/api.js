import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dexter-api.omli.in/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = async (credentials) => {
  const response = await api.post('/admin/login', credentials)
  return response.data
}

// Dashboard Stats
export const getStats = async () => {
  const response = await api.get('/admin/stats')
  return response.data
}

// Parent Management
export const getParents = async (page = 1, limit = 10, search = '') => {
  const params = new URLSearchParams({ page, limit })
  if (search) params.append('search', search)
  const response = await api.get(`/admin/parents?${params}`)
  return response.data
}

export const getChildren = async (parentId) => {
  const response = await api.get(`/admin/parents/${parentId}/children`)
  return response.data
}

export const renewSubscription = async (parentId) => {
  const response = await api.post(`/admin/parents/${parentId}/renew`)
  return response.data
}

// Analytics
export const getAnalytics = async (childId = 'all', page = 1, limit = 10) => {
  const response = await api.get(`/admin/analytics?child=${childId}&page=${page}&limit=${limit}`)
  return response.data
}

// Content Management
export const getSubjects = async () => {
  const response = await api.get('/admin/subjects')
  return response.data
}

export const getChapters = async () => {
  const response = await api.get('/admin/chapters')
  return response.data
}

export const createLesson = async (lessonData) => {
  const response = await api.post('/lessons/create', lessonData)
  return response.data
}

// Prompts
export const getPrompts = async () => {
  const response = await api.get('/admin/prompts')
  return response.data
}

export const updatePrompt = async (key, content) => {
  const response = await api.put(`/admin/prompts/${encodeURIComponent(key)}`, { content })
  return response.data
}

// System Status
export const getSystemStatus = async () => {
  const response = await api.get('/admin/status')
  return response.data
}

// GitHub Releases
export const getReleases = async () => {
  const response = await api.get('/admin/releases')
  return response.data
}