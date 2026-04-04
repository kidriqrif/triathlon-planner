import React, { useState, useEffect } from 'react'
import { getAthlete, updateAthlete } from '../api'
import ZonesCalculator from '../components/ZonesCalculator'
import { Sprout, Zap, Flame, AlertTriangle, User } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const FITNESS_LEVELS = [
  { key: 'beginner',     label: 'Beginner',     desc: 'New to triathlon / first season', Icon: Sprout },
  { key: 'intermediate', label: 'Intermediate',  desc: '1–3 years racing experience',     Icon: Zap    },
  { key: 'advanced',     label: 'Advanced',      desc: '3+ years, competitive goals',     Icon: Flame  },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const inputCls = 'w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-800 dark:text-white'

export default function ProfilePage() {
  const { t } = useI18n()
  const [form, setForm]     = useState(null)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    getAthlete()
      .then(a => setForm({
        name: a.name,
        fitness_level: a.fitness_level,
        weekly_hours_target: a.weekly_hours_target,
        age: a.age ?? '',
        weight_kg: a.weight_kg ?? '',
        swim_pace_100m: a.swim_pace_100m ?? '',
        bike_ftp_watts: a.bike_ftp_watts ?? '',
        run_pace_km: a.run_pace_km ?? '',
        preferred_days: a.preferred_days ?? '',
        injuries_notes: a.injuries_notes ?? '',
        goal_description: a.goal_description ?? '',
      }))
      .catch((err) => setError(`Load failed: ${err?.message || err}`))
  }, [])

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const toggleDay = (day) => {
    setForm(f => {
      const current = f.preferred_days ? f.preferred_days.split(',') : []
      const next = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
      // Keep days in week order
      const ordered = DAYS.filter(d => next.includes(d))
      return { ...f, preferred_days: ordered.join(',') }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateAthlete({
        ...form,
        weekly_hours_target: parseFloat(form.weekly_hours_target),
        age: form.age !== '' ? parseInt(form.age) : null,
        weight_kg: form.weight_kg !== '' ? parseFloat(form.weight_kg) : null,
        bike_ftp_watts: form.bike_ftp_watts !== '' ? parseInt(form.bike_ftp_watts) : null,
        swim_pace_100m: form.swim_pace_100m || null,
        run_pace_km: form.run_pace_km || null,
        preferred_days: form.preferred_days || null,
        injuries_notes: form.injuries_notes || null,
        goal_description: form.goal_description || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError(t('failedSave'))
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AlertTriangle size={36} strokeWidth={1.5} className="text-slate-300" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-semibold">{error}</p>
          <button onClick={() => { setError(null); window.location.reload() }}
            className="text-rose-600 text-sm underline">{t('retry')}</button>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <User size={36} strokeWidth={1.5} className="text-slate-200 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm">{t('loadingProfile')}</p>
        </div>
      </div>
    )
  }

  const selectedDays = form.preferred_days ? form.preferred_days.split(',') : []

  return (
    <div className="space-y-3 max-w-lg">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">{t('athleteProfile')}</h1>
        <p className="text-slate-400 text-sm mt-0.5">{t('profileDesc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name + basics */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('basics')}</p>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('name')}</label>
            <input value={form.name} onChange={set('name')} required placeholder={t('yourName')}
              className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('age')}</label>
              <input type="number" min="10" max="99" value={form.age} onChange={set('age')}
                placeholder="—" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('weightKg')}</label>
              <input type="number" min="30" max="200" step="0.5" value={form.weight_kg} onChange={set('weight_kg')}
                placeholder="—" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Fitness level */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('fitnessLevel')}</label>
          <div className="space-y-2">
            {FITNESS_LEVELS.map(({ key, label, desc, Icon }) => (
              <button key={key} type="button"
                onClick={() => setForm(f => ({ ...f, fitness_level: key }))}
                className={`w-full flex items-center gap-4 p-3.5 rounded-lg border-2 text-left transition-all ${
                  form.fitness_level === key
                    ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                <Icon size={22} strokeWidth={1.5} className={form.fitness_level === key ? 'text-rose-500' : 'text-slate-400'} />
                <div>
                  <p className={`text-sm font-bold ${form.fitness_level === key ? 'text-rose-700' : 'text-slate-700 dark:text-slate-300'}`}>
                    {t(key)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{t(`${key}Desc`)}</p>
                </div>
                {form.fitness_level === key && (
                  <span className="ml-auto text-rose-500 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Current paces / thresholds */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('currentBenchmarks')}</p>
            <p className="text-xs text-slate-400 mt-0.5">{t('benchmarksDesc')}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('swimPace')}</label>
              <input value={form.swim_pace_100m} onChange={set('swim_pace_100m')}
                placeholder="1:45" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('bikeFtp')}</label>
              <input type="number" min="50" max="500" value={form.bike_ftp_watts} onChange={set('bike_ftp_watts')}
                placeholder="220" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('runPace')}</label>
              <input value={form.run_pace_km} onChange={set('run_pace_km')}
                placeholder="5:30" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Weekly hours */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            {t('weeklyHoursTarget')}
          </label>
          <div className="flex items-center gap-4">
            <input type="range" min="2" max="30" step="0.5"
              value={form.weekly_hours_target}
              onChange={set('weekly_hours_target')}
              className="flex-1 accent-rose-600" />
            <div className="w-20 shrink-0">
              <input type="number" step="0.5" min="1" max="40"
                value={form.weekly_hours_target}
                onChange={set('weekly_hours_target')}
                className={inputCls + ' text-center font-bold'} />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1 px-0.5">
            <span>{t('casualHours')}</span>
            <span>{t('seriousHours')}</span>
            <span>{t('proHours')}</span>
          </div>
        </div>

        {/* Preferred training days */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            {t('availableTrainingDays')}
          </label>
          <div className="flex gap-2">
            {DAYS.map(day => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  selectedDays.includes(day)
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                {day}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {t('trainingDaysDesc')}
          </p>
        </div>

        {/* Goal */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('raceGoal')}</label>
          <textarea value={form.goal_description} onChange={set('goal_description')} rows={2}
            placeholder="e.g. Sub-6hr Olympic tri, finish first Ironman, qualify for Worlds..."
            className={inputCls + ' resize-none'} />
        </div>

        {/* Injuries */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            {t('injuriesLimitations')}
          </label>
          <textarea value={form.injuries_notes} onChange={set('injuries_notes')} rows={2}
            placeholder="e.g. Recovering from knee surgery, limited pool access on weekdays..."
            className={inputCls + ' resize-none'} />
        </div>

        {/* Save */}
        <button type="submit"
          className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
            saved
              ? 'bg-emerald-500'
              : 'bg-slate-900 hover:bg-slate-800'
          }`}>
          {saved ? t('saved') : t('saveProfile')}
        </button>
      </form>

      <ZonesCalculator />
    </div>
  )
}
