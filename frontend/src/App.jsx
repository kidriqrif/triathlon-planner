import React, { useState, useEffect, useCallback } from 'react'
import { useI18n } from './i18n/I18nContext'
import { LANGUAGES } from './i18n/translations'
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
import SavedPage from './pages/SavedPage'
import PlansLibraryPage from './pages/PlansLibraryPage'
import JournalPage from './pages/JournalPage'
import BodyLogPage from './pages/BodyLogPage'
import { getWorkouts, getRaces, getMe } from './api'
import { DashboardSkeleton } from './components/Skeleton'
import SupportChat from './components/SupportChat'
import { requestNotificationPermission, notifyPlannedWorkouts } from './utils/notifications'
import { LayoutDashboard, CalendarDays, ClipboardList, Flag, User, Sparkles, LogOut, Settings, Menu, X, BookMarked, Library, NotebookPen, Scale, Moon, Sun } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', tKey: 'dashboard', Icon: LayoutDashboard },
  { id: 'plan',      tKey: 'calendar',  Icon: CalendarDays    },
  { id: 'log',       tKey: 'log',       Icon: ClipboardList   },
  { id: 'races',     tKey: 'races',     Icon: Flag            },
  { id: 'plans',     tKey: 'plans',     Icon: Library          },
  { id: 'journal',   tKey: 'journal',   Icon: NotebookPen     },
  { id: 'body',      tKey: 'bodyLog',   Icon: Scale           },
  { id: 'saved',     tKey: 'saved',     Icon: BookMarked      },
  { id: 'profile',   tKey: 'profile',   Icon: User            },
]

export default function App() {
  const { t, lang, setLang } = useI18n()
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('strelo_user')
    return stored ? JSON.parse(stored) : null
  })
  const [page, setPage] = useState('dashboard')
  const [workouts, setWorkouts] = useState([])
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('strelo_theme') === 'dark')

  // Apply dark class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('strelo_theme', dark ? 'dark' : 'light')
  }, [dark])

  const fetchAll = useCallback(async () => {
    try {
      const [ws, rs] = await Promise.all([getWorkouts(), getRaces()])
      setWorkouts(ws)
      setRaces(rs)
      notifyPlannedWorkouts(ws)
    } catch (e) {
      console.error('Failed to load data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      requestNotificationPermission()
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

  const handleAuth = (userData) => { setUser(userData); setLoading(true) }

  const handleLogout = () => {
    localStorage.removeItem('strelo_token')
    localStorage.removeItem('strelo_user')
    setUser(null); setWorkouts([]); setRaces([]); setPage('dashboard'); setSidebarOpen(false)
  }

  const navigate = (id) => { setPage(id); setSidebarOpen(false) }

  const params = new URLSearchParams(window.location.search)
  const resetToken = params.get('reset')

  useEffect(() => {
    if (params.get('strava') && user) {
      setPage('settings')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Not authenticated
  if (!user) {
    if (resetToken) return <AuthPage onAuth={handleAuth} resetToken={resetToken} />
    if (page === 'auth') return <AuthPage onAuth={handleAuth} />
    if (page === 'privacy') return <PrivacyPage onBack={() => setPage('landing')} />
    if (page === 'terms') return <TermsPage onBack={() => setPage('landing')} />
    return <LandingPage onGetStarted={() => setPage('auth')} onSignIn={() => setPage('auth')} onNavigate={setPage} />
  }

  // Onboarding
  if (user && !user.onboarded) {
    return (
      <OnboardingPage user={user} onComplete={() => {
        const updated = { ...user, onboarded: true }
        setUser(updated)
        localStorage.setItem('strelo_user', JSON.stringify(updated))
        fetchAll()
      }} />
    )
  }

  const renderPage = () => {
    if (loading) return <DashboardSkeleton />
    switch (page) {
      case 'dashboard': return <Dashboard races={races} workouts={workouts} onWorkoutsAdded={fetchAll} user={user} onNavigate={navigate} />
      case 'plan':      return <PlanPage workouts={workouts} onRefresh={fetchAll} />
      case 'log':       return <LogPage workouts={workouts} onRefresh={fetchAll} user={user} />
      case 'races':     return <RacesPage races={races} onRefresh={fetchAll} />
      case 'plans':     return <PlansLibraryPage onRefresh={fetchAll} />
      case 'journal':   return <JournalPage workouts={workouts} />
      case 'body':      return <BodyLogPage />
      case 'saved':     return <SavedPage user={user} onRefresh={fetchAll} />
      case 'profile':   return <ProfilePage />
      case 'upgrade':   return <UpgradePage user={user} />
      case 'settings':  return <SettingsPage user={user} onUserUpdate={(u) => {
        const updated = { ...user, ...u }
        setUser(updated)
        localStorage.setItem('strelo_user', JSON.stringify(updated))
      }} onLogout={handleLogout} dark={dark} setDark={setDark} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors">
      {/* Top bar — slim, just logo + hamburger */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <button onClick={() => navigate('dashboard')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">Strelo</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Page label */}
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:block capitalize">{page}</span>
            {/* Dark mode toggle */}
            <button onClick={() => setDark(d => !d)}
              className="p-2 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {dark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>
            {/* Menu */}
            <button onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Menu size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col">
            {/* Sidebar header */}
            <div className="px-5 h-14 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{t('menu')}</span>
              <button onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map(({ id, tKey, Icon }) => (
                <button key={id} onClick={() => navigate(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    page === id
                      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>
                  <Icon size={16} strokeWidth={1.5} />
                  {t(tKey)}
                </button>
              ))}

              {user.plan !== 'pro' && (
                <button onClick={() => navigate('upgrade')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    page === 'upgrade'
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800'
                  }`}>
                  <Sparkles size={16} strokeWidth={1.5} />
                  {t('upgradeToPro')}
                </button>
              )}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-slate-100 dark:border-slate-800 p-3 space-y-0.5">
              <button onClick={() => navigate('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  page === 'settings'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                <Settings size={16} strokeWidth={1.5} />
                {t('settings')}
              </button>

              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-500 transition-colors">
                <LogOut size={16} strokeWidth={1.5} />
                {t('signOut')}
              </button>

              {/* User info */}
              <div className="px-3 pt-3 pb-1 border-t border-slate-100 dark:border-slate-800 mt-2">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-5">
        {renderPage()}
      </main>

      {user.plan === 'pro' && <SupportChat />}
    </div>
  )
}
