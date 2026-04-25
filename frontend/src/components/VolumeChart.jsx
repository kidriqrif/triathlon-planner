import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { startOfWeek, format } from 'date-fns'
import useDark from '../utils/useDark'

function getWeekKey(date) {
  const d = new Date(date + 'T12:00:00')
  const mon = startOfWeek(d, { weekStartsOn: 1 })
  return format(mon, 'MMM d')
}

function buildWeeklyData(workouts, weeks) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeks * 7)

  const map = {}
  for (const w of workouts) {
    if (new Date(w.date + 'T12:00:00') < cutoff) continue
    if (w.status === 'skipped') continue
    const key = getWeekKey(w.date)
    if (!map[key]) map[key] = { week: key, swim: 0, bike: 0, run: 0, hours: 0 }
    if (w.distance_km) {
      if (w.sport === 'swim') map[key].swim += w.distance_km
      if (w.sport === 'bike') map[key].bike += w.distance_km
      if (w.sport === 'run') map[key].run += w.distance_km
    }
    if (w.duration_min) map[key].hours += w.duration_min / 60
  }

  return Object.values(map)
    .sort((a, b) => new Date(a.week) - new Date(b.week))
    .map(d => ({
      ...d,
      swim: Math.round(d.swim * 10) / 10,
      bike: Math.round(d.bike * 10) / 10,
      run: Math.round(d.run * 10) / 10,
      hours: Math.round(d.hours * 10) / 10,
    }))
}

export default function VolumeChart({ workouts }) {
  const [range, setRange] = useState(8)
  const [chartType, setChartType] = useState('distance')
  const dark = useDark()

  const data = useMemo(() => buildWeeklyData(workouts, range), [workouts, range])

  const gridColor = dark ? '#334155' : '#f0f0f0'
  const textColor = dark ? '#94a3b8' : '#64748b'
  const tooltipBg = dark ? '#1e293b' : '#fff'
  const tooltipBorder = dark ? '#334155' : '#e2e8f0'

  return (
    <div className="vista-panel rounded-2xl p-4">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-[0.25em]">Weekly volume</p>
          <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">Training load</h2>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg overflow-hidden text-xs bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-orange-200/50 dark:border-orange-900/30 shadow-inner">
            {['distance', 'hours'].map(t => (
              <button key={t}
                onClick={() => setChartType(t)}
                className={`px-3 py-1.5 font-semibold transition-all ${chartType === t
                  ? 'vista-btn rounded-md m-0.5'
                  : 'text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400'}`}>
                {t === 'distance' ? 'km' : 'hrs'}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg overflow-hidden text-xs bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-orange-200/50 dark:border-orange-900/30 shadow-inner">
            {[4, 8, 12].map(w => (
              <button key={w}
                onClick={() => setRange(w)}
                className={`px-3 py-1.5 font-semibold transition-all ${range === w
                  ? 'vista-btn rounded-md m-0.5'
                  : 'text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400'}`}>
                {w}w
              </button>
            ))}
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
          No completed workouts yet — start logging to see your volume here.
        </div>
      ) : chartType === 'distance' ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: textColor }} />
            <YAxis tick={{ fontSize: 12, fill: textColor }} unit=" km" />
            <Tooltip
              formatter={(v, n) => [`${v} km`, n]}
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: textColor }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="swim" name="Swim" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="bike" name="Bike" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="run" name="Run" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: textColor }} />
            <YAxis tick={{ fontSize: 12, fill: textColor }} unit=" h" />
            <Tooltip
              formatter={(v) => [`${v} h`, 'Total hours']}
              contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: textColor }}
            />
            <Line type="monotone" dataKey="hours" name="Hours" stroke="#f43f5e" strokeWidth={2}
              dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
