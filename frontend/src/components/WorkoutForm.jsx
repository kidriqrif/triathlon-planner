import React, { useState, useEffect } from 'react'
import WorkoutBuilder, { serializeBlocks, parseBlocks } from './WorkoutBuilder'
import BrickBuilder, { serializeBrick, parseBrick } from './BrickBuilder'
import { Waves, Bike, Footprints, Layers, Dumbbell } from 'lucide-react'

const SPORT_CONFIG = {
  swim:  { Icon: Waves,      label: 'Swim',  color: 'bg-blue-500',   types: ['easy','tempo','interval','long','recovery'] },
  bike:  { Icon: Bike,       label: 'Bike',  color: 'bg-orange-500', types: ['easy','tempo','interval','long','recovery'] },
  run:   { Icon: Footprints, label: 'Run',   color: 'bg-green-500',  types: ['easy','tempo','interval','long','recovery'] },
  brick: { Icon: Layers,     label: 'Brick', color: 'bg-violet-500', types: ['easy','race-sim','long','recovery'] },
  gym:   { Icon: Dumbbell,   label: 'Gym',   color: 'bg-pink-500',   types: ['strength','mobility','hiit','circuit','yoga'] },
}

const TYPE_LABELS = {
  easy: 'Easy', tempo: 'Tempo', interval: 'Interval', long: 'Long',
  recovery: 'Recovery', 'race-sim': 'Race Simulation',
  strength: 'Strength', mobility: 'Mobility', hiit: 'HIIT', circuit: 'Circuit', yoga: 'Yoga / Stretch',
}

const STATUSES = ['planned', 'completed', 'skipped']
const STATUS_CONFIG = {
  planned:   { icon: '○', active: 'bg-slate-700 text-white border-slate-700' },
  completed: { icon: '✓', active: 'bg-emerald-500 text-white border-emerald-500' },
  skipped:   { icon: '✗', active: 'bg-red-400 text-white border-red-400' },
}

const inputCls = 'vista-input w-full rounded-xl px-3 py-2.5 text-sm dark:text-white'

export default function WorkoutForm({ workout, defaultDate, onSave, onDelete, onClose }) {
  const today = defaultDate || new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    date: today, sport: 'run', workout_type: 'easy', status: 'planned',
    distance_km: '', duration_min: '', rpe: '', notes: '',
  })
  const [blocks, setBlocks]           = useState([])   // interval builder
  const [brickSegments, setBrickSegs] = useState([])   // brick builder

  useEffect(() => {
    if (workout) {
      const isBrick    = workout.sport === 'brick'
      const isInterval = workout.workout_type === 'interval' && !isBrick && workout.sport !== 'gym'

      setBrickSegs(isBrick    ? (parseBrick(workout.notes)  || []) : [])
      setBlocks   (isInterval ? (parseBlocks(workout.notes) || []) : [])

      setForm({
        date: workout.date,
        sport: workout.sport,
        workout_type: workout.workout_type,
        status: workout.status,
        distance_km: workout.distance_km ?? '',
        duration_min: workout.duration_min ?? '',
        rpe: workout.rpe ?? '',
        notes: (isBrick || isInterval) ? '' : (workout.notes ?? ''),
      })
    }
  }, [workout])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSportChange = (sport) => {
    const firstType = SPORT_CONFIG[sport].types[0]
    setForm(f => ({ ...f, sport, workout_type: firstType, notes: '' }))
    setBlocks([])
    setBrickSegs([])
  }

  const handleTypeChange = (t) => {
    setForm(f => ({ ...f, workout_type: t, notes: '' }))
    setBlocks([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const isBrick    = form.sport === 'brick'
    const isInterval = form.workout_type === 'interval' && !isBrick && form.sport !== 'gym'
    onSave({
      ...form,
      distance_km:  form.distance_km  !== '' ? parseFloat(form.distance_km)  : null,
      duration_min: form.duration_min !== '' ? parseInt(form.duration_min)   : null,
      rpe:          form.rpe          !== '' ? parseInt(form.rpe)             : null,
      notes: isBrick    ? serializeBrick(brickSegments)
           : isInterval ? serializeBlocks(blocks)
           : form.notes,
    })
  }

  const sportMeta      = SPORT_CONFIG[form.sport] || SPORT_CONFIG.run
  const isBrick        = form.sport === 'brick'
  const isInterval     = form.workout_type === 'interval' && !isBrick && form.sport !== 'gym'
  const availableTypes = sportMeta.types

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Sport-coloured header */}
        <div className={`${sportMeta.color} rounded-t-xl px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <sportMeta.Icon size={28} strokeWidth={1.5} className="text-white" />
            <div>
              <p className="text-white font-bold text-lg leading-none">
                {workout ? 'Edit Workout' : 'New Workout'}
              </p>
              <p className="text-white/70 text-xs mt-0.5">{sportMeta.label}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg leading-none transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={set('date')} required className={inputCls} />
          </div>

          {/* Sport */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sport</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(SPORT_CONFIG).map(([key, meta]) => (
                <button key={key} type="button" onClick={() => handleSportChange(key)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 text-xs font-bold transition-all ${
                    form.sport === key
                      ? `${meta.color} text-white border-transparent shadow-sm`
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}>
                  <meta.Icon size={18} strokeWidth={1.5} />
                  <span>{meta.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workout type — hide for brick (structure is in the builder) */}
          {!isBrick && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Workout Type</label>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map(t => (
                  <button key={t} type="button" onClick={() => handleTypeChange(t)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      form.workout_type === t
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                    }`}>
                    {TYPE_LABELS[t] || t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                    form.status === s ? STATUS_CONFIG[s].active : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}>
                  <span>{STATUS_CONFIG[s].icon}</span>
                  <span className="capitalize">{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { field: 'distance_km',  label: 'Distance (km)', type: 'number', step: '0.1', min: '0' },
              { field: 'duration_min', label: 'Duration (min)', type: 'number', min: '0' },
              { field: 'rpe',          label: 'RPE (1–10)',     type: 'number', min: '1', max: '10' },
            ].map(({ field, label, ...props }) => (
              <div key={field}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                <input value={form[field]} onChange={set(field)} placeholder="—" className={inputCls} {...props} />
              </div>
            ))}
          </div>

          {/* Bottom section: brick builder / interval builder / notes */}
          {isBrick ? (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Brick Sequence
                <span className="ml-2 normal-case font-normal text-violet-400">
                  any sport · any order · unlimited legs
                </span>
              </label>
              <BrickBuilder value={brickSegments} onChange={setBrickSegs} />
            </div>
          ) : isInterval ? (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Workout Builder
              </label>
              <WorkoutBuilder value={blocks} onChange={setBlocks} />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={set('notes')} rows={3}
                placeholder={
                  form.sport === 'gym'
                    ? 'e.g. Squats 4×8 @80kg, Bench 3×10, Pull-ups 3×8…'
                    : 'How did it feel? Any targets or cues…'
                }
                className={inputCls + ' resize-none'} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="submit"
              className={`flex-1 ${sportMeta.color} hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all`}>
              {workout ? 'Save Changes' : 'Add Workout'}
            </button>
            {workout && (
              <button type="button" onClick={() => onDelete(workout.id)}
                className="px-4 py-3 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold">
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
