import React from 'react'
import { useI18n } from '../i18n/I18nContext'
import RaceCountdown from '../components/RaceCountdown'
import VolumeChart from '../components/VolumeChart'
import AICoach from '../components/AICoach'
import PersonalRecords from '../components/PersonalRecords'
import WeatherWidget from '../components/WeatherWidget'
import { Lock } from 'lucide-react'

const SPORT_COLORS = {
  swim: { bar: 'bg-blue-500', dot: 'bg-blue-500', label: 'Swim' },
  bike: { bar: 'bg-orange-500', dot: 'bg-orange-500', label: 'Bike' },
  run:  { bar: 'bg-emerald-500', dot: 'bg-emerald-500', label: 'Run' },
  brick: { bar: 'bg-violet-500', dot: 'bg-violet-500', label: 'Brick' },
  gym:  { bar: 'bg-rose-500', dot: 'bg-rose-500', label: 'Gym' },
}

export default function Dashboard({ races, workouts, onWorkoutsAdded, user, onNavigate }) {
  const { t } = useI18n()
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

  // Sport breakdown
  const sportTotals = {}
  for (const w of weekDone) {
    if (!sportTotals[w.sport]) sportTotals[w.sport] = { count: 0, min: 0 }
    sportTotals[w.sport].count++
    sportTotals[w.sport].min += w.duration_min || 0
  }
  const totalWeekMin = weekDone.reduce((s, w) => s + (w.duration_min || 0), 0)

  return (
    <div>
      <RaceCountdown races={races} />

      {/* Stats strip — not cards, just numbers */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 py-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{weekDone.length}<span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">/ {weekPlanned + weekDone.length}</span></p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('thisWeek')} — {t('sessionsDone')}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-500">{weekHours.toFixed(1)}<span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">hrs</span></p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('trainingHours')}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-500">{streak}<span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">d</span></p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('streak')}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{Math.round(totalHours)}<span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">hrs</span></p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('allTime')}</p>
        </div>
      </div>

      {/* Sport bar — proportional, not cards */}
      {Object.keys(sportTotals).length > 0 && (
        <div className="py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex h-2 rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-800">
            {Object.entries(sportTotals).map(([sport, d]) => (
              <div
                key={sport}
                className={SPORT_COLORS[sport]?.bar || 'bg-slate-400'}
                style={{ width: `${totalWeekMin > 0 ? (d.min / totalWeekMin) * 100 : 0}%` }}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-1.5">
            {Object.entries(sportTotals).map(([sport, d]) => (
              <span key={sport} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${SPORT_COLORS[sport]?.dot || 'bg-slate-400'}`} />
                {SPORT_COLORS[sport]?.label || sport} {d.count}× · {d.min}min
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weather + PRs side by side on desktop */}
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <WeatherWidget workouts={workouts} />
        <PersonalRecords workouts={workouts} />
      </div>

      {/* Pro content or locks */}
      <div className="mt-3">
        {user?.plan === 'pro' ? (
          <div className="space-y-3">
            <VolumeChart workouts={workouts} />
            <AICoach onWorkoutsAdded={onWorkoutsAdded} />
          </div>
        ) : (
          <div className="py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock size={13} className="text-slate-300 dark:text-slate-600" />
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('weeklyVolumeTrends')}</span>
              </div>
              <button onClick={() => onNavigate('upgrade')} className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">Pro</button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock size={13} className="text-slate-300 dark:text-slate-600" />
                <span className="text-sm text-slate-500 dark:text-slate-400">StreloIQ</span>
              </div>
              <button onClick={() => onNavigate('upgrade')} className="text-xs text-indigo-500 hover:text-indigo-400 font-medium">Pro</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
