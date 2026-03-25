import React, { useState, useEffect, useCallback } from 'react'
import Dashboard from './pages/Dashboard'
import PlanPage from './pages/PlanPage'
import LogPage from './pages/LogPage'
import RacesPage from './pages/RacesPage'
import ProfilePage from './pages/ProfilePage'
import { getWorkouts, getRaces } from './api'
import { LayoutDashboard, CalendarDays, ClipboardList, Flag, User, Activity } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'plan',      label: 'Calendar',  Icon: CalendarDays    },
  { id: 'log',       label: 'Log',       Icon: ClipboardList   },
  { id: 'races',     label: 'Races',     Icon: Flag            },
  { id: 'profile',   label: 'Profile',   Icon: User            },
]

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [workouts, setWorkouts] = useState([])
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      const [ws, rs] = await Promise.all([getWorkouts(), getRaces()])
      setWorkouts(ws)
      setRaces(rs)
    } catch (e) {
      console.error('Failed to load data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <svg className="animate-spin h-9 w-9 text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm font-medium">Loading your training data…</p>
          </div>
        </div>
      )
    }
    switch (page) {
      case 'dashboard': return <Dashboard races={races} workouts={workouts} onWorkoutsAdded={fetchAll} />
      case 'plan':      return <PlanPage workouts={workouts} onRefresh={fetchAll} />
      case 'log':       return <LogPage workouts={workouts} onRefresh={fetchAll} />
      case 'races':     return <RacesPage races={races} onRefresh={fetchAll} />
      case 'profile':   return <ProfilePage />
      default:          return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand */}
          <button onClick={() => setPage('dashboard')} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Activity size={17} strokeWidth={1.5} className="text-indigo-400" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-white text-lg tracking-tight">Stre</span>
              <span className="font-black text-indigo-400 text-lg tracking-tight">lo</span>
            </div>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setPage(id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  page === id
                    ? 'bg-white/15 text-white shadow-inner'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
                }`}>
                <Icon size={16} strokeWidth={1.5} />
                <span className="hidden md:block">{label}</span>
                {page === id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-7">
        {renderPage()}
      </main>
    </div>
  )
}
