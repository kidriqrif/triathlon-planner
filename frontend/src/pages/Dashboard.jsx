import React from 'react'
import RaceCountdown from '../components/RaceCountdown'
import VolumeChart from '../components/VolumeChart'
import AICoach from '../components/AICoach'
import { Lock } from 'lucide-react'

const SPORT_COLORS = {
  swim: 'bg-blue-500', bike: 'bg-orange-500', run: 'bg-emerald-500',
  brick: 'bg-violet-500', gym: 'bg-rose-500',
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
  const weekPlanned = workouts.filter(w => w.status === 'planned' && new Date(w.date + 'T12:00:00') >= thisMonday).length

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

  // Sport breakdown for the week
  const sportTotals = {}
  for (const w of weekDone) {
    if (!sportTotals[w.sport]) sportTotals[w.sport] = { count: 0, min: 0 }
    sportTotals[w.sport].count++
    sportTotals[w.sport].min += w.duration_min || 0
  }
  const totalWeekMin = weekDone.reduce((s, w) => s + (w.duration_min || 0), 0)

  return (
    <div className="space-y-4">
      <RaceCountdown races={races} />

      {/* Stats — single row, plain text, no cards */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm border-b border-slate-100 pb-4">
        <div>
          <span className="text-slate-400">This week</span>{' '}
          <span className="font-semibold">{weekDone.length} done</span>
          {weekPlanned > 0 && <span className="text-slate-400"> / {weekPlanned} planned</span>}
        </div>
        <div>
          <span className="text-slate-400">Hours</span>{' '}
          <span className="font-semibold">{weekHours.toFixed(1)}h</span>
        </div>
        {streak > 0 && (
          <div>
            <span className="text-slate-400">Streak</span>{' '}
            <span className="font-semibold">{streak}d</span>
          </div>
        )}
        <div>
          <span className="text-slate-400">Total logged</span>{' '}
          <span className="font-semibold">{Math.round(totalHours)}h</span>
        </div>
      </div>

      {/* Sport breakdown — inline bar, not cards */}
      {Object.keys(sportTotals).length > 0 && (
        <div>
          <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
            {Object.entries(sportTotals).map(([sport, d]) => (
              <div
                key={sport}
                className={`${SPORT_COLORS[sport] || 'bg-slate-400'}`}
                style={{ width: `${totalWeekMin > 0 ? (d.min / totalWeekMin) * 100 : 0}%` }}
                title={`${sport}: ${d.count} sessions, ${d.min}min`}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            {Object.entries(sportTotals).map(([sport, d]) => (
              <span key={sport} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${SPORT_COLORS[sport] || 'bg-slate-400'}`} />
                {sport} <span className="text-slate-400">{d.count}x · {d.min}min</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <VolumeChart workouts={workouts} />

      {user?.plan === 'pro' ? (
        <AICoach onWorkoutsAdded={onWorkoutsAdded} />
      ) : (
        <div className="border border-dashed border-slate-200 rounded-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-slate-300" />
            <div>
              <p className="text-sm font-medium text-slate-700">StreloIQ</p>
              <p className="text-xs text-slate-400">Auto-generate your training week</p>
            </div>
          </div>
          <button onClick={() => onNavigate('upgrade')}
            className="text-xs font-medium text-slate-600 border border-slate-200 px-3 py-1.5 rounded-md hover:border-slate-300 transition-colors">
            Upgrade
          </button>
        </div>
      )}
    </div>
  )
}
