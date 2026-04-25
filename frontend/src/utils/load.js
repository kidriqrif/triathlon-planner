// Training load math.
//
// Without per-workout HR or power data we estimate Training Stress Score (eTSS)
// from duration and workout type. The intensity factor (IF) is a per-type
// heuristic; eTSS = (duration_h) * IF^2 * 100, the standard form.
//
// Daily series:
//   CTL (chronic load, "fitness") — 42-day exponentially weighted average.
//   ATL (acute load, "fatigue")   —  7-day exponentially weighted average.
//   TSB (form)                    — CTL − ATL.
//
// Recursion:
//   X_today = X_yesterday + (TSS_today − X_yesterday) / N

import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns'

const TYPE_IF = {
  recovery: 0.55,
  easy:     0.65,
  long:     0.70,
  tempo:    0.85,
  interval: 0.95,
}

const SPORT_BIAS = {
  swim:  1.00,
  bike:  1.00,
  run:   1.05,   // running is more impactful per minute
  brick: 1.10,
  gym:   0.55,
}

export function workoutTSS(w) {
  if (!w || !w.duration_min || w.status !== 'completed') return 0
  const if_ = TYPE_IF[w.workout_type] ?? 0.65
  const bias = SPORT_BIAS[w.sport] ?? 1.0
  const hours = w.duration_min / 60
  return Math.round(hours * if_ * if_ * 100 * bias)
}

export function dailyTSS(workouts) {
  // Map of yyyy-MM-dd → tss total
  const map = new Map()
  for (const w of workouts) {
    if (!w.date) continue
    const t = workoutTSS(w)
    if (t === 0) continue
    map.set(w.date, (map.get(w.date) || 0) + t)
  }
  return map
}

export function loadSeries(workouts, days = 84) {
  const today = new Date(); today.setHours(12, 0, 0, 0)
  const start = subDays(today, days - 1)
  const dailyMap = dailyTSS(workouts)
  const range = eachDayOfInterval({ start, end: today })

  let ctl = 0, atl = 0
  const out = []
  for (const d of range) {
    const key = format(d, 'yyyy-MM-dd')
    const tss = dailyMap.get(key) || 0
    ctl = ctl + (tss - ctl) / 42
    atl = atl + (tss - atl) / 7
    out.push({
      date: key,
      label: format(d, 'd MMM'),
      tss,
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round((ctl - atl) * 10) / 10,
    })
  }
  return out
}

export function tsbState(tsb) {
  // PMC convention: TSB > +5 = fresh, -10..+5 = neutral, < -10 = fatigued, < -30 = burnout
  if (tsb > 5)   return { label: 'Fresh',      tone: 'emerald' }
  if (tsb > -10) return { label: 'Neutral',    tone: 'zinc'    }
  if (tsb > -30) return { label: 'Fatigued',   tone: 'orange'  }
  return            { label: 'Overreaching', tone: 'red'     }
}

export function rampRate(series, days = 7) {
  // Weekly TSS ramp rate — average TSS this week vs last week.
  if (series.length < days * 2) return 0
  const last = series.slice(-days)
  const prev = series.slice(-days * 2, -days)
  const sumLast = last.reduce((s, p) => s + p.tss, 0)
  const sumPrev = prev.reduce((s, p) => s + p.tss, 0)
  return Math.round(sumLast - sumPrev)
}
