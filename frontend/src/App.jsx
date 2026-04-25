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
import { LayoutDashboard, CalendarDays, ClipboardList, Flag, User, Sparkles, LogOut, Settings, Menu, X, BookMarked, Library, NotebookPen, Scale, Moon, Sun, Wifi } from 'lucide-react'

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
  const [waking, setWaking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('strelo_theme') === 'dark')

  // Apply dark class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('strelo_theme', dark ? 'dark' : 'light')
  }, [dark])

  // Show "waking up" if loading takes more than 2s (cold start)
  useEffect(() => {
    if (!loading) { setWaking(false); return }
    const t = setTimeout(() => setWaking(true), 2000)
    return () => clearTimeout(t)
  }, [loading])

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

  const handleAuth = (userData) => { setUser(userData); setLoading(true); setPage('dashboard') }

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
    if (loading) return (
      <>
        {waking && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-lg px-4 py-2.5 mb-3">
            <Wifi size={14} strokeWidth={1.5} className="animate-pulse" />
            Waking up the server — this only takes a few seconds on the first visit...
          </div>
        )}
        <DashboardSkeleton />
      </>
    )
    switch (page) {
      case 'dashboard': return <Dashboard races={races} workouts={workouts} onWorkoutsAdded={fetchAll} user={user} onNavigate={navigate} />
      case 'plan':      return <PlanPage workouts={workouts} onRefresh={fetchAll} />
      case 'log':       return <LogPage workouts={workouts} onRefresh={fetchAll} user={user} />
      case 'races':     return <RacesPage races={races} onRefresh={fetchAll} />
      case 'plans':     return <PlansLibraryPage onRefresh={fetchAll} user={user} />
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

  const SidebarNav = ({ onNavigateClick }) => (
    <>
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        <span className="px-3 text-[10px] font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-2 block">Command</span>
        {NAV_ITEMS.map(({ id, tKey, Icon }) => (
          <button key={id} onClick={() => onNavigateClick(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
              page === id
                ? 'bg-sunrise-subtle text-zinc-900 dark:text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-white'
            }`}>
            {page === id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-sunrise-gradient rounded-r-full" />
            )}
            <Icon size={16} strokeWidth={1.75} className={page === id ? 'text-orange-500' : ''} />
            {t(tKey)}
          </button>
        ))}

        {user.plan !== 'pro' && (
          <button onClick={() => onNavigateClick('upgrade')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 ${
              page === 'upgrade'
                ? 'bg-sunrise-subtle text-orange-500'
                : 'text-orange-500 hover:bg-zinc-100 dark:hover:bg-white/[0.03]'
            }`}>
            <Sparkles size={16} strokeWidth={1.75} />
            {t('upgradeToPro')}
          </button>
        )}
      </nav>

      <div className="border-t border-zinc-200/60 dark:border-white/5 p-3 space-y-0.5">
        <button onClick={() => onNavigateClick('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            page === 'settings'
              ? 'bg-zinc-100 dark:bg-white/[0.05] text-zinc-900 dark:text-white'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.03]'
          }`}>
          <Settings size={16} strokeWidth={1.75} />
          {t('settings')}
        </button>

        <button onClick={() => setDark(d => !d)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition-colors">
          {dark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.03] hover:text-red-500 transition-colors">
          <LogOut size={16} strokeWidth={1.75} />
          {t('signOut')}
        </button>

        <div className="px-3 pt-3 pb-1 border-t border-zinc-200/60 dark:border-white/5 mt-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sunrise-gradient flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-glow-sunrise">
            {user.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  )

  const StreloLogo = () => (
    <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-sunrise-gradient flex items-center justify-center shadow-glow-sunrise">
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M12 14L15 4" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="font-display font-bold text-zinc-900 dark:text-white text-base tracking-tight">Strelo</span>
    </button>
  )

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#030303] atmosphere relative">
      <div className="topo-bg" />

      {/* Persistent sidebar — md+ */}
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 h-screen sticky top-0 border-r border-zinc-200/60 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl z-20">
        <div className="px-6 py-6">
          <StreloLogo />
        </div>
        <SidebarNav onNavigateClick={navigate} />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 bg-white dark:bg-zinc-900 h-full flex flex-col border-r border-zinc-200/60 dark:border-white/5 ml-0">
            <div className="px-5 h-14 flex items-center justify-between border-b border-zinc-200/60 dark:border-white/5">
              <StreloLogo />
              <button onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <SidebarNav onNavigateClick={navigate} />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 relative z-10">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-200/60 dark:border-white/5">
          <div className="px-4 h-14 flex items-center justify-between">
            <StreloLogo />
            <div className="flex items-center gap-1">
              <button onClick={() => setDark(d => !d)}
                className="p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                {dark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
              </button>
              <button onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                <Menu size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {renderPage()}
        </main>
      </div>

      <SupportChat />
    </div>
  )
}
