import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/workouts': 'http://localhost:8000',
      '/races': 'http://localhost:8000',
      '/athlete': 'http://localhost:8000',
      '/ai': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
