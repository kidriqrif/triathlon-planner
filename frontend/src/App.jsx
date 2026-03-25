import React, { useState, useEffect, useCallback } from 'react'
import Dashboard from './pages/Dashboard'
import PlanPage from './pages/PlanPage'
import LogPage from './pages/LogPage'
import RacesPage from './pages/RacesPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'
import { getWorkouts, getRaces } from './api'
import { LayoutDashboard, CalendarDays, ClipboardList, Flag, User, LogOut } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'plan',      label: 'Calendar',  Icon: CalendarDays    },
  { id: 'log',       label: 'Log',       Icon: ClipboardList   },
  { id: 'races',     label: 'Races',     Icon: Flag            },
  { id: 'profile',   label: 'Profile',   Icon: User            },
]

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('strelo_user')
    return stored ? JSON.parse(stored) : null
  })
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

  useEffect(() => {
    if (user) fetchAll()
    else setLoading(false)
  }, [user, fetchAll])

  const handleAuth = (userData) => {
    setUser(userData)
    setLoading(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('strelo_token')
    localStorage.removeItem('strelo_user')
    setUser(null)
    setWorkouts([])
    setRaces([])
    setPage('dashboard')
  }

  // Not authenticated — show auth page
  if (!user) {
    return <AuthPage onAuth={handleAuth} />
  }

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
            <p className="text-slate-400 text-sm font-medium">Loading your training data...</p>
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
          <button onClick={() => setPage('dashboard')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="hidden sm:block font-black text-white text-lg tracking-tight">Strelo</span>
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

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="ml-2 flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/8 transition-all">
              <LogOut size={16} strokeWidth={1.5} />
            </button>
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
