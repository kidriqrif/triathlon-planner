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
import { LayoutDashboard, CalendarDays, ClipboardList, Flag, User, Sparkles, LogOut, Settings, Menu, X, BookMarked, Library, NotebookPen, Scale, Moon, Sun, Wifi, ChevronsLeft, ChevronsRight } from 'lucide-react'
import StreloMark from './components/StreloMark'

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('strelo_sidebar_collapsed') === '1')
  const [avatar, setAvatar] = useState(() => localStorage.getItem('strelo_avatar') || '')
  const [dark, setDark] = useState(() => localStorage.getItem('strelo_theme') === 'dark')

  useEffect(() => { localStorage.setItem('strelo_sidebar_collapsed', sidebarCollapsed ? '1' : '0') }, [sidebarCollapsed])

  // Listen for avatar changes from ProfilePage
  useEffect(() => {
    const handler = () => setAvatar(localStorage.getItem('strelo_avatar') || '')
    window.addEventListener('strelo:avatar-changed', handler)
    return () => window.removeEventListener('strelo:avatar-changed', handler)
  }, [])

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

  const SidebarNav = ({ onNavigateClick, collapsed = false }) => {
    const navBtn = (active, isOrange = false) =>
      `w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm font-medium transition-colors relative group ${
        active
          ? isOrange ? 'bg-sunrise-subtle text-orange-500' : 'bg-sunrise-subtle text-zinc-900 dark:text-white'
          : isOrange ? 'text-orange-500 hover:bg-zinc-100 dark:hover:bg-white/[0.03]'
                     : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.03] hover:text-zinc-900 dark:hover:text-white'
      }`

    const tip = (label) => collapsed && (
      <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium bg-zinc-900 dark:bg-zinc-800 text-white rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-white/10">
        {label}
      </span>
    )

    return (
      <>
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {!collapsed && (
            <span className="px-3 text-[10px] font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-2 block">Command</span>
          )}
          {NAV_ITEMS.map(({ id, tKey, Icon }) => (
            <button key={id} onClick={() => onNavigateClick(id)} className={navBtn(page === id)}>
              {page === id && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-sunrise-gradient rounded-r-full" />
              )}
              <Icon size={16} strokeWidth={1.75} className={page === id ? 'text-orange-500' : ''} />
              {!collapsed && t(tKey)}
              {tip(t(tKey))}
            </button>
          ))}

          {user.plan !== 'pro' && (
            <button onClick={() => onNavigateClick('upgrade')} className={navBtn(page === 'upgrade', true) + ' mt-2'}>
              <Sparkles size={16} strokeWidth={1.75} />
              {!collapsed && t('upgradeToPro')}
              {tip(t('upgradeToPro'))}
            </button>
          )}
        </nav>

        <div className="border-t border-zinc-200/60 dark:border-white/5 p-3 space-y-0.5">
          <button onClick={() => onNavigateClick('settings')} className={navBtn(page === 'settings')}>
            <Settings size={16} strokeWidth={1.75} />
            {!collapsed && t('settings')}
            {tip(t('settings'))}
          </button>

          <button onClick={() => setDark(d => !d)} className={navBtn(false)}>
            {dark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
            {!collapsed && (dark ? 'Light mode' : 'Dark mode')}
            {tip(dark ? 'Light mode' : 'Dark mode')}
          </button>

          <button onClick={handleLogout} className={navBtn(false) + ' hover:!text-red-500'}>
            <LogOut size={16} strokeWidth={1.75} />
            {!collapsed && t('signOut')}
            {tip(t('signOut'))}
          </button>

          <div className={`pt-3 mt-2 border-t border-zinc-200/60 dark:border-white/5 ${collapsed ? 'flex justify-center' : 'px-3 flex items-center gap-3'}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-glow-sunrise relative">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-sunrise-gradient flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.[0]?.toUpperCase() || 'A'}
                </div>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  const StreloLogo = () => (
    <button onClick={() => navigate('dashboard')} className="flex items-center gap-2.5">
      <StreloMark size={26} />
      <span className="font-display font-bold text-zinc-900 dark:text-white text-base tracking-tight">Strelo</span>
    </button>
  )

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#030303] atmosphere relative">
      <div className="topo-bg" />

      {/* Persistent sidebar — md+ */}
      <aside className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 border-r border-zinc-200/60 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-xl z-20 transition-[width] duration-200 ease-out ${
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}>
        <div className={`py-6 flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
          {sidebarCollapsed ? (
            <button onClick={() => navigate('dashboard')}>
              <StreloMark size={26} />
            </button>
          ) : <StreloLogo />}
          {!sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              title="Collapse sidebar">
              <ChevronsLeft size={16} strokeWidth={2} />
            </button>
          )}
        </div>
        <SidebarNav onNavigateClick={navigate} collapsed={sidebarCollapsed} />
        {sidebarCollapsed && (
          <button onClick={() => setSidebarCollapsed(false)}
            className="border-t border-zinc-200/60 dark:border-white/5 py-3 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
            title="Expand sidebar">
            <ChevronsRight size={16} strokeWidth={2} />
          </button>
        )}
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
