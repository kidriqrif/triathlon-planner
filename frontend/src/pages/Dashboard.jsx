import React from 'react'
import { useI18n } from '../i18n/I18nContext'
import VolumeChart from '../components/VolumeChart'
import AICoach from '../components/AICoach'
import { Waves, Bike, Footprints, Dumbbell, Layers, Flame, Flag, Lock, ArrowRight, Circle } from 'lucide-react'
import { format, differenceInDays, startOfWeek, addDays, isToday, parseISO } from 'date-fns'

const SPORT_META = {
  swim:  { Icon: Waves,      color: 'text-blue-500',    bg: 'bg-blue-500',    label: 'Swim'  },
  bike:  { Icon: Bike,       color: 'text-orange-500',  bg: 'bg-orange-500',  label: 'Bike'  },
  run:   { Icon: Footprints, color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Run'   },
  gym:   { Icon: Dumbbell,   color: 'text-pink-500',    bg: 'bg-pink-500',    label: 'Gym'   },
  brick: { Icon: Layers,     color: 'text-violet-500',  bg: 'bg-violet-500',  label: 'Brick' },
}

const PHASE_LABEL = {
  Base:  'Base',
  Build: 'Build',
  Peak:  'Peak',
  Taper: 'Taper',
}

function getPhase(days) {
  if (days > 84) return 'Base'
  if (days > 56) return 'Build'
  if (days > 28) return 'Peak'
  return 'Taper'
}

// ── Greeting ────────────────────────────────────────────
function Greeting({ user }) {
  const now = new Date()
  const hour = now.getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'there'
  return (
    <div className="px-1">
      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.25em]" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}>
        {format(now, 'EEEE · d MMMM')}
      </p>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-0.5" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}>
        {greet}, {firstName}.
      </h1>
    </div>
  )
}

// ── Race hero ───────────────────────────────────────────
function RaceHero({ race, onNavigate }) {
  if (!race) {
    return (
      <div className="vista-panel rounded-2xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flag size={18} strokeWidth={1.5} className="text-rose-500" />
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No goal race set</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pick a race to start your countdown</p>
          </div>
        </div>
        <button onClick={() => onNavigate('races')} className="vista-btn px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
          Set one <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </div>
    )
  }

  const today = new Date(); today.setHours(12, 0, 0, 0)
  const raceDate = parseISO(race.date + 'T12:00:00')
  const days = differenceInDays(raceDate, today)
  const phase = getPhase(days)
  const raceOver = days < 0

  return (
    <div className="vista-panel rounded-2xl px-6 py-6 relative overflow-hidden">
      {/* Aero highlight curve */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/60 to-transparent pointer-events-none dark:from-rose-500/[0.03]" />
      <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-rose-500/[0.06] to-transparent pointer-events-none" />

      <div className="relative">
        <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.25em]">
          {raceOver ? 'Race complete' : 'Days until race'}
        </p>
        <div className="flex items-baseline gap-4 mt-1">
          <span className="font-display text-[88px] sm:text-[104px] font-extrabold text-slate-900 dark:text-white leading-[0.85] tracking-tight"
            style={{ textShadow: '0 2px 4px rgba(159, 18, 57, 0.08), 0 1px 0 rgba(255, 255, 255, 0.5)' }}>
            {Math.abs(days)}
          </span>
          {!raceOver && (
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-md border border-rose-300 dark:border-rose-700 bg-white/50 dark:bg-slate-900/50">
              {PHASE_LABEL[phase]}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-2.5">
          <div className="w-1 h-7 rounded-full bg-gradient-to-b from-rose-400 to-rose-600 shadow-sm" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{race.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{format(raceDate, 'd MMM yyyy')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Week strip ──────────────────────────────────────────
function WeekStrip({ workouts }) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const weekWorkouts = days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    const ws = workouts.filter(w => w.date === dateStr)
    return { date: d, workouts: ws, today: isToday(d) }
  })

  const totalSessions = weekWorkouts.reduce((s, d) => s + d.workouts.filter(w => w.status === 'completed').length, 0)
  const totalMins = weekWorkouts.reduce((s, d) => s + d.workouts
    .filter(w => w.status === 'completed')
    .reduce((ss, w) => ss + (w.duration_min || 0), 0), 0)
  const totalHours = (totalMins / 60).toFixed(1)

  return (
    <div className="vista-panel rounded-2xl p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.25em]">This week</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-display font-bold text-slate-800 dark:text-white">{totalSessions}</span> sessions
          <span className="text-rose-300 dark:text-rose-800 mx-2">·</span>
          <span className="font-display font-bold text-slate-800 dark:text-white">{totalHours}h</span>
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekWorkouts.map((day, i) => (
          <div key={i} className={`rounded-lg py-2 px-1 text-center transition-all relative overflow-hidden ${
            day.today
              ? 'bg-gradient-to-b from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-950/80 ring-1 ring-rose-400/50 shadow-sm'
              : 'bg-gradient-to-b from-white/80 to-white/40 dark:from-slate-800/40 dark:to-slate-900/40'
          }`}>
            {day.today && <div className="absolute inset-x-0 top-0 h-px bg-white/80" />}
            <p className={`text-[10px] font-bold uppercase ${
              day.today ? 'text-rose-700 dark:text-rose-300' : 'text-slate-400 dark:text-slate-500'
            }`}>{dayLetters[i]}</p>
            <p className={`text-xs font-bold mt-0.5 ${
              day.today ? 'text-rose-800 dark:text-rose-200' : 'text-slate-700 dark:text-slate-300'
            }`}>{format(day.date, 'd')}</p>
            <div className="flex justify-center gap-0.5 mt-1.5 min-h-[6px]">
              {day.workouts.slice(0, 3).map((w, wi) => {
                const meta = SPORT_META[w.sport] || SPORT_META.run
                return w.status === 'completed' ? (
                  <span key={wi} className={`w-1.5 h-1.5 rounded-full ${meta.bg} shadow-sm`} />
                ) : (
                  <span key={wi} className={`w-1.5 h-1.5 rounded-full border ${meta.bg.replace('bg-', 'border-')}`} />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Next workout ────────────────────────────────────────
function NextUp({ workouts }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const upcoming = workouts
    .filter(w => w.status === 'planned' && w.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  const next = upcoming[0]

  if (!next) {
    return (
      <div className="vista-panel rounded-2xl p-4 flex items-center justify-center">
        <div className="text-center">
          <Circle size={20} strokeWidth={1.5} className="text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">No planned workouts</p>
        </div>
      </div>
    )
  }

  const meta = SPORT_META[next.sport] || SPORT_META.run
  const nextDate = parseISO(next.date + 'T12:00:00')
  const isNextToday = next.date === today
  const dayLabel = isNextToday ? 'Today' : format(nextDate, 'EEE d MMM')

  return (
    <div className="vista-panel rounded-2xl p-4 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${meta.bg} shadow-sm`} />
      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.25em] pl-1">Next up</p>
      <div className="mt-1.5 flex items-center gap-2 pl-1">
        <meta.Icon size={16} strokeWidth={1.5} className={meta.color} />
        <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">{meta.label} · {next.workout_type}</p>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-1">
        {dayLabel}
        {next.duration_min && <> · {next.duration_min}min</>}
        {next.distance_km && <> · {next.distance_km}km</>}
      </p>
    </div>
  )
}

// ── Stat pills row ──────────────────────────────────────
function StatPills({ workouts }) {
  const completed = workouts.filter(w => w.status === 'completed')
  const totalHours = Math.round(completed.reduce((s, w) => s + (w.duration_min || 0), 0) / 60)

  const streak = (() => {
    const days = new Set(completed.map(w => w.date))
    let count = 0, d = new Date()
    d.setHours(12, 0, 0, 0)
    while (days.has(format(d, 'yyyy-MM-dd'))) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekMins = {}
  for (const w of completed) {
    if (parseISO(w.date + 'T12:00:00') >= monday) {
      weekMins[w.sport] = (weekMins[w.sport] || 0) + (w.duration_min || 0)
    }
  }
  const totalWeekMins = Object.values(weekMins).reduce((s, m) => s + m, 0)

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="vista-panel rounded-xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Flame size={12} strokeWidth={2.5} className="text-orange-500" />
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Streak</p>
        </div>
        <p className="font-display text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
          {streak}<span className="text-xs font-bold text-slate-400 ml-0.5">d</span>
        </p>
      </div>

      <div className="vista-panel rounded-xl px-4 py-3">
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">All-time</p>
        <p className="font-display text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
          {totalHours}<span className="text-xs font-bold text-slate-400 ml-0.5">h</span>
        </p>
      </div>

      <div className="vista-panel rounded-xl px-4 py-3">
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</p>
        {totalWeekMins > 0 ? (
          <div className="flex h-2 rounded-full overflow-hidden mt-2 bg-slate-200/50 dark:bg-slate-800/50 shadow-inner">
            {Object.entries(weekMins).map(([sport, mins]) => {
              const meta = SPORT_META[sport] || SPORT_META.run
              const pct = (mins / totalWeekMins) * 100
              return <div key={sport} className={`${meta.bg} shadow-sm`} style={{ width: `${pct}%` }} />
            })}
          </div>
        ) : (
          <p className="font-display text-xl font-extrabold text-slate-300 dark:text-slate-700 mt-0.5">—</p>
        )}
      </div>
    </div>
  )
}

// ── Pro CTA ──────────────────────────────────────────────
function ProCTA({ onNavigate }) {
  return (
    <div className="vista-panel rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={13} strokeWidth={2.5} className="text-rose-500" />
          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-[0.25em]">Pro features</p>
        </div>
        <p className="text-sm font-bold text-slate-800 dark:text-white">
          Unlock <span className="font-logo font-extrabold tracking-wider uppercase text-rose-500">Ace</span> & volume trends
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          Chat with your AI coach. See your weekly load. Get personalised plan packages.
        </p>
        <button onClick={() => onNavigate('upgrade')} className="vista-btn mt-3 text-xs px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5">
          Upgrade <ArrowRight size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

export default function Dashboard({ races, workouts, onWorkoutsAdded, user, onNavigate }) {
  const activeRace = races.find(r => r.is_active)

  return (
    <div className="space-y-4">
      <Greeting user={user} />
      <RaceHero race={activeRace} onNavigate={onNavigate} />

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2"><WeekStrip workouts={workouts} /></div>
        <NextUp workouts={workouts} />
      </div>

      <StatPills workouts={workouts} />

      {user?.plan === 'pro' ? (
        <>
          <VolumeChart workouts={workouts} />
          <AICoach onWorkoutsAdded={onWorkoutsAdded} />
        </>
      ) : (
        <ProCTA onNavigate={onNavigate} />
      )}
    </div>
  )
}
