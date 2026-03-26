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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <button onClick={() => setPage('dashboard')} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.25)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="hidden sm:block font-extrabold text-white text-base tracking-tight">Strelo</span>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {NAV.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setPage(id)}
                className={`relative flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  page === id
                    ? 'bg-white/15 text-white shadow-inner'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
                }`}>
                <Icon size={16} strokeWidth={1.5} />
                <span className="hidden lg:block">{label}</span>
                {page === id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/60 rounded-full" />
                )}
              </button>
            ))}

            {/* Upgrade button (only for free users) */}
            {user.plan !== 'pro' && (
              <button
                onClick={() => setPage('upgrade')}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  page === 'upgrade'
                    ? 'bg-white/15 text-white'
                    : 'text-amber-400/90 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/50'
                }`}>
                <Sparkles size={12} strokeWidth={2} />
                <span className="hidden lg:block">Pro</span>
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => setPage('settings')}
              title="Settings"
              className={`ml-1 sm:ml-2 flex items-center px-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                page === 'settings' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white hover:bg-white/8'
              }`}>
              <Settings size={16} strokeWidth={1.5} />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center px-2 py-2 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/8 transition-all">
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-7">
        {renderPage()}
      </main>

      <SupportChat />
    </div>
  )
}
