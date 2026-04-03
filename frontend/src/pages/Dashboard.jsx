import React, { useMemo } from 'react'
import { useI18n } from '../i18n/I18nContext'
import RaceCountdown from '../components/RaceCountdown'
import VolumeChart from '../components/VolumeChart'
import AICoach from '../components/AICoach'
import PersonalRecords from '../components/PersonalRecords'
import WeatherWidget from '../components/WeatherWidget'
import { Waves, Bike, Footprints, Dumbbell, Layers, Lock } from 'lucide-react'
import { startOfWeek, format, addDays } from 'date-fns'

const SPORT_META = {
  swim:  { Icon: Waves,      color: 'text-blue-400',    bg: 'bg-blue-500/15 dark:bg-blue-500/25', border: 'border-blue-500/30', label: 'Swim'  },
  bike:  { Icon: Bike,       color: 'text-orange-400',  bg: 'bg-orange-500/15 dark:bg-orange-500/25', border: 'border-orange-500/30', label: 'Bike'  },
  run:   { Icon: Footprints, color: 'text-emerald-400', bg: 'bg-emerald-500/15 dark:bg-emerald-500/25', border: 'border-emerald-500/30', label: 'Run'   },
  gym:   { Icon: Dumbbell,   color: 'text-rose-400',    bg: 'bg-rose-500/15 dark:bg-rose-500/25', border: 'border-rose-500/30', label: 'Gym'   },
  brick: { Icon: Layers,     color: 'text-violet-400',  bg: 'bg-violet-500/15 dark:bg-violet-500/25', border: 'border-violet-500/30', label: 'Brick' },
}

const SPORT_COLORS_HEX = { swim: '#3b82f6', bike: '#f97316', run: '#22c55e', brick: '#a855f7', gym: '#f43f5e' }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function StatCard({ headerBg, headerText, value, unit }) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700/50 dark:border-slate-700/30">
      <div className={`${headerBg} px-3 py-1.5 text-center`}>
        <p className="text-xs font-semibold text-white">{headerText}</p>
      </div>
      <div className="bg-slate-800/80 dark:bg-slate-900/80 px-3 py-4 text-center">
        <p className="text-2xl sm:text-3xl font-bold text-white">{value}<span className="text-sm font-normal text-slate-400 ml-1">{unit}</span></p>
      </div>
    </div>
  )
}

// Mini bar chart per sport (like the image's "Performance Overview")
function MiniChart({ data, color, label }) {
  const max = Math.max(...data.map(d => d.val), 1)
  return (
    <div className="flex-1">
      <div className="flex items-end gap-1 h-24 px-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full rounded-sm" style={{ height: `${(d.val / max) * 100}%`, backgroundColor: color, minHeight: d.val > 0 ? 4 : 0 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-1 px-1 mt-1">
        {data.map((d, i) => (
          <p key={i} className="flex-1 text-center text-[9px] text-slate-500">{d.day}</p>
        ))}
      </div>
    </div>
  )
}

function WeeklySchedule({ workouts }) {
  const thisMonday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDates = DAYS.map((_, i) => format(addDays(thisMonday, i), 'yyyy-MM-dd'))

  const weekWorkouts = DAYS.map((day, i) => ({
    day,
    workouts: workouts.filter(w => w.date === weekDates[i])
  }))

  return (
    <div className="bg-slate-800/60 dark:bg-slate-900/80 rounded-lg border border-slate-700/30 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-700/30">
        <p className="text-sm font-semibold text-white">Weekly Schedule</p>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-700/30">
        {DAYS.map(d => (
          <div key={d} className="text-center py-2 text-xs font-medium text-slate-400 border-r border-slate-700/20 last:border-r-0">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 min-h-[80px]">
        {weekWorkouts.map(({ day, workouts: wks }) => (
          <div key={day} className="border-r border-slate-700/20 last:border-r-0 p-1 space-y-1">
            {wks.length === 0 ? (
              <div className="h-full" />
            ) : (
              wks.map(w => {
                const bgColor = SPORT_COLORS_HEX[w.sport] || '#6b7280'
                const meta = SPORT_META[w.sport] || SPORT_META.run
                return (
                  <div key={w.id} className="rounded px-1.5 py-1 text-[10px] font-medium text-white truncate" style={{ backgroundColor: bgColor }}>
                    {meta.label} {w.duration_min ? `${w.duration_min}m` : ''}
                  </div>
                )
              })
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ races, workouts, onWorkoutsAdded, user, onNavigate }) {
  const { t } = useI18n()
  const completed = workouts.filter(w => w.status === 'completed')

  const totalHours = completed.filter(w => w.duration_min).reduce((s, w) => s + w.duration_min, 0) / 60
  const totalDist = completed.filter(w => w.distance_km).reduce((s, w) => s + w.distance_km, 0)

  const thisMonday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDone = completed.filter(w => new Date(w.date + 'T12:00:00') >= thisMonday)
  const weekHours = weekDone.reduce((s, w) => s + (w.duration_min || 0), 0) / 60

  const streak = (() => {
    const days = new Set(completed.map(w => w.date))
    let count = 0, d = new Date()
    d.setHours(12, 0, 0, 0)
    while (days.has(d.toISOString().split('T')[0])) { count++; d.setDate(d.getDate() - 1) }
    return count
  })()

  // Per-sport daily data for mini charts
  const chartData = useMemo(() => {
    const result = { swim: [], bike: [], run: [] }
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(thisMonday, i), 'yyyy-MM-dd')
      const day = DAYS[i].substring(0, 3)
      for (const sport of ['swim', 'bike', 'run']) {
        const mins = workouts
          .filter(w => w.date === date && w.sport === sport && w.status === 'completed')
          .reduce((s, w) => s + (w.duration_min || 0), 0)
        result[sport].push({ day, val: mins })
      }
    }
    return result
  }, [workouts, thisMonday])

  const hasChartData = Object.values(chartData).some(arr => arr.some(d => d.val > 0))

  return (
    <div className="space-y-4">
      <RaceCountdown races={races} />

      {/* Title */}
      <h2 className="text-lg font-bold text-slate-800 dark:text-white text-center dark:block hidden">Training Analytics</h2>

      {/* Stat cards — colored headers like the image */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard headerBg="bg-blue-600" headerText={t('thisWeek') + ' Sessions'} value={weekDone.length} unit="" />
        <StatCard headerBg="bg-orange-600" headerText="Total Hours" value={weekHours > 0 ? `${Math.floor(weekHours)}h ${Math.round((weekHours % 1) * 60)}m` : '0h'} unit="" />
        <StatCard headerBg="bg-emerald-600" headerText="Distance" value={Math.round(totalDist).toLocaleString()} unit="km" />
        <StatCard headerBg="bg-slate-600" headerText={t('streak')} value={streak} unit="days" />
      </div>

      {/* Performance Overview — 3 mini charts */}
      {hasChartData && (
        <div className="bg-slate-800/60 dark:bg-slate-900/80 rounded-lg border border-slate-700/30 p-4">
          <p className="text-sm font-semibold text-white dark:text-white text-slate-800 mb-3">Performance Overview</p>
          <div className="flex gap-3">
            <MiniChart data={chartData.swim} color="#3b82f6" label="Swim" />
            <MiniChart data={chartData.bike} color="#f97316" label="Bike" />
            <MiniChart data={chartData.run} color="#22c55e" label="Run" />
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Swim</span>
            <span className="flex items-center gap-1.5 text-xs text-orange-400"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500" /> Bike</span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Run</span>
          </div>
        </div>
      )}

      {/* Weekly Schedule grid */}
      <WeeklySchedule workouts={workouts} />

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
            <button onClick={() => onNavigate('upgrade')} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-md hover:border-indigo-400 transition-colors">Pro</button>
          </div>
          <div className="bg-white dark:bg-slate-900/80 rounded-lg border border-dashed border-slate-200 dark:border-slate-700/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-slate-300 dark:text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">StreloIQ</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('autoGenerate')}</p>
              </div>
            </div>
            <button onClick={() => onNavigate('upgrade')} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-md hover:border-indigo-400 transition-colors">Pro</button>
          </div>
        </div>
      )}
    </div>
  )
}
