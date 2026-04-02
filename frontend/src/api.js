import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('strelo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401 (skip for auth endpoints — login/register handle their own errors)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    if (err.response?.status === 401 && !url.startsWith('/auth/')) {
      localStorage.removeItem('strelo_token')
      localStorage.removeItem('strelo_user')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

// --- Auth ---
export const register = (data) =>
  api.post('/auth/register', data).then(r => r.data)

export const login = (data) =>
  api.post('/auth/login', data).then(r => r.data)

export const getMe = () =>
  api.get('/auth/me').then(r => r.data)

export const googleAuth = (credential) =>
  api.post('/auth/google', { credential }).then(r => r.data)

export const markOnboarded = () =>
  api.post('/auth/onboarded').then(r => r.data)

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email }).then(r => r.data)

export const resetPassword = (token, password) =>
  api.post('/auth/reset-password', { token, password }).then(r => r.data)

export const updateName = (name) =>
  api.put('/auth/update-name', { name }).then(r => r.data)

export const changePassword = (current_password, new_password) =>
  api.put('/auth/change-password', { current_password, new_password }).then(r => r.data)

export const deleteAccount = (password) =>
  api.delete('/auth/delete-account', { data: { password } }).then(r => r.data)

// --- Workouts ---
export const getWorkouts = (start, end) =>
  api.get('/workouts', { params: { start, end } }).then(r => r.data)

export const createWorkout = (data) =>
  api.post('/workouts', data).then(r => r.data)

export const updateWorkout = (id, data) =>
  api.put(`/workouts/${id}`, data).then(r => r.data)

export const deleteWorkout = (id) =>
  api.delete(`/workouts/${id}`)

export const bulkDeleteWorkouts = (start, end) =>
  api.delete('/workouts', { params: { start, end } }).then(r => r.data)

// --- Races ---
export const getRaces = () =>
  api.get('/races').then(r => r.data)

export const createRace = (data) =>
  api.post('/races', data).then(r => r.data)

export const updateRace = (id, data) =>
  api.put(`/races/${id}`, data).then(r => r.data)

export const deleteRace = (id) =>
  api.delete(`/races/${id}`)

// --- Athlete ---
export const getAthlete = () =>
  api.get('/athlete').then(r => r.data)

export const updateAthlete = (data) =>
  api.put('/athlete', data).then(r => r.data)

// --- AI ---
export const suggestWeek = () =>
  api.post('/ai/suggest-week').then(r => r.data)

// --- Billing ---
export const createCheckout = (plan = 'monthly') =>
  api.post('/billing/checkout', null, { params: { plan } }).then(r => r.data)

export const getBillingStatus = () =>
  api.get('/billing/status').then(r => r.data)

// --- Strava ---
export const getStravaConnectUrl = () =>
  api.get('/strava/connect').then(r => r.data)

export const getStravaStatus = () =>
  api.get('/strava/status').then(r => r.data)

export const disconnectStrava = () =>
  api.post('/strava/disconnect').then(r => r.data)

export const syncStrava = () =>
  api.post('/strava/sync').then(r => r.data)

// --- Export ---
export const getDownloadToken = () =>
  api.post('/export/download-token').then(r => r.data.token)

export const exportFit = async (workoutId) => {
  const token = await getDownloadToken()
  window.location.href = `${api.defaults.baseURL}/export/fit/${workoutId}?token=${token}`
}

// --- Plans ---
export const getPlans = () =>
  api.get('/plans').then(r => r.data)

export const importPlan = (planId, startDate) =>
  api.post(`/plans/${planId}/import`, null, { params: { start_date: startDate } }).then(r => r.data)

export const undoPlanImport = (importId) =>
  api.delete(`/plans/undo/${importId}`).then(r => r.data)

// --- Templates ---
export const getTemplates = () =>
  api.get('/templates').then(r => r.data)

export const createTemplate = (data) =>
  api.post('/templates', data).then(r => r.data)

export const deleteTemplate = (id) =>
  api.delete(`/templates/${id}`)

// --- Digest ---
export const sendDigest = () =>
  api.post('/digest/send').then(r => r.data)

// --- Body Log ---
export const getBodyLogs = () => api.get('/bodylog').then(r => r.data)
export const createBodyLog = (data) => api.post('/bodylog', data).then(r => r.data)
export const deleteBodyLog = (id) => api.delete(`/bodylog/${id}`)

// --- Support Chat ---
export const sendSupportChat = (messages) =>
  api.post('/support/chat', { messages }).then(r => r.data)

export const exportCsv = async () => {
  const token = await getDownloadToken()
  window.location.href = `${api.defaults.baseURL}/export/csv?token=${token}`
}
