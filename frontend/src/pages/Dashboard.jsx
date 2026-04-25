import React from 'react'
import { useI18n } from '../i18n/I18nContext'
import VolumeChart from '../components/VolumeChart'
import AICoach from '../components/AICoach'
import LoadChart from '../components/LoadChart'
import {
  Waves, Bike, Footprints, Dumbbell, Layers, Flame, Flag, Lock, ArrowRight, Circle,
  Target, Sparkles, Activity,
} from 'lucide-react'
import { format, differenceInDays, startOfWeek, addDays, isToday, parseISO } from 'date-fns'

const SPORT_META = {
  swim:  { Icon: Waves,      hex: '#3b82f6', chip: 'chip-swim',  label: 'Swim'  },
  bike:  { Icon: Bike,       hex: '#f97316', chip: 'chip-bike',  label: 'Bike'  },
  run:   { Icon: Footprints, hex: '#10b981', chip: 'chip-run',   label: 'Run'   },
  gym:   { Icon: Dumbbell,   hex: '#ec4899', chip: 'chip-gym',   label: 'Gym'   },
  brick: { Icon: Layers,     hex: '#8b5cf6', chip: 'chip-brick', label: 'Brick' },
}

const PHASE_LABEL = { Base: 'Base', Build: 'Build', Peak: 'Peak', Taper: 'Taper' }

function getPhase(days) {
  if (days > 84) return 'Base'
  if (days > 56) return 'Build'
  if (days > 28) return 'Peak'
  return 'Taper'
}

function getPhaseProgress(days) {
  // 20-week macrocycle, returns % completed (0–100)
  const totalDays = 140
  const remaining = Math.max(0, Math.min(totalDays, days))
  return Math.round(((totalDays - remaining) / totalDays) * 100)
}

// ── Greeting ────────────────────────────────────────────
function Greeting({ user }) {
  const now = new Date()
  const hour = now.getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'there'
  return (
    <header className="flex items-end justify-between">
      <div>
        <p className="eyebrow mb-1">{format(now, 'EEEE · d MMMM')}</p>
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {greet}, <span className="text-zinc-500 dark:text-zinc-400">{firstName}.</span>
        </h1>
      </div>
    </header>
  )
}

// ── Race countdown hero ─────────────────────────────────
function RaceHero({ race, onNavigate }) {
  if (!race) {
    return (
      <section className="panel p-8 md:p-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 flex items-center justify-center">
            <Flag size={20} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-900 dark:text-white">No goal race set</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Pick a race to start your countdown.</p>
          </div>
        </div>
        <button onClick={() => onNavigate('races')} className="btn-sunrise text-sm py-2.5 px-4">
          Set a race <ArrowRight size={14} />
        </button>
      </section>
    )
  }

  const today = new Date(); today.setHours(12, 0, 0, 0)
  const raceDate = parseISO(race.date + 'T12:00:00')
  const days = differenceInDays(raceDate, today)
  const phase = getPhase(days)
  const raceOver = days < 0
  const progress = raceOver ? 100 : getPhaseProgress(days)

  // Arc geometry: r=45 → circumference 283
  const circumference = 283
  const dashOffset = circumference - (circumference * progress) / 100

  return (
    <section className="panel p-8 md:p-10 relative overflow-hidden">
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-orange-500 opacity-[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-32 -bottom-32 w-72 h-72 bg-pink-500 opacity-[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex-1 space-y-5 w-full">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sunrise-subtle border border-orange-500/30 rounded-full">
              <span className="pulse-dot" />
              <span className="text-xs font-mono text-orange-500 tracking-widest uppercase font-semibold">
                {raceOver ? 'Complete' : `${PHASE_LABEL[phase]} Phase`}
              </span>
            </div>
            {!raceOver && <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">Week {Math.ceil((140 - days) / 7)} of 20</span>}
          </div>

          <div className="flex items-baseline gap-4 mt-2">
            <span className="font-display text-[6rem] md:text-[8rem] lg:text-[9rem] font-bold leading-[0.85] tracking-tighter text-zinc-900 dark:text-white tabular-nums">
              {Math.abs(days)}
            </span>
            <div className="flex flex-col">
              <span className="font-display text-2xl md:text-3xl font-medium text-zinc-700 dark:text-zinc-200">Days</span>
              <span className="font-mono text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
                {raceOver ? 'since race' : 'until race'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200/50 dark:border-white/10 w-full md:w-3/4 flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="font-medium text-zinc-900 dark:text-white text-base md:text-lg truncate">{race.name}</h3>
              {race.location && <p className="text-sm text-zinc-500 dark:text-zinc-400">{race.location}</p>}
            </div>
            <div className="flex flex-col items-end shrink-0 ml-4">
              <span className="text-sm text-zinc-900 dark:text-white font-mono">{format(raceDate, 'd MMM')}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{format(raceDate, 'yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Progress arc */}
        <div className="w-full md:w-[260px] flex justify-center items-center relative py-2 shrink-0">
          <svg className="w-44 h-44 md:w-56 md:h-56" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-zinc-200 dark:stroke-white/5" strokeWidth="3" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke="url(#dash-arc)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
            />
            <defs>
              <linearGradient id="dash-arc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff7a00" />
                <stop offset="100%" stopColor="#ff0080" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="eyebrow">Macrocycle</span>
            <span className="font-display text-3xl md:text-4xl font-semibold text-sunrise mt-1 tabular-nums">{progress}%</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Today's workouts ────────────────────────────────────
function TodayList({ workouts, onNavigate }) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const todays = workouts.filter(w => w.date === today)
  const totalMin = todays.reduce((s, w) => s + (w.duration_min || 0), 0)
  const totalLabel = totalMin >= 60
    ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`
    : `${totalMin}m`

  return (
    <section className="panel p-6 lg:p-7 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-medium text-zinc-900 dark:text-white flex items-center gap-2">
          <Target size={16} className="text-zinc-500 dark:text-zinc-400" />
          Today's order
        </h3>
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {todays.length} {todays.length === 1 ? 'item' : 'items'} · {totalLabel}
        </span>
      </div>

      {todays.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/5 flex items-center justify-center mb-3">
            <Circle size={18} className="text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nothing scheduled today</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Plan a session in the calendar.</p>
          <button onClick={() => onNavigate('plan')} className="btn-ghost mt-4 text-sm">
            Open calendar <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2">
          {todays.map((w, i) => {
            const meta = SPORT_META[w.sport] || SPORT_META.run
            const Icon = meta.Icon
            const status = w.status || 'planned'
            const statusStyles = {
              completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              skipped:   'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
              planned:   'bg-white/5 text-zinc-400 border-white/10 dark:text-zinc-300',
            }[status]
            return (
              <div key={i} className="flex items-center justify-between p-3.5 bg-zinc-50/60 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/[0.04] rounded-2xl gap-4 hover:border-zinc-300 dark:hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-11 h-11 rounded-full ${meta.chip} flex items-center justify-center shrink-0`}>
                    <Icon size={18} style={{ color: meta.hex }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate capitalize">
                      {w.workout_type || meta.label}
                    </h4>
                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex-wrap">
                      {w.distance_km && <span>{w.distance_km} km</span>}
                      {w.distance_km && w.duration_min && <span className="text-zinc-300 dark:text-zinc-700">·</span>}
                      {w.duration_min && <span>{w.duration_min} min</span>}
                    </div>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider border shrink-0 ${statusStyles}`}>
                  {status}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ── Stat strip (streak / hours / balance) ────────────────
function StatStrip({ workouts }) {
  const completed = workouts.filter(w => w.status === 'completed')
  const totalHours = Math.round(completed.reduce((s, w) => s + (w.duration_min || 0), 0) / 60)

  const streak = (() => {
    const days = new Set(completed.map(w => w.date))
    let count = 0, d = new Date()
    d.setHours(12, 0, 0, 0)
    while (days.has(format(d, 'yyyy-MM-dd'))) {
      count++; d.setDate(d.getDate() - 1)
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
      <div className="panel px-4 py-3.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Flame size={11} className="text-orange-500" />
          <p className="eyebrow text-[10px]">Streak</p>
        </div>
        <p className="font-display text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
          {streak}<span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 ml-1">d</span>
        </p>
      </div>
      <div className="panel px-4 py-3.5">
        <div className="flex items-center gap-1.5 mb-1">
          <Activity size={11} className="text-zinc-400" />
          <p className="eyebrow text-[10px]">All-time</p>
        </div>
        <p className="font-display text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
          {totalHours}<span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 ml-1">h</span>
        </p>
      </div>
      <div className="panel px-4 py-3.5">
        <p className="eyebrow text-[10px] mb-2">Sport balance</p>
        {totalWeekMins > 0 ? (
          <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-200/40 dark:bg-white/5">
            {Object.entries(weekMins).map(([sport, mins]) => {
              const meta = SPORT_META[sport] || SPORT_META.run
              const pct = (mins / totalWeekMins) * 100
              return <div key={sport} style={{ width: `${pct}%`, backgroundColor: meta.hex }} />
            })}
          </div>
        ) : (
          <p className="font-display text-xl font-medium text-zinc-300 dark:text-zinc-700">—</p>
        )}
      </div>
    </div>
  )
}

// ── Pro upsell card (Ace coach) ─────────────────────────
function ProCTA({ onNavigate }) {
  return (
    <section className="relative rounded-3xl p-[1px] bg-gradient-to-br from-orange-500/40 via-pink-500/30 to-orange-500/10 h-full">
      <div className="rounded-[calc(1.5rem-1px)] bg-zinc-100/80 dark:bg-zinc-950 p-6 lg:p-7 flex flex-col h-full relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500 opacity-15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2.5 mb-4 relative">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sunrise-start to-sunrise-end flex items-center justify-center shadow-glow-sunrise">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display text-sm font-semibold tracking-widest text-zinc-700 dark:text-zinc-300 uppercase">Ace · Coach</span>
        </div>
        <div className="flex-1 relative">
          <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-100 font-medium mb-3">
            Unlock your AI periodisation coach.
          </p>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Ace writes balanced training weeks, recalculates when you miss a session, and surfaces volume trends — all tuned to your goal race.
          </p>
        </div>
        <button onClick={() => onNavigate('upgrade')} className="btn-sunrise w-full mt-6">
          Upgrade to Pro <ArrowRight size={14} />
        </button>
      </div>
    </section>
  )
}

// ── Main Dashboard composition ──────────────────────────
export default function Dashboard({ races, workouts, onWorkoutsAdded, user, onNavigate }) {
  const activeRace = races.find(r => r.is_active)
  const isPro = user?.plan === 'pro'

  return (
    <div className="space-y-6">
      <Greeting user={user} />
      <RaceHero race={activeRace} onNavigate={onNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TodayList workouts={workouts} onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-4">
          {isPro ? <AICoach onWorkoutsAdded={onWorkoutsAdded} /> : <ProCTA onNavigate={onNavigate} />}
        </div>
      </div>

      <StatStrip workouts={workouts} />

      {isPro && (
        <>
          <LoadChart workouts={workouts} />
          <VolumeChart workouts={workouts} />
        </>
      )}
    </div>
  )
}
