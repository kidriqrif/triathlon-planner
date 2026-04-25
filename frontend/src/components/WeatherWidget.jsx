import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle,
  CloudFog, CloudSun, MapPin, Droplets,
} from 'lucide-react'

// ── WMO weather-code mapping ──────────────────────────────────────
function weatherLabel(code) {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Cloudy'
  if (code >= 45 && code <= 48) return 'Foggy'
  if (code >= 51 && code <= 55) return 'Drizzle'
  if (code >= 61 && code <= 65) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Showers'
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

function WeatherIcon({ code, size = 18, className = '' }) {
  const props = { size, strokeWidth: 1.5, className }
  if (code === 0) return <Sun {...props} />
  if (code <= 3) return code === 1 ? <CloudSun {...props} /> : <Cloud {...props} />
  if (code >= 45 && code <= 48) return <CloudFog {...props} />
  if (code >= 51 && code <= 55) return <CloudDrizzle {...props} />
  if (code >= 61 && code <= 65) return <CloudRain {...props} />
  if (code >= 71 && code <= 77) return <CloudSnow {...props} />
  if (code >= 80 && code <= 82) return <Droplets {...props} />
  if (code >= 95 && code <= 99) return <CloudLightning {...props} />
  return <Cloud {...props} />
}

// ── Outdoor sports (gym/swim excluded) ────────────────────────────
const OUTDOOR_SPORTS = new Set(['run', 'bike', 'brick'])

const CACHE_KEY = 'strelo_weather_cache'

async function fetchWeather(latitude, longitude) {
  // Check sessionStorage cache first
  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      // Cache is valid if it was fetched today
      if (parsed.fetchDate === format(new Date(), 'yyyy-MM-dd')) {
        return parsed.data
      }
    } catch { /* ignore corrupted cache */ }
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', latitude)
  url.searchParams.set('longitude', longitude)
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '7')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')
  const data = await res.json()

  // Cache it
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({
    fetchDate: format(new Date(), 'yyyy-MM-dd'),
    data,
  }))

  return data
}

function parseForecast(data) {
  const { daily } = data
  if (!daily) return []
  return daily.time.map((date, i) => ({
    date,
    high: Math.round(daily.temperature_2m_max[i]),
    low: Math.round(daily.temperature_2m_min[i]),
    code: daily.weathercode[i],
  }))
}

// ── Component ─────────────────────────────────────────────────────
export default function WeatherWidget({ workouts = [] }) {
  const [forecast, setForecast] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    if (!navigator.geolocation) {
      setError('location')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude)
          if (!cancelled) {
            setForecast(parseForecast(data))
            setLoading(false)
          }
        } catch {
          if (!cancelled) {
            setError('fetch')
            setLoading(false)
          }
        }
      },
      () => {
        if (!cancelled) {
          setError('location')
          setLoading(false)
        }
      },
      { timeout: 10000 }
    )

    return () => { cancelled = true }
  }, [])

  // ── Location denied / error states ──
  if (error === 'location') {
    return (
      <div className="vista-panel rounded-2xl p-4 flex items-center gap-3">
        <MapPin size={16} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500 shrink-0" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Enable location for weather</p>
      </div>
    )
  }

  if (error === 'fetch') {
    return (
      <div className="vista-panel rounded-2xl p-4 flex items-center gap-3">
        <Cloud size={16} strokeWidth={1.5} className="text-slate-400 dark:text-slate-500 shrink-0" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Weather unavailable right now</p>
      </div>
    )
  }

  // ── Loading skeleton ──
  if (loading || !forecast) {
    return (
      <div className="vista-panel rounded-2xl p-4 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-3" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // ── Build forecast map (date → weather) ──
  const forecastMap = {}
  for (const day of forecast) {
    forecastMap[day.date] = day
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayWeather = forecastMap[todayStr]

  // ── Find next 3 outdoor workout days with forecast ──
  const upcomingOutdoor = workouts
    .filter(w =>
      w.date > todayStr &&
      OUTDOOR_SPORTS.has(w.sport) &&
      w.status === 'planned' &&
      forecastMap[w.date]
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)
    // Deduplicate by date (take first workout per day)
    .reduce((acc, w) => {
      if (!acc.find(x => x.date === w.date)) acc.push(w)
      return acc
    }, [])

  const SPORT_LABEL = { run: 'Run', bike: 'Bike', brick: 'Brick' }

  return (
    <div className="vista-panel rounded-2xl p-4">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-3">Weather forecast</p>

      <div className="flex gap-2 overflow-x-auto">
        {/* Today */}
        {todayWeather && (
          <div className="flex-1 min-w-[5rem] bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 rounded-lg px-3 py-2.5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-500 dark:text-orange-400 mb-1">Today</p>
            <WeatherIcon code={todayWeather.code} size={20} className="mx-auto text-orange-500 dark:text-orange-400 mb-1" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {todayWeather.high}° / {todayWeather.low}°
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{weatherLabel(todayWeather.code)}</p>
          </div>
        )}

        {/* Upcoming outdoor workouts */}
        {upcomingOutdoor.map(w => {
          const weather = forecastMap[w.date]
          const dayDate = new Date(w.date + 'T12:00:00')
          return (
            <div key={w.date}
              className="flex-1 min-w-[5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {format(dayDate, 'EEE')}
              </p>
              <WeatherIcon code={weather.code} size={20} className="mx-auto text-slate-500 dark:text-slate-400 mb-1" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {weather.high}° / {weather.low}°
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {SPORT_LABEL[w.sport] || w.sport}
              </p>
            </div>
          )
        })}

        {/* If no upcoming outdoor workouts, show next forecast days instead */}
        {upcomingOutdoor.length === 0 && forecast.slice(1, 4).map(day => {
          const dayDate = new Date(day.date + 'T12:00:00')
          return (
            <div key={day.date}
              className="flex-1 min-w-[5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                {format(dayDate, 'EEE')}
              </p>
              <WeatherIcon code={day.code} size={20} className="mx-auto text-slate-500 dark:text-slate-400 mb-1" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {day.high}° / {day.low}°
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{weatherLabel(day.code)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
