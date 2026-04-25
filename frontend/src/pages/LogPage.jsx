import React, { useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import WorkoutForm from '../components/WorkoutForm'
import { readableSummary } from '../components/WorkoutBuilder'
import { brickReadableSummary } from '../components/BrickBuilder'
import { createWorkout, updateWorkout, deleteWorkout, exportFit, exportCsv } from '../api'
import { Waves, Bike, Footprints, Layers, Dumbbell, ClipboardList, Download, FileDown } from 'lucide-react'

const SPORT_CONFIG = {
  swim:  { Icon: Waves,      label: 'Swim',  border: 'border-l-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200'       },
  bike:  { Icon: Bike,       label: 'Bike',  border: 'border-l-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  run:   { Icon: Footprints, label: 'Run',   border: 'border-l-green-400',  badge: 'bg-green-50 text-green-700 border-green-200'    },
  brick: { Icon: Layers,     label: 'Brick', border: 'border-l-violet-400', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  gym:   { Icon: Dumbbell,   label: 'Gym',   border: 'border-l-pink-400',   badge: 'bg-pink-50 text-pink-700 border-pink-200'       },
}

const STATUS_CONFIG = {
  completed: { icon: '✓', color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Done'    },
  planned:   { icon: '○', color: 'text-slate-400',   bg: 'bg-slate-50',   label: 'Planned' },
  skipped:   { icon: '✗', color: 'text-red-400',     bg: 'bg-red-50',     label: 'Skipped' },
}

const TYPE_LABELS = {
  easy: 'Easy', tempo: 'Tempo', interval: 'Interval', long: 'Long', recovery: 'Recovery',
  strength: 'Strength', mobility: 'Mobility', hiit: 'HIIT', circuit: 'Circuit', yoga: 'Yoga',
}

const FILTER_TABS = ['all', 'completed', 'planned', 'skipped']

export default function LogPage({ workouts, onRefresh, user }) {
  const { t } = useI18n()
  const isPro = user?.plan === 'pro'
  const [formState, setFormState] = useState(null)
  const [filter, setFilter] = useState('all')

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))
  const filtered = filter === 'all' ? sorted : sorted.filter(w => w.status === filter)

  const closeForm = () => setFormState(null)

  const handleSave = async (payload) => {
    if (formState?.workout) await updateWorkout(formState.workout.id, payload)
    else await createWorkout(payload)
    closeForm()
    onRefresh()
  }

  const handleDelete = async (id) => {
    if (!confirm(t('deleteWorkoutConfirm'))) return
    await deleteWorkout(id)
    closeForm()
    onRefresh()
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">{t('workoutLog')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{`${workouts.filter(w => w.status === 'completed').length} ${t('sessionsCompleted')}`}</p>
        </div>
        <div className="flex items-center gap-2">
          {isPro && workouts.length > 0 && (
            <button onClick={() => exportCsv()} title="Export all as CSV"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all">
              <FileDown size={15} strokeWidth={2} />
              <span className="hidden sm:inline">CSV</span>
            </button>
          )}
          <button onClick={() => setFormState({ workout: null, defaultDate: null })}
            className="vista-btn px-4 py-2.5 rounded-lg text-sm">
            {t('logWorkout')}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTER_TABS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
              filter === f
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}>
            {t(f)}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="flex justify-center mb-4">
            <ClipboardList size={48} strokeWidth={1} className="text-slate-200" />
          </div>
          <p className="text-lg font-semibold text-slate-500">{t('noWorkoutsYet')}</p>
          <p className="text-sm mt-1">{t('startLogging')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(w => {
            const sport = SPORT_CONFIG[w.sport] || SPORT_CONFIG.run
            const status = STATUS_CONFIG[w.status] || STATUS_CONFIG.planned
            const noteText = (w.sport === 'brick' ? brickReadableSummary(w.notes) : null)
                          ?? readableSummary(w.notes)
                          ?? w.notes

            return (
              <div key={w.id} onClick={() => setFormState({ workout: w, defaultDate: null })}
                className={`vista-panel rounded-xl border-l-4 ${sport.border} cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-px transition-all group`}>
                <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                  {/* Status icon */}
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${status.bg} flex items-center justify-center shrink-0`}>
                    <span className={`text-sm font-bold ${status.color}`}>{status.icon}</span>
                  </div>

                  {/* Date */}
                  <div className="w-14 sm:w-20 shrink-0">
                    <p className="text-xs font-bold text-slate-400 leading-none">
                      {new Date(w.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5 hidden sm:block">
                      {new Date(w.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' })}
                    </p>
                  </div>

                  {/* Sport badge */}
                  <span className={`shrink-0 flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border ${sport.badge}`}>
                    <sport.Icon size={12} strokeWidth={1.5} /> <span className="hidden sm:inline">{sport.label}</span>
                  </span>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 capitalize">
                      {TYPE_LABELS[w.workout_type] || w.workout_type}
                    </p>
                    {noteText && (
                      <p className="text-xs text-slate-400 truncate mt-0.5 hidden sm:block">{noteText}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="text-right text-xs text-slate-400 shrink-0 space-y-0.5 hidden sm:block">
                    {w.duration_min && <p className="font-semibold text-slate-600">{w.duration_min}<span className="font-normal text-slate-400"> min</span></p>}
                    {w.distance_km  && <p>{w.distance_km} km</p>}
                    {w.rpe          && <p>RPE {w.rpe}</p>}
                  </div>

                  {/* FIT export — Pro only */}
                  {isPro && w.status === 'planned' && (
                    <button
                      onClick={e => { e.stopPropagation(); exportFit(w.id) }}
                      title="Download .FIT file"
                      className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all shrink-0"
                    >
                      <Download size={14} strokeWidth={2} />
                    </button>
                  )}

                  {/* Arrow hint */}
                  <span className="text-slate-300 group-hover:text-slate-400 text-sm shrink-0 transition-colors">›</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {formState !== null && (
        <WorkoutForm workout={formState.workout} defaultDate={formState.defaultDate}
          onSave={handleSave} onDelete={handleDelete} onClose={closeForm} />
      )}
    </div>
  )
}
