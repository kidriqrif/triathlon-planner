import React, { useState, useEffect, useCallback } from 'react'
import Dashboard from './pages/Dashboard'
import PlanPage from './pages/PlanPage'
import LogPage from './pages/LogPage'
import RacesPage from './pages/RacesPage'
import ProfilePage from './pages/ProfilePage'
import UpgradePage from './pages/UpgradePage'
import AuthPage from './pages/AuthPage'
import LandingPage from './pages/LandingPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import OnboardingPage from './pages/OnboardingPage'
import SettingsPage from './pages/SettingsPage'
import { getWorkouts, getRaces, getMe } from './api'
import { DashboardSkeleton } from './components/Skeleton'
import SupportChat from './components/SupportChat'
import { LayoutDashboard, CalendarDays, ClipboardList, Flag, User, Sparkles, LogOut, Settings } from 'lucide-react'

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

  // Refresh user data from server on mount (catches webhook upgrades + onboarding status)
  useEffect(() => {
    if (user) {
      getMe().then(me => {
        const updated = { ...user, plan: me.plan, onboarded: me.onboarded }
        setUser(updated)
        localStorage.setItem('strelo_user', JSON.stringify(updated))
      }).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Check URL params
  const params = new URLSearchParams(window.location.search)
  const resetToken = params.get('reset')

  // Strava callback — redirect to settings
  useEffect(() => {
    if (params.get('strava') && user) {
      setPage('settings')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Not authenticated — show landing, auth, or legal pages
  if (!user) {
    if (resetToken) return <AuthPage onAuth={handleAuth} resetToken={resetToken} />
    if (page === 'auth') return <AuthPage onAuth={handleAuth} />
    if (page === 'privacy') return <PrivacyPage onBack={() => setPage('landing')} />
    if (page === 'terms') return <TermsPage onBack={() => setPage('landing')} />
    return (
      <LandingPage
        onGetStarted={() => setPage('auth')}
        onSignIn={() => setPage('auth')}
        onNavigate={setPage}
      />
    )
  }

  // Authenticated but not onboarded — show onboarding
  if (user && !user.onboarded) {
    return (
      <OnboardingPage
        user={user}
        onComplete={() => {
          const updated = { ...user, onboarded: true }
          setUser(updated)
          localStorage.setItem('strelo_user', JSON.stringify(updated))
          fetchAll()
        }}
      />
    )
  }

  const renderPage = () => {
    if (loading) return <DashboardSkeleton />
    switch (page) {
      case 'dashboard': return <Dashboard races={races} workouts={workouts} onWorkoutsAdded={fetchAll} user={user} onNavigate={setPage} />
      case 'plan':      return <PlanPage workouts={workouts} onRefresh={fetchAll} />
      case 'log':       return <LogPage workouts={workouts} onRefresh={fetchAll} />
      case 'races':     return <RacesPage races={races} onRefresh={fetchAll} />
      case 'profile':   return <ProfilePage />
      case 'upgrade':   return <UpgradePage user={user} />
      case 'settings':  return <SettingsPage user={user} onUserUpdate={(u) => {
        const updated = { ...user, ...u }
        setUser(updated)
        localStorage.setItem('strelo_user', JSON.stringify(updated))
      }} onLogout={handleLogout} />
      default:          return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header — functional toolbar style */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-11 flex items-center justify-between">
          {/* Brand */}
          <button onClick={() => setPage('dashboard')} className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="hidden sm:block font-bold text-slate-900 text-sm">Strelo</span>
          </button>

          {/* Nav — tab style */}
          <nav className="flex items-center gap-0 h-full">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setPage(id)}
                className={`flex items-center gap-1.5 px-3 h-full text-xs font-medium border-b-2 transition-colors ${
                  page === id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                <Icon size={14} strokeWidth={1.5} />
                <span className="hidden md:block">{label}</span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {user.plan !== 'pro' && (
              <button onClick={() => setPage('upgrade')}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                  page === 'upgrade' ? 'bg-slate-100 text-slate-900' : 'text-amber-600 hover:bg-amber-50'
                }`}>
                <Sparkles size={11} strokeWidth={2} className="inline mr-1" />
                <span className="hidden sm:inline">Pro</span>
              </button>
            )}
            <button onClick={() => setPage('settings')} title="Settings"
              className={`p-1.5 rounded transition-colors ${
                page === 'settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}>
              <Settings size={14} strokeWidth={1.5} />
            </button>
            <button onClick={handleLogout} title="Sign out"
              className="p-1.5 rounded text-slate-400 hover:text-slate-600 transition-colors">
              <LogOut size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Content — tighter padding */}
      <main className="max-w-6xl mx-auto px-4 py-5">
        {renderPage()}
      </main>

      <SupportChat />
    </div>
  )
}
