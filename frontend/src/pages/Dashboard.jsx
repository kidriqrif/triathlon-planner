import React from 'react'
import RaceCountdown from '../components/RaceCountdown'
import VolumeChart from '../components/VolumeChart'
import AICoach from '../components/AICoach'
import { Waves, Bike, Footprints, Dumbbell, Layers, CheckCircle, Clock, Flame, TrendingUp, Lock, Sparkles } from 'lucide-react'

const SPORT_META = {
  swim:  { Icon: Waves,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'Swim'  },
  bike:  { Icon: Bike,       color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Bike'  },
  run:   { Icon: Footprints, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'Run'   },
  gym:   { Icon: Dumbbell,   color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200',   label: 'Gym'   },
  brick: { Icon: Layers,     color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', label: 'Brick' },
}

function StatCard({ label, sub, value, valueColor = 'text-slate-800', icon, gradient }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm border flex flex-col gap-1 ${gradient || 'bg-white border-slate-100'}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        {icon}
      </div>
      <p className={`text-3xl font-black mt-1 ${gradient ? 'text-white' : valueColor}`}>{value}</p>
      <p className={`text-sm ${gradient ? 'text-white/70' : 'text-slate-400'}`}>{sub}</p>
    </div>
  )
}

function SportBreakdown({ workouts }) {
  const thisMonday = (() => {
    const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setHours(0,0,0,0); return d
  })()

  const weekData = workouts.filter(w =>
    new Date(w.date + 'T12:00:00') >= thisMonday && w.status === 'completed'
  )

  const totals = {}
  for (const w of weekData) {
    if (!totals[w.sport]) totals[w.sport] = { sessions: 0, minutes: 0 }
    totals[w.sport].sessions++
    totals[w.sport].minutes += w.duration_min || 0
  }

  const sports = Object.keys(totals)
  if (sports.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">This Week — Sport Breakdown</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sports.map(sport => {
          const meta = SPORT_META[sport] || SPORT_META.brick
          const d = totals[sport]
          return (
            <div key={sport} className={`rounded-xl p-3 border ${meta.bg} ${meta.border} flex items-center gap-3`}>
              <meta.Icon size={22} strokeWidth={1.5} className={meta.color} />
              <div>
                <p className={`text-sm font-bold ${meta.color}`}>{meta.label}</p>
                <p className="text-xs text-slate-500">{d.sessions} session{d.sessions !== 1 ? 's' : ''} · {Math.round(d.minutes)}min</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard({ races, workouts, onWorkoutsAdded, user, onNavigate }) {
  const completed = workouts.filter(w => w.status === 'completed')

  const totalHours = completed
    .filter(w => w.duration_min)
    .reduce((s, w) => s + w.duration_min, 0) / 60

  const thisMonday = (() => {
    const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setHours(0,0,0,0); return d
  })()

  const weekDone = completed.filter(w => new Date(w.date + 'T12:00:00') >= thisMonday)
  const weekHours = weekDone.reduce((s, w) => s + (w.duration_min || 0), 0) / 60

  const streak = (() => {
    const days = new Set(completed.map(w => w.date))
    let count = 0, d = new Date()
    d.setHours(12, 0, 0, 0)
    while (days.has(d.toISOString().split('T')[0])) {
      count++
      d.setDate(d.getDate() - 1)
    }
    return count
  })()

  return (
    <div className="space-y-5">
      <RaceCountdown races={races} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="This Week" sub="sessions done" value={weekDone.length}
          icon={<CheckCircle size={17} strokeWidth={1.5} className="text-slate-300" />} />
        <StatCard label="This Week" sub="training hours" value={`${weekHours.toFixed(1)}h`}
          valueColor="text-indigo-600"
          icon={<Clock size={17} strokeWidth={1.5} className="text-slate-300" />} />
        <StatCard label="Streak" sub="consecutive days" value={`${streak}d`}
          valueColor="text-orange-500"
          icon={<Flame size={17} strokeWidth={1.5} className="text-slate-300" />} />
        <StatCard label="All Time" sub="hours logged" value={`${Math.round(totalHours)}h`}
          icon={<TrendingUp size={17} strokeWidth={1.5} className="text-slate-300" />} />
      </div>

      <SportBreakdown workouts={workouts} />
      <VolumeChart workouts={workouts} />
      {user?.plan === 'pro' ? (
        <AICoach onWorkoutsAdded={onWorkoutsAdded} />
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <div className="flex justify-center mb-3">
            <Lock size={20} strokeWidth={1.5} className="text-slate-300" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">StreloIQ</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Generates your training week based on your fitness, race target, and history.
          </p>
          <button onClick={() => onNavigate('upgrade')}
            className="text-xs font-semibold text-slate-900 border border-slate-200 px-4 py-2 rounded-lg hover:border-slate-300 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  )
}
