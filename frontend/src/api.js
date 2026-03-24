import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' })

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
