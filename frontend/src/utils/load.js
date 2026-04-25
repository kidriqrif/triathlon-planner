// Training load math.
//
// Three TSS sources, picked best-available per workout:
//   1. Power-based (cycling): TSS = (sec * NP * IF) / (FTP * 3600) * 100,
//      where IF = NP/FTP. Gold standard.
//   2. HR-based (run/swim with HR):
//        IF = avg_hr / threshold_hr, then TSS = hours * IF^2 * 100
//   3. Estimate (no intensity data): from workout type + duration.
//
// Daily series:
//   CTL (chronic load, "fitness") — 42-day exponentially weighted average.
//   ATL (acute load, "fatigue")   —  7-day exponentially weighted average.
//   TSB (form)                    — CTL − ATL.
//
// Recursion:
//   X_today = X_yesterday + (TSS_today − X_yesterday) / N

import { format, eachDayOfInterval, subDays } from 'date-fns'

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
  run:   1.05,
  brick: 1.10,
  gym:   0.55,
}

export function workoutTSS(w, athlete) {
  if (!w || !w.duration_min || w.status !== 'completed') return { tss: 0, source: 'none' }

  const hours = w.duration_min / 60

  // 1. Cycling with NP + FTP → power-based TSS
  if (w.sport === 'bike' && (w.np_power || w.avg_power) && athlete?.bike_ftp_watts) {
    const np = w.np_power || w.avg_power
    const if_ = np / athlete.bike_ftp_watts
    const tss = (w.duration_min * 60 * np * if_) / (athlete.bike_ftp_watts * 3600) * 100
    return { tss: Math.round(tss), source: 'power' }
  }

  // 2. HR-based (run / swim / brick with HR + threshold HR)
  if (w.avg_hr && athlete?.threshold_hr) {
    const if_ = w.avg_hr / athlete.threshold_hr
    const bias = SPORT_BIAS[w.sport] ?? 1.0
    const tss = hours * if_ * if_ * 100 * bias
    return { tss: Math.round(tss), source: 'hr' }
  }

  // 3. Estimated from workout type
  const if_ = TYPE_IF[w.workout_type] ?? 0.65
  const bias = SPORT_BIAS[w.sport] ?? 1.0
  const tss = hours * if_ * if_ * 100 * bias
  return { tss: Math.round(tss), source: 'estimate' }
}

export function dailyTSS(workouts, athlete) {
  // Map of yyyy-MM-dd → { tss, sources: Set }
  const map = new Map()
  for (const w of workouts) {
    if (!w.date) continue
    const { tss, source } = workoutTSS(w, athlete)
    if (tss === 0) continue
    const cur = map.get(w.date) || { tss: 0, sources: new Set() }
    cur.tss += tss
    cur.sources.add(source)
    map.set(w.date, cur)
  }
  return map
}

export function loadSeries(workouts, athlete, days = 84) {
  const today = new Date(); today.setHours(12, 0, 0, 0)
  const start = subDays(today, days - 1)
  const dailyMap = dailyTSS(workouts, athlete)
  const range = eachDayOfInterval({ start, end: today })

  let ctl = 0, atl = 0
  const out = []
  for (const d of range) {
    const key = format(d, 'yyyy-MM-dd')
    const day = dailyMap.get(key) || { tss: 0, sources: new Set() }
    ctl = ctl + (day.tss - ctl) / 42
    atl = atl + (day.tss - atl) / 7
    out.push({
      date: key,
      label: format(d, 'd MMM'),
      tss: day.tss,
      sources: [...day.sources],
      ctl: Math.round(ctl * 10) / 10,
      atl: Math.round(atl * 10) / 10,
      tsb: Math.round((ctl - atl) * 10) / 10,
    })
  }
  return out
}

export function tssSourceMix(workouts, athlete) {
  // % of recent (60d) TSS that came from real (power/hr) vs estimate
  const cutoff = subDays(new Date(), 60)
  let real = 0, est = 0
  for (const w of workouts) {
    if (!w.date) continue
    if (new Date(w.date) < cutoff) continue
    const { tss, source } = workoutTSS(w, athlete)
    if (source === 'power' || source === 'hr') real += tss
    else if (source === 'estimate') est += tss
  }
  const total = real + est
  return {
    real,
    est,
    total,
    realPct: total > 0 ? Math.round((real / total) * 100) : 0,
  }
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
