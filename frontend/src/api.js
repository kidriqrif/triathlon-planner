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

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
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
export const exportFitUrl = (workoutId) => {
  const token = localStorage.getItem('strelo_token')
  return `${api.defaults.baseURL}/export/fit/${workoutId}?token=${token}`
}
