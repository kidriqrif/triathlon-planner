import React from 'react'
import { differenceInDays } from 'date-fns'
import { Activity, Footprints, Bike, Waves, Medal, Flag, Trophy } from 'lucide-react'

const PHASES = {
  Base:  { color: '#6366f1', bg: 'from-indigo-500 to-violet-600',   badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', desc: 'Foundation — build consistency' },
  Build: { color: '#f59e0b', bg: 'from-amber-400 to-orange-500',    badge: 'bg-amber-100 text-amber-700 border-amber-200',   desc: 'Build — raise fitness & speed' },
  Peak:  { color: '#f97316', bg: 'from-orange-400 to-red-500',      badge: 'bg-orange-100 text-orange-700 border-orange-200', desc: 'Peak — sharpen for race day' },
  Taper: { color: '#22c55e', bg: 'from-green-400 to-emerald-500',   badge: 'bg-green-100 text-green-700 border-green-200',   desc: 'Taper — rest up, you\'re ready' },
}

function getPhase(days) {
  if (days > 84) return 'Base'
  if (days > 56) return 'Build'
  if (days > 28) return 'Peak'
  return 'Taper'
}

// Ring shows overall plan progress (0 → race day = full ring)
function Ring({ daysToRace, phase }) {
  const totalPlanDays = 16 * 7 // 16-week plan
  const elapsed = totalPlanDays - daysToRace
  const progress = Math.min(1, Math.max(0, elapsed / totalPlanDays))
  const size = 110
  const stroke = 9
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - progress)
  const { color } = PHASES[phase]

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.85)"
          strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{Math.max(0, daysToRace)}</span>
        <span className="text-[10px] text-white/60 uppercase tracking-widest mt-0.5">days</span>
      </div>
    </div>
  )
}

const CATEGORY_ICONS = {
  triathlon: Activity,
  running:   Footprints,
  cycling:   Bike,
  swimming:  Waves,
  other:     Medal,
}

function getCategoryFromDistance(distance) {
  if (!distance) return 'triathlon'
  if (distance.includes(':')) return distance.split(':')[0]
  return 'triathlon'
}

export default function RaceCountdown({ races }) {
  const activeRace = races.find(r => r.is_active)

  if (!activeRace) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Flag size={22} strokeWidth={1.5} className="text-slate-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-600">No goal race set</p>
          <p className="text-slate-400 text-sm mt-0.5">Add a race in the Races tab to unlock your countdown</p>
        </div>
      </div>
    )
  }

  const today = new Date(); today.setHours(12, 0, 0, 0)
  const raceDate = new Date(activeRace.date + 'T12:00:00')
  const daysToRace = differenceInDays(raceDate, today)
  const phase = getPhase(daysToRace)
  const phaseConfig = PHASES[phase]
  const category = getCategoryFromDistance(activeRace.distance)
  const CategoryIcon = CATEGORY_ICONS[category] || Flag

  if (daysToRace < 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 flex items-center gap-4">
        <Trophy size={36} strokeWidth={1.5} className="text-white/90 shrink-0" />
        <div>
          <p className="font-black text-white text-xl">{activeRace.name}</p>
          <p className="text-white/70 text-sm">{Math.abs(daysToRace)} days ago — you did it!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br ${phaseConfig.bg} rounded-2xl shadow-lg p-6`}>
      <div className="flex items-center gap-5">
        <Ring daysToRace={daysToRace} phase={phase} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${phaseConfig.badge}`}>
              {phase} Phase
            </span>
          </div>
          <p className="text-white font-black text-xl leading-tight mt-2 truncate">{activeRace.name}</p>
          <div className="flex items-center gap-1.5 text-white/70 text-sm mt-0.5">
            <CategoryIcon size={13} strokeWidth={1.5} />
            <span>{activeRace.date}</span>
          </div>
          <p className="text-white/60 text-xs mt-2 italic">{phaseConfig.desc}</p>
        </div>
      </div>
    </div>
  )
}
