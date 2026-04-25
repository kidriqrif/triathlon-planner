import React, { useState, useEffect } from 'react'
import { getTemplates, createTemplate, deleteTemplate, createWorkout } from '../api'
import WorkoutBuilder, { serializeBlocks, parseBlocks } from '../components/WorkoutBuilder'
import BrickBuilder, { serializeBrick, parseBrick } from '../components/BrickBuilder'
import { Waves, Bike, Footprints, Layers, Dumbbell, BookMarked, Plus, Trash2, Play, AlertCircle, X } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const SPORT_CONFIG = {
  swim:  { Icon: Waves,      label: 'Swim',  color: 'bg-blue-500',   types: ['easy','tempo','interval','long','recovery'] },
  bike:  { Icon: Bike,       label: 'Bike',  color: 'bg-orange-500', types: ['easy','tempo','interval','long','recovery'] },
  run:   { Icon: Footprints, label: 'Run',   color: 'bg-green-500',  types: ['easy','tempo','interval','long','recovery'] },
  brick: { Icon: Layers,     label: 'Brick', color: 'bg-violet-500', types: ['easy','race-sim','long','recovery'] },
  gym:   { Icon: Dumbbell,   label: 'Gym',   color: 'bg-pink-500',   types: ['strength','mobility','hiit','circuit','yoga'] },
}

const TYPE_LABELS = {
  easy: 'Easy', tempo: 'Tempo', interval: 'Interval', long: 'Long',
  recovery: 'Recovery', 'race-sim': 'Race Sim',
  strength: 'Strength', mobility: 'Mobility', hiit: 'HIIT', circuit: 'Circuit', yoga: 'Yoga',
}

const inputCls = 'vista-input w-full rounded-xl px-3 py-2.5 text-sm dark:text-white'

export default function SavedPage({ user, onRefresh }) {
  const { t } = useI18n()
  const [templates, setTemplates] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ name: '', sport: 'run', workout_type: 'easy', duration_min: '', distance_km: '', notes: '' })
  const [blocks, setBlocks] = useState([])
  const [brickSegments, setBrickSegs] = useState([])

  const isPro = user?.plan === 'pro'
  const limit = isPro ? Infinity : 3

  useEffect(() => { loadTemplates() }, [])
  const loadTemplates = () => { getTemplates().then(setTemplates).catch(() => {}) }

  const sportMeta = SPORT_CONFIG[form.sport] || SPORT_CONFIG.run
  const isBrick = form.sport === 'brick'
  const isInterval = form.workout_type === 'interval' && !isBrick && form.sport !== 'gym'

  const handleSportChange = (sport) => {
    const firstType = SPORT_CONFIG[sport].types[0]
    setForm(f => ({ ...f, sport, workout_type: firstType, notes: '' }))
    setBlocks([])
    setBrickSegs([])
  }

  const handleTypeChange = (type) => {
    setForm(f => ({ ...f, workout_type: type, notes: '' }))
    setBlocks([])
  }

  const resetForm = () => {
    setForm({ name: '', sport: 'run', workout_type: 'easy', duration_min: '', distance_km: '', notes: '' })
    setBlocks([])
    setBrickSegs([])
    setShowForm(false)
    setError(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    const notes = isBrick ? serializeBrick(brickSegments)
                : isInterval ? serializeBlocks(blocks)
                : form.notes || null
    try {
      await createTemplate({
        name: form.name,
        sport: form.sport,
        workout_type: form.workout_type,
        duration_min: form.duration_min ? parseInt(form.duration_min) : null,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
        notes,
      })
      resetForm()
      loadTemplates()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save template')
    }
  }

  const handleDelete = async (id) => {
    await deleteTemplate(id)
    loadTemplates()
  }

  const handleUseTemplate = async (tpl) => {
    const today = new Date().toISOString().split('T')[0]
    await createWorkout({
      date: today,
      sport: tpl.sport,
      workout_type: tpl.workout_type,
      status: 'planned',
      duration_min: tpl.duration_min,
      distance_km: tpl.distance_km,
      notes: tpl.notes,
    })
    if (onRefresh) onRefresh()
    alert(`${t('addedToToday')}: ${tpl.name}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-800 dark:text-white">{t('savedWorkouts')}</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {templates.length}{!isPro && `/${limit}`} {templates.length !== 1 ? t('templates') : t('template')}
            {!isPro && ` — ${t('upgradeUnlimited')}`}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            disabled={!isPro && templates.length >= limit}
            className="vista-btn px-3 py-2 rounded-lg text-sm disabled:opacity-40 flex items-center gap-1.5">
            <Plus size={14} strokeWidth={2} /> {t('new')}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-3 py-2.5">
          <AlertCircle size={15} strokeWidth={1.5} /> {error}
        </div>
      )}

      {/* Template builder form — mirrors WorkoutForm style */}
      {showForm && (
        <div className="vista-panel rounded-xl overflow-hidden">
          {/* Colored header */}
          <div className={`${sportMeta.color} px-5 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <sportMeta.Icon size={22} strokeWidth={1.5} className="text-white" />
              <span className="text-white font-bold text-sm">New Template</span>
            </div>
            <button onClick={resetForm}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-3.5 space-y-3">
            {/* Template name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Template Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required placeholder="e.g. Tuesday Tempo Run" className={inputCls} />
            </div>

            {/* Sport selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Sport</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(SPORT_CONFIG).map(([key, meta]) => (
                  <button key={key} type="button" onClick={() => handleSportChange(key)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                      form.sport === key
                        ? `${meta.color} text-white border-transparent shadow-sm`
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}>
                    <meta.Icon size={16} strokeWidth={1.5} />
                    <span className="text-[10px]">{meta.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Workout type */}
            {!isBrick && (
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {sportMeta.types.map(tp => (
                    <button key={tp} type="button" onClick={() => handleTypeChange(tp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        form.workout_type === tp
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-orange-300'
                      }`}>
                      {TYPE_LABELS[tp] || tp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration + Distance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Duration (min)</label>
                <input type="number" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
                  placeholder="—" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Distance (km)</label>
                <input type="number" step="0.1" value={form.distance_km} onChange={e => setForm(f => ({ ...f, distance_km: e.target.value }))}
                  placeholder="—" className={inputCls} />
              </div>
            </div>

            {/* Interval builder / Brick builder / Notes */}
            {isBrick ? (
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Brick Sequence</label>
                <BrickBuilder segments={brickSegments} onChange={setBrickSegs} />
              </div>
            ) : isInterval ? (
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Interval Structure</label>
                <WorkoutBuilder sport={form.sport} blocks={blocks} onChange={setBlocks} />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Optional — describe the workout" className={inputCls} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button type="submit"
                className="vista-btn px-4 py-2.5 rounded-lg text-sm">
                {t('saveTemplate')}
              </button>
              <button type="button" onClick={resetForm}
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors px-3">
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Template list */}
      {templates.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <BookMarked size={40} strokeWidth={1} className="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('noSavedTemplates')}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('saveWorkoutsRepeat')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map(tpl => {
            const meta = SPORT_CONFIG[tpl.sport] || SPORT_CONFIG.run
            return (
              <div key={tpl.id} className="vista-panel rounded-2xl overflow-hidden">
                <div className={`h-1 ${meta.color}`} />
                <div className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${meta.color} flex items-center justify-center shrink-0`}>
                    <meta.Icon size={16} strokeWidth={1.5} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{tpl.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {meta.label} · {TYPE_LABELS[tpl.workout_type] || tpl.workout_type}
                      {tpl.duration_min ? ` · ${tpl.duration_min}min` : ''}
                      {tpl.distance_km ? ` · ${tpl.distance_km}km` : ''}
                    </p>
                  </div>
                  <button onClick={() => handleUseTemplate(tpl)} title="Add to today"
                    className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors">
                    <Play size={14} strokeWidth={2} />
                  </button>
                  <button onClick={() => handleDelete(tpl.id)} title="Delete"
                    className="p-2 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
