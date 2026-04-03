import React from 'react'
import { useI18n } from '../i18n/I18nContext'
import RaceCountdown from '../components/RaceCountdown'
import VolumeChart from '../components/VolumeChart'
import AICoach from '../components/AICoach'
import PersonalRecords from '../components/PersonalRecords'
import WeatherWidget from '../components/WeatherWidget'
import { Waves, Bike, Footprints, Dumbbell, Layers, Lock } from 'lucide-react'

const SPORT_META = {
  swim:  { Icon: Waves,      color: 'text-blue-400',    bg: 'bg-blue-500/15 dark:bg-blue-500/25', border: 'border-blue-500/30', glow: 'shadow-blue-500/20', accent: 'border-t-blue-500', label: 'Swim'  },
  bike:  { Icon: Bike,       color: 'text-orange-400',  bg: 'bg-orange-500/15 dark:bg-orange-500/25', border: 'border-orange-500/30', glow: 'shadow-orange-500/20', accent: 'border-t-orange-500', label: 'Bike'  },
  run:   { Icon: Footprints, color: 'text-emerald-400', bg: 'bg-emerald-500/15 dark:bg-emerald-500/25', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20', accent: 'border-t-emerald-500', label: 'Run'   },
  gym:   { Icon: Dumbbell,   color: 'text-rose-400',    bg: 'bg-rose-500/15 dark:bg-rose-500/25', border: 'border-rose-500/30', glow: 'shadow-rose-500/20', accent: 'border-t-rose-500', label: 'Gym'   },
  brick: { Icon: Layers,     color: 'text-violet-400',  bg: 'bg-violet-500/15 dark:bg-violet-500/25', border: 'border-violet-500/30', glow: 'shadow-violet-500/20', accent: 'border-t-violet-500', label: 'Brick' },
}

const STAT_STYLES = [
  { accent: 'border-t-blue-500', valueColor: 'text-blue-400', glowColor: 'dark:shadow-blue-500/10' },
  { accent: 'border-t-orange-500', valueColor: 'text-orange-400', glowColor: 'dark:shadow-orange-500/10' },
  { accent: 'border-t-emerald-500', valueColor: 'text-emerald-400', glowColor: 'dark:shadow-emerald-500/10' },
  { accent: 'border-t-violet-500', valueColor: 'text-violet-400', glowColor: 'dark:shadow-violet-500/10' },
]

function StatCard({ label, sub, value, style, icon }) {
  return (
    <div className={`bg-white dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700/50 border-t-[3px] ${style.accent} p-4 ${style.glowColor} dark:shadow-lg`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
        {icon}
      </div>
      <p className={`text-2xl font-bold mt-1 ${style.valueColor}`}>{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
    </div>
  )
}

function SportBreakdown({ workouts }) {
  const { t } = useI18n()
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
    <div className="bg-white dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-slate-700/50 p-4">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-3">{t('sportBreakdown')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sports.map(sport => {
          const meta = SPORT_META[sport] || SPORT_META.brick
          const d = totals[sport]
          return (
            <div key={sport} className={`rounded-lg p-2.5 border ${meta.bg} ${meta.border} flex items-center gap-2.5 dark:shadow-sm ${meta.glow}`}>
              <meta.Icon size={18} strokeWidth={1.5} className={meta.color} />
              <div>
                <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{d.sessions}x · {Math.round(d.minutes)}min</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
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
    <div className="space-y-3">
      <RaceCountdown races={races} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={t('thisWeek')} sub={t('sessionsDone')} value={weekDone.length}
          style={STAT_STYLES[0]}
          icon={<Waves size={15} strokeWidth={1.5} className="text-blue-400/50" />} />
        <StatCard label={t('thisWeek')} sub={t('trainingHours')} value={`${weekHours.toFixed(1)}h`}
          style={STAT_STYLES[1]}
          icon={<Bike size={15} strokeWidth={1.5} className="text-orange-400/50" />} />
        <StatCard label={t('streak')} sub={t('consecutiveDays')} value={`${streak}d`}
          style={STAT_STYLES[2]}
          icon={<Footprints size={15} strokeWidth={1.5} className="text-emerald-400/50" />} />
        <StatCard label={t('allTime')} sub={t('hoursLogged')} value={`${Math.round(totalHours)}h`}
          style={STAT_STYLES[3]}
          icon={<Layers size={15} strokeWidth={1.5} className="text-violet-400/50" />} />
      </div>

      <SportBreakdown workouts={workouts} />
      <WeatherWidget workouts={workouts} />
      <PersonalRecords workouts={workouts} />

      {user?.plan === 'pro' ? (
        <>
          <VolumeChart workouts={workouts} />
          <AICoach onWorkoutsAdded={onWorkoutsAdded} />
        </>
      ) : (
        <div className="space-y-2">
          <div className="bg-white dark:bg-slate-900/80 rounded-lg border border-dashed border-slate-200 dark:border-slate-700/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-slate-300 dark:text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('weeklyVolumeTrends')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('seeTrainingLoad')}</p>
              </div>
            </div>
            <button onClick={() => onNavigate('upgrade')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-md hover:border-indigo-400 transition-colors">
              Pro
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900/80 rounded-lg border border-dashed border-slate-200 dark:border-slate-700/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-slate-300 dark:text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">StreloIQ</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('autoGenerate')}</p>
              </div>
            </div>
            <button onClick={() => onNavigate('upgrade')}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-md hover:border-indigo-400 transition-colors">
              Pro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
