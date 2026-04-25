import React, { useMemo } from 'react'
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceLine, Bar,
} from 'recharts'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { loadSeries, tsbState, rampRate } from '../utils/load'

const TONE = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  zinc:    'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  orange:  'bg-orange-500/10 text-orange-400 border-orange-500/30',
  red:     'bg-red-500/10 text-red-400 border-red-500/30',
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg bg-zinc-900/95 backdrop-blur-md border border-white/10 px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-zinc-300 font-bold mb-1">{d.label}</p>
      <p className="text-zinc-400">TSS <span className="text-white">{d.tss}</span></p>
      <p className="text-zinc-400">Fitness <span className="text-orange-400">{d.ctl}</span></p>
      <p className="text-zinc-400">Fatigue <span className="text-red-400">{d.atl}</span></p>
      <p className="text-zinc-400">Form <span className={d.tsb >= 0 ? 'text-emerald-400' : 'text-orange-400'}>{d.tsb >= 0 ? '+' : ''}{d.tsb}</span></p>
    </div>
  )
}

export default function LoadChart({ workouts }) {
  const series = useMemo(() => loadSeries(workouts, 84), [workouts])
  const last = series[series.length - 1] || { ctl: 0, atl: 0, tsb: 0 }
  const ramp = useMemo(() => rampRate(series), [series])
  const state = tsbState(last.tsb)
  const RampIcon = ramp > 5 ? TrendingUp : ramp < -5 ? TrendingDown : Minus
  const rampTone = ramp > 5 ? 'text-orange-400' : ramp < -5 ? 'text-emerald-400' : 'text-zinc-400'

  return (
    <section className="panel p-6 lg:p-7 relative overflow-hidden">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-medium text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity size={16} className="text-zinc-500 dark:text-zinc-400" />
            Performance load
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
            CTL · ATL · TSB · 84-day window
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/30">
            <p className="text-[10px] font-mono text-orange-400 uppercase tracking-wider">Fitness</p>
            <p className="font-display text-lg font-bold text-orange-400 leading-none mt-0.5 tabular-nums">{last.ctl.toFixed(0)}</p>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/30">
            <p className="text-[10px] font-mono text-red-400 uppercase tracking-wider">Fatigue</p>
            <p className="font-display text-lg font-bold text-red-400 leading-none mt-0.5 tabular-nums">{last.atl.toFixed(0)}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-md border ${TONE[state.tone]}`}>
            <p className="text-[10px] font-mono uppercase tracking-wider">Form · {state.label}</p>
            <p className="font-display text-lg font-bold leading-none mt-0.5 tabular-nums">{last.tsb >= 0 ? '+' : ''}{last.tsb.toFixed(0)}</p>
          </div>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer>
          <ComposedChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ctl-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7a00" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ff7a00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              stroke="rgba(161,161,170,0.5)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(series.length / 6)}
            />
            <YAxis stroke="rgba(161,161,170,0.5)" fontSize={10} tickLine={false} axisLine={false} width={32} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
            <Bar dataKey="tss" fill="rgba(255,255,255,0.08)" radius={[2, 2, 0, 0]} />
            <Area type="monotone" dataKey="ctl" stroke="#ff7a00" strokeWidth={2} fill="url(#ctl-fill)" dot={false} />
            <Line type="monotone" dataKey="atl" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-200/50 dark:border-white/5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-orange-500" /> Fitness (42d)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500" style={{ borderTop: '1px dashed' }} /> Fatigue (7d)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-white/10" /> Daily TSS</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-mono ${rampTone}`}>
          <RampIcon size={13} />
          Ramp <span className="text-white font-semibold tabular-nums">{ramp > 0 ? '+' : ''}{ramp}</span> TSS / wk
        </div>
      </div>
    </section>
  )
}
