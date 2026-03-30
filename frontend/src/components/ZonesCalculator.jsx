import React, { useState, useEffect } from 'react'
import { Heart, Zap } from 'lucide-react'

const HR_ZONES = [
  { zone: 1, label: 'Recovery',  lowPct: 50, highPct: 60, color: 'bg-blue-500',   text: 'text-blue-700 dark:text-blue-300',   bg: 'bg-blue-100 dark:bg-blue-950' },
  { zone: 2, label: 'Endurance', lowPct: 60, highPct: 70, color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950' },
  { zone: 3, label: 'Tempo',     lowPct: 70, highPct: 80, color: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-950' },
  { zone: 4, label: 'Threshold', lowPct: 80, highPct: 90, color: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-950' },
  { zone: 5, label: 'VO2max',    lowPct: 90, highPct: 100, color: 'bg-red-600',   text: 'text-red-700 dark:text-red-300',     bg: 'bg-red-100 dark:bg-red-950' },
]

const POWER_ZONES = [
  { zone: 1, label: 'Active Recovery', lowPct: 0,   highPct: 55,  color: 'bg-slate-500',  text: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  { zone: 2, label: 'Endurance',       lowPct: 56,  highPct: 75,  color: 'bg-blue-500',   text: 'text-blue-700 dark:text-blue-300',   bg: 'bg-blue-100 dark:bg-blue-950' },
  { zone: 3, label: 'Tempo',           lowPct: 76,  highPct: 90,  color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950' },
  { zone: 4, label: 'Threshold',       lowPct: 91,  highPct: 105, color: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-950' },
  { zone: 5, label: 'VO2max',          lowPct: 106, highPct: 120, color: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-950' },
  { zone: 6, label: 'Anaerobic',       lowPct: 121, highPct: 150, color: 'bg-red-600',    text: 'text-red-700 dark:text-red-300',     bg: 'bg-red-100 dark:bg-red-950' },
  { zone: 7, label: 'Sprint',          lowPct: 150, highPct: null, color: 'bg-purple-600', text: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-950' },
]

function computeHRZones(maxHR) {
  return HR_ZONES.map((z) => ({
    ...z,
    low: Math.round(maxHR * z.lowPct / 100),
    high: Math.round(maxHR * z.highPct / 100),
    rangeLabel: `${Math.round(maxHR * z.lowPct / 100)} – ${Math.round(maxHR * z.highPct / 100)} bpm`,
  }))
}

function computePowerZones(ftp) {
  return POWER_ZONES.map((z) => {
    const low = z.lowPct > 0 ? Math.round(ftp * z.lowPct / 100) : 0
    const high = z.highPct !== null ? Math.round(ftp * z.highPct / 100) : null
    let rangeLabel
    if (z.lowPct === 0) {
      rangeLabel = `< ${Math.round(ftp * z.highPct / 100)}W`
    } else if (z.highPct === null) {
      rangeLabel = `> ${low}W`
    } else {
      rangeLabel = `${low} – ${high}W`
    }
    return { ...z, low, high, rangeLabel }
  })
}

function ZoneBar({ zone, maxWidth }) {
  // Width proportional to zone percentage range, capped for readability
  const span = zone.highPct !== null
    ? (zone.highPct - zone.lowPct)
    : 30 // Sprint has no upper bound; give it a visual width
  const widthPct = Math.max(20, Math.min(100, (span / maxWidth) * 100))

  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2 ${zone.bg}`}>
      <div className="w-6 text-center">
        <span className={`text-xs font-bold ${zone.text}`}>Z{zone.zone}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-semibold ${zone.text}`}>{zone.label}</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{zone.rangeLabel}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full ${zone.color} transition-all duration-500`}
            style={{ width: `${widthPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function ZonesCalculator() {
  const [tab, setTab] = useState('hr')
  const [maxHR, setMaxHR] = useState(() => {
    const saved = localStorage.getItem('strelo_maxHR')
    return saved ? Number(saved) : ''
  })
  const [ftp, setFTP] = useState(() => {
    const saved = localStorage.getItem('strelo_ftp')
    return saved ? Number(saved) : ''
  })

  // Persist to localStorage
  useEffect(() => {
    if (maxHR !== '' && maxHR > 0) localStorage.setItem('strelo_maxHR', maxHR)
  }, [maxHR])

  useEffect(() => {
    if (ftp !== '' && ftp > 0) localStorage.setItem('strelo_ftp', ftp)
  }, [ftp])

  const hrZones = maxHR > 0 ? computeHRZones(Number(maxHR)) : null
  const powerZones = ftp > 0 ? computePowerZones(Number(ftp)) : null

  const inputCls = 'w-24 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
          <Heart size={16} strokeWidth={1.5} className="text-rose-600 dark:text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Training Zones</h2>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-sm mb-5">
        <button
          onClick={() => setTab('hr')}
          className={`flex-1 px-4 py-2 font-medium transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'hr'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Heart size={14} strokeWidth={1.5} />
          Heart Rate Zones
        </button>
        <button
          onClick={() => setTab('power')}
          className={`flex-1 px-4 py-2 font-medium transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'power'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Zap size={14} strokeWidth={1.5} />
          Power Zones
        </button>
      </div>

      {/* HR Zones tab */}
      {tab === 'hr' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Max HR</label>
            <input
              type="number"
              min="100"
              max="230"
              value={maxHR}
              onChange={(e) => setMaxHR(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="190"
              className={inputCls}
            />
            <span className="text-xs text-slate-400">bpm</span>
          </div>
          {hrZones ? (
            <div className="space-y-1.5">
              {hrZones.map((z) => (
                <ZoneBar key={z.zone} zone={z} maxWidth={50} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Enter your max heart rate to see zones
            </div>
          )}
        </div>
      )}

      {/* Power Zones tab */}
      {tab === 'power' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">FTP</label>
            <input
              type="number"
              min="50"
              max="500"
              value={ftp}
              onChange={(e) => setFTP(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="250"
              className={inputCls}
            />
            <span className="text-xs text-slate-400">watts</span>
          </div>
          {powerZones ? (
            <div className="space-y-1.5">
              {powerZones.map((z) => (
                <ZoneBar key={z.zone} zone={z} maxWidth={55} />
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Enter your FTP to see power zones
            </div>
          )}
        </div>
      )}
    </div>
  )
}
