import React, { useState, useEffect } from 'react'
import { getTemplates, createTemplate, deleteTemplate, createWorkout } from '../api'
import { Waves, Bike, Footprints, Layers, Dumbbell, BookMarked, Plus, Trash2, Play, AlertCircle } from 'lucide-react'

const SPORT_META = {
  swim:  { Icon: Waves,      color: 'text-blue-500',    bg: 'bg-blue-500/10', label: 'Swim'  },
  bike:  { Icon: Bike,       color: 'text-orange-500',  bg: 'bg-orange-500/10', label: 'Bike'  },
  run:   { Icon: Footprints, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Run'   },
  brick: { Icon: Layers,     color: 'text-violet-500',  bg: 'bg-violet-500/10', label: 'Brick' },
  gym:   { Icon: Dumbbell,   color: 'text-rose-500',    bg: 'bg-rose-500/10', label: 'Gym'   },
}

const TYPE_LABELS = {
  easy: 'Easy', tempo: 'Tempo', interval: 'Interval', long: 'Long', recovery: 'Recovery',
}

const inputCls = 'w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none'

export default function SavedPage({ user, onRefresh }) {
  const [templates, setTemplates] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', sport: 'run', workout_type: 'easy', duration_min: '', distance_km: '', notes: '' })

  const isPro = user?.plan === 'pro'
  const limit = isPro ? Infinity : 3

  useEffect(() => { loadTemplates() }, [])

  const loadTemplates = () => {
    getTemplates().then(setTemplates).catch(() => {})
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await createTemplate({
        ...form,
        duration_min: form.duration_min ? parseInt(form.duration_min) : null,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
        notes: form.notes || null,
      })
      setShowForm(false)
      setForm({ name: '', sport: 'run', workout_type: 'easy', duration_min: '', distance_km: '', notes: '' })
      loadTemplates()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save template')
    }
  }

  const handleDelete = async (id) => {
    await deleteTemplate(id)
    loadTemplates()
  }

  const handleUseTemplate = async (t) => {
    const today = new Date().toISOString().split('T')[0]
    await createWorkout({
      date: today,
      sport: t.sport,
      workout_type: t.workout_type,
      status: 'planned',
      duration_min: t.duration_min,
      distance_km: t.distance_km,
      notes: t.notes,
    })
    if (onRefresh) onRefresh()
    alert(`Added "${t.name}" to today's plan`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Saved Workouts</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {templates.length}{!isPro && `/${limit}`} template{templates.length !== 1 ? 's' : ''}
            {!isPro && ' — upgrade for unlimited'}
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          disabled={!isPro && templates.length >= limit}
          className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-medium px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-40 flex items-center gap-1.5">
          <Plus size={14} strokeWidth={2} /> New
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-3 py-2.5">
          <AlertCircle size={15} strokeWidth={1.5} /> {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required placeholder="Template name (e.g. Tuesday Tempo Run)" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))} className={inputCls}>
              <option value="swim">Swim</option>
              <option value="bike">Bike</option>
              <option value="run">Run</option>
              <option value="brick">Brick</option>
            </select>
            <select value={form.workout_type} onChange={e => setForm(f => ({ ...f, workout_type: e.target.value }))} className={inputCls}>
              <option value="easy">Easy</option>
              <option value="tempo">Tempo</option>
              <option value="interval">Interval</option>
              <option value="long">Long</option>
              <option value="recovery">Recovery</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
              placeholder="Duration (min)" className={inputCls} />
            <input type="number" step="0.1" value={form.distance_km} onChange={e => setForm(f => ({ ...f, distance_km: e.target.value }))}
              placeholder="Distance (km)" className={inputCls} />
          </div>
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (optional)" className={inputCls} />
          <div className="flex gap-2">
            <button type="submit"
              className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              Save Template
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(null) }}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors px-3">
              Cancel
            </button>
          </div>
        </form>
      )}

      {templates.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <BookMarked size={40} strokeWidth={1} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No saved templates yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Save workouts you repeat often for quick planning</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map(t => {
            const meta = SPORT_META[t.sport] || SPORT_META.run
            return (
              <div key={t.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                  <meta.Icon size={16} strokeWidth={1.5} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{t.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {meta.label} · {TYPE_LABELS[t.workout_type] || t.workout_type}
                    {t.duration_min ? ` · ${t.duration_min}min` : ''}
                    {t.distance_km ? ` · ${t.distance_km}km` : ''}
                  </p>
                </div>
                <button onClick={() => handleUseTemplate(t)} title="Add to today"
                  className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors">
                  <Play size={14} strokeWidth={2} />
                </button>
                <button onClick={() => handleDelete(t.id)} title="Delete"
                  className="p-2 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
