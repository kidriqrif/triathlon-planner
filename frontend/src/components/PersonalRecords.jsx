import React, { useMemo } from 'react'
import { Trophy, Zap } from 'lucide-react'

const SPORT_LABELS = { swim: 'Swim', bike: 'Bike', run: 'Run' }

const SPORT_BADGE_COLORS = {
  swim: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  bike: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
  run:  'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
}

function formatPace(kmPerMin) {
  // kmPerMin = distance_km / duration_min  →  pace = 1/kmPerMin  min/km
  const paceMinPerKm = 1 / kmPerMin
  const mins = Math.floor(paceMinPerKm)
  const secs = Math.round((paceMinPerKm - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}/km`
}

function formatDistance(km) {
  if (km >= 1) return `${Math.round(km * 10) / 10}km`
  return `${Math.round(km * 1000)}m`
}

function formatDuration(min) {
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = Math.round(min % 60)
    return m > 0 ? `${h}h${m}min` : `${h}h`
  }
  return `${Math.round(min)}min`
}

function computePRs(workouts) {
  const completed = workouts.filter(
    (w) => w.status === 'completed' && w.distance_km > 0 && w.duration_min > 0
  )

  if (completed.length === 0) return null

  const prsBySport = {}

  for (const w of completed) {
    const sport = w.sport
    if (!SPORT_LABELS[sport]) continue

    if (!prsBySport[sport]) {
      prsBySport[sport] = {
        fastestPace: null,   // highest km/min ratio = fastest
        longestDistance: null,
        longestDuration: null,
      }
    }

    const pace = w.distance_km / w.duration_min

    if (!prsBySport[sport].fastestPace || pace > prsBySport[sport].fastestPace.value) {
      prsBySport[sport].fastestPace = { value: pace, date: w.date }
    }
    if (!prsBySport[sport].longestDistance || w.distance_km > prsBySport[sport].longestDistance.value) {
      prsBySport[sport].longestDistance = { value: w.distance_km, date: w.date }
    }
    if (!prsBySport[sport].longestDuration || w.duration_min > prsBySport[sport].longestDuration.value) {
      prsBySport[sport].longestDuration = { value: w.duration_min, date: w.date }
    }
  }

  if (Object.keys(prsBySport).length === 0) return null

  // Flatten into badge list
  const badges = []
  for (const sport of ['swim', 'bike', 'run']) {
    const prs = prsBySport[sport]
    if (!prs) continue

    if (prs.fastestPace) {
      badges.push({
        sport,
        icon: 'zap',
        label: `Fastest ${SPORT_LABELS[sport]}`,
        value: formatPace(prs.fastestPace.value),
        date: prs.fastestPace.date,
      })
    }
    if (prs.longestDistance) {
      badges.push({
        sport,
        icon: 'trophy',
        label: `Longest ${SPORT_LABELS[sport]}`,
        value: formatDistance(prs.longestDistance.value),
        date: prs.longestDistance.date,
      })
    }
    if (prs.longestDuration) {
      badges.push({
        sport,
        icon: 'trophy',
        label: `Longest ${SPORT_LABELS[sport]}`,
        value: formatDuration(prs.longestDuration.value),
        date: prs.longestDuration.date,
      })
    }
  }

  return badges
}

export default function PersonalRecords({ workouts }) {
  const badges = useMemo(() => computePRs(workouts || []), [workouts])

  if (!badges || badges.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
          <Trophy size={16} strokeWidth={1.5} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Personal Records</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge, i) => {
          const IconComp = badge.icon === 'zap' ? Zap : Trophy
          const colors = SPORT_BADGE_COLORS[badge.sport] || SPORT_BADGE_COLORS.run

          return (
            <div
              key={`${badge.label}-${badge.value}-${i}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium ${colors}`}
              title={badge.date ? `Set on ${badge.date}` : undefined}
            >
              <IconComp size={13} strokeWidth={1.5} />
              <span className="font-semibold">{badge.label}:</span>
              <span>{badge.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
