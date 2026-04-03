import React, { useMemo } from 'react'
import { useI18n } from '../i18n/I18nContext'
import RaceCountdown from '../components/RaceCountdown'
import VolumeChart from '../components/VolumeChart'
import AICoach from '../components/AICoach'
import PersonalRecords from '../components/PersonalRecords'
import WeatherWidget from '../components/WeatherWidget'
import { Lock } from 'lucide-react'
import { startOfWeek, format, addDays } from 'date-fns'

const SPORT_COLORS_HEX = { swim: '#3b82f6', bike: '#f97316', run: '#22c55e', brick: '#a855f7', gym: '#f43f5e' }
const SPORT_LABELS = { swim: 'Swim', bike: 'Bike', run: 'Run', brick: 'Brick', gym: 'Gym' }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

  // Per-sport daily data for charts
  const chartData = useMemo(() => {
    const result = { swim: [], bike: [], run: [] }
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(thisMonday, i), 'yyyy-MM-dd')
      const day = DAYS[i]
      for (const sport of ['swim', 'bike', 'run']) {
        const mins = workouts.filter(w => w.date === date && w.sport === sport && w.status === 'completed')
          .reduce((s, w) => s + (w.duration_min || 0), 0)
        result[sport].push({ day, val: mins })
      }
    }
    return result
  }, [workouts, thisMonday])

  const hasChartData = Object.values(chartData).some(arr => arr.some(d => d.val > 0))

  // Weekly schedule
  const weekDates = DAYS.map((_, i) => format(addDays(thisMonday, i), 'yyyy-MM-dd'))
  const weekSchedule = DAYS.map((day, i) => ({
    day, workouts: workouts.filter(w => w.date === weekDates[i])
  }))

  return (
    <div className="space-y-3">
      <RaceCountdown races={races} />

      {/* Main analytics panel — flat, not separate cards */}
      <div className="bg-white dark:bg-[#151d2e] rounded border border-slate-200 dark:border-[#1e293b] overflow-hidden">

        {/* Title */}
        <div className="py-3 text-center border-b border-slate-200 dark:border-[#1e293b]">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Training Analytics</h2>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] bg-slate-200 dark:bg-[#1e293b] border-b border-slate-200 dark:border-[#1e293b]">
          {[
            { bg: 'bg-blue-600', label: 'Total Sessions', value: weekDone.length, unit: '' },
            { bg: 'bg-orange-500', label: 'Total Hours', value: weekHours > 0 ? `${Math.floor(weekHours)}h ${Math.round((weekHours % 1) * 60)}m` : '0h', unit: '' },
            { bg: 'bg-emerald-600', label: 'Distance', value: Math.round(totalDist).toLocaleString(), unit: 'km' },
            { bg: 'bg-slate-500', label: 'Streak', value: streak, unit: 'days' },
          ].map(({ bg, label, value, unit }, i) => (
            <div key={i} className="bg-white dark:bg-[#151d2e]">
              <div className={`${bg} py-1.5 text-center`}>
                <p className="text-[11px] font-semibold text-white">{label}</p>
              </div>
              <div className="py-4 text-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
                {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Overview */}
        {hasChartData && (
          <div className="border-b border-slate-200 dark:border-[#1e293b] p-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Performance Overview</p>
            <div className="flex gap-2">
              {['swim', 'bike', 'run'].map(sport => {
                const data = chartData[sport]
                const max = Math.max(...data.map(d => d.val), 1)
                return (
                  <div key={sport} className="flex-1 bg-slate-50 dark:bg-[#0d1320] rounded p-2">
                    <div className="flex items-end gap-[3px] h-20">
                      {data.map((d, i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{
                          height: `${Math.max((d.val / max) * 100, d.val > 0 ? 8 : 0)}%`,
                          backgroundColor: SPORT_COLORS_HEX[sport],
                        }} />
                      ))}
                    </div>
                    <div className="flex gap-[3px] mt-1">
                      {data.map((d, i) => (
                        <p key={i} className="flex-1 text-center text-[8px] text-slate-400">{d.day}</p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-center gap-5 mt-3">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"><span className="w-2 h-2 bg-blue-500" /> Swim</span>
              <span className="flex items-center gap-1.5 text-[11px] text-orange-400"><span className="w-2 h-2 bg-orange-500" /> Bike</span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400"><span className="w-2 h-2 bg-emerald-500" /> Run</span>
            </div>
          </div>
        )}

        {/* Weekly Schedule */}
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-2">Weekly Schedule</p>
          <div className="border border-slate-200 dark:border-[#1e293b] rounded overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-50 dark:bg-[#0d1320]">
              {DAYS.map(d => (
                <div key={d} className="text-center py-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-[#1e293b] last:border-r-0">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 min-h-[70px] bg-white dark:bg-[#111827]">
              {weekSchedule.map(({ day, workouts: wks }) => (
                <div key={day} className="border-r border-slate-200 dark:border-[#1e293b] last:border-r-0 p-1 space-y-0.5">
                  {wks.map(w => (
                    <div key={w.id} className="rounded-sm px-1 py-0.5 text-[9px] font-medium text-white truncate" style={{ backgroundColor: SPORT_COLORS_HEX[w.sport] || '#6b7280' }}>
                      {SPORT_LABELS[w.sport] || w.sport} {w.duration_min ? `${w.duration_min}m` : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <WeatherWidget workouts={workouts} />
      <PersonalRecords workouts={workouts} />

      {user?.plan === 'pro' ? (
        <>
          <VolumeChart workouts={workouts} />
          <AICoach onWorkoutsAdded={onWorkoutsAdded} />
        </>
      ) : (
        <div className="space-y-2">
          <div className="bg-white dark:bg-[#151d2e] rounded border border-slate-200 dark:border-[#1e293b] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-slate-300 dark:text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('weeklyVolumeTrends')}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('seeTrainingLoad')}</p>
              </div>
            </div>
            <button onClick={() => onNavigate('upgrade')} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded hover:border-indigo-400 transition-colors">Pro</button>
          </div>
          <div className="bg-white dark:bg-[#151d2e] rounded border border-slate-200 dark:border-[#1e293b] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-slate-300 dark:text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">StreloIQ</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('autoGenerate')}</p>
              </div>
            </div>
            <button onClick={() => onNavigate('upgrade')} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded hover:border-indigo-400 transition-colors">Pro</button>
          </div>
        </div>
      )}
    </div>
  )
}
