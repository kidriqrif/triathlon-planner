import React, { useState, useMemo } from 'react'
import Calendar from '../components/Calendar'
import WorkoutForm from '../components/WorkoutForm'
import { createWorkout, updateWorkout, deleteWorkout, bulkDeleteWorkouts } from '../api'
import { Waves, Bike, Footprints, Layers, Dumbbell, Trash2, X, Plus, ArrowRight, Pencil, CalendarRange } from 'lucide-react'
import { format } from 'date-fns'

const SPORT_META = {
  swim:  { Icon: Waves,      label: 'Swim',  color: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400' },
  bike:  { Icon: Bike,       label: 'Bike',  color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  run:   { Icon: Footprints, label: 'Run',   color: 'bg-green-500',  text: 'text-green-600 dark:text-green-400' },
  brick: { Icon: Layers,     label: 'Brick', color: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' },
  gym:   { Icon: Dumbbell,   label: 'Gym',   color: 'bg-pink-500',   text: 'text-pink-600 dark:text-pink-400' },
}

const TYPE_LABELS = {
  easy: 'Easy', tempo: 'Tempo', interval: 'Interval', long: 'Long',
  recovery: 'Recovery', 'race-sim': 'Race Sim',
  strength: 'Strength', mobility: 'Mobility', hiit: 'HIIT', circuit: 'Circuit', yoga: 'Yoga',
}

const LEGEND = [
  { color: 'bg-blue-500',   label: 'Swim',  Icon: Waves      },
  { color: 'bg-orange-500', label: 'Bike',  Icon: Bike       },
  { color: 'bg-green-500',  label: 'Run',   Icon: Footprints },
  { color: 'bg-violet-500', label: 'Brick', Icon: Layers     },
  { color: 'bg-pink-500',   label: 'Gym',   Icon: Dumbbell   },
]

export default function PlanPage({ workouts, onRefresh }) {
  const [formState, setFormState] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [movingWorkout, setMovingWorkout] = useState(null)
  const [localWorkouts, setLocalWorkouts] = useState(null)
  const [showClearRange, setShowClearRange] = useState(false)
  const [clearStart, setClearStart] = useState('')
  const [clearEnd, setClearEnd] = useState('')
  const [clearing, setClearing] = useState(false)
  const displayWorkouts = localWorkouts || workouts

  // Workouts for selected day
  const dayWorkouts = useMemo(() => {
    if (!selectedDate) return []
    return displayWorkouts
      .filter(w => w.date === selectedDate)
      .sort((a, b) => (a.id - b.id))
  }, [displayWorkouts, selectedDate])

  const handleDateClick = (dateStr) => {
    if (movingWorkout) {
      // Moving a workout to this day
      handleMoveToDay(movingWorkout.id, dateStr)
      return
    }
    setSelectedDate(dateStr)
  }

  const handleEventClick = (workout) => {
    setSelectedDate(workout.date)
  }

  const handleSave = async (payload) => {
    if (formState?.workout) await updateWorkout(formState.workout.id, payload)
    else await createWorkout(payload)
    setFormState(null)
    setLocalWorkouts(null)
    onRefresh()
  }

  const handleDeleteSingle = async (id) => {
    if (!confirm('Delete this workout?')) return
    await deleteWorkout(id)
    setFormState(null)
    setLocalWorkouts(null)
    onRefresh()
  }

  const handleMoveWorkout = async (workoutId, newDate) => {
    setLocalWorkouts(prev => {
      const base = prev || workouts
      return base.map(w => w.id === workoutId ? { ...w, date: newDate } : w)
    })
    await updateWorkout(workoutId, { date: newDate })
    onRefresh()
    setTimeout(() => setLocalWorkouts(null), 500)
  }

  const handleMoveToDay = async (workoutId, newDate) => {
    setMovingWorkout(null)
    setSelectedDate(newDate)
    await handleMoveWorkout(workoutId, newDate)
  }

  const selectedDateFormatted = selectedDate
    ? format(new Date(selectedDate + 'T12:00:00'), 'EEEE, d MMM yyyy')
    : ''

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Training Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {movingWorkout
              ? 'Click a date to move the workout there'
              : 'Click a date to see workouts · drag events to move'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowClearRange(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              showClearRange
                ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}>
            <CalendarRange size={14} strokeWidth={2} />
            <span className="hidden sm:inline">Clear range</span>
          </button>
          <button
            onClick={() => setFormState({ workout: null, defaultDate: selectedDate || new Date().toISOString().split('T')[0] })}
            className="vista-btn px-4 py-2.5 rounded-lg text-sm">
            + Add Workout
          </button>
        </div>
      </div>

      {/* Moving mode banner */}
      {movingWorkout && (
        <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 mb-3">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Moving <strong>{movingWorkout.sport.toUpperCase()} · {TYPE_LABELS[movingWorkout.workout_type] || movingWorkout.workout_type}</strong> — click a date
          </p>
          <button onClick={() => setMovingWorkout(null)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <X size={13} /> Cancel
          </button>
        </div>
      )}

      {/* Clear range panel */}
      {showClearRange && (
        <div className="flex flex-wrap items-center gap-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-3">
          <span className="text-sm text-red-700 dark:text-red-300 font-medium">Delete all workouts from</span>
          <input type="date" value={clearStart} onChange={e => setClearStart(e.target.value)}
            className="text-xs border border-red-200 dark:border-red-700 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 dark:text-white" />
          <span className="text-sm text-red-700 dark:text-red-300">to</span>
          <input type="date" value={clearEnd} onChange={e => setClearEnd(e.target.value)}
            className="text-xs border border-red-200 dark:border-red-700 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 dark:text-white" />
          <button
            disabled={!clearStart || !clearEnd || clearing}
            onClick={async () => {
              const count = workouts.filter(w => w.date >= clearStart && w.date <= clearEnd).length
              if (!count) { setShowClearRange(false); return }
              if (!confirm(`Delete ${count} workout${count !== 1 ? 's' : ''} from ${clearStart} to ${clearEnd}?`)) return
              setClearing(true)
              await bulkDeleteWorkouts(clearStart, clearEnd)
              setClearing(false)
              setShowClearRange(false)
              setClearStart('')
              setClearEnd('')
              setLocalWorkouts(null)
              onRefresh()
            }}
            className="text-xs font-medium text-white bg-red-500 hover:bg-red-400 px-3 py-1.5 rounded-md transition-colors disabled:opacity-40">
            {clearing ? 'Deleting...' : 'Delete'}
          </button>
          <button onClick={() => { setShowClearRange(false); setClearStart(''); setClearEnd('') }}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Cancel
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        {LEGEND.map(({ color, label, Icon }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            <Icon size={12} strokeWidth={1.5} />
            {label}
          </span>
        ))}
      </div>

      {/* Calendar — full width */}
      <div className="relative">
        <Calendar
          workouts={displayWorkouts}
          onSelectSlot={handleDateClick}
          onSelectEvent={handleEventClick}
          onMoveWorkout={handleMoveWorkout}
          selectedIds={new Set()}
        />

        {/* Day panel overlay */}
        {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDate(null)}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative vista-panel rounded-xl w-full max-w-sm max-h-[70vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedDateFormatted}</p>
                  <p className="text-xs text-slate-400">{dayWorkouts.length} workout{dayWorkouts.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setFormState({ workout: null, defaultDate: selectedDate })}
                    className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Plus size={14} strokeWidth={2} />
                  </button>
                  <button onClick={() => setSelectedDate(null)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {dayWorkouts.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500">No workouts</p>
                    <button onClick={() => setFormState({ workout: null, defaultDate: selectedDate })}
                      className="text-xs text-rose-500 hover:text-rose-400 font-medium mt-1">
                      Add one
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dayWorkouts.map(w => {
                      const meta = SPORT_META[w.sport] || SPORT_META.run
                      return (
                        <div key={w.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <div className={`w-8 h-8 rounded-md ${meta.color} flex items-center justify-center shrink-0`}>
                            <meta.Icon size={14} strokeWidth={1.5} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-white">
                              {meta.label} · {TYPE_LABELS[w.workout_type] || w.workout_type}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {w.duration_min ? `${w.duration_min}min` : ''}
                              {w.duration_min && w.distance_km ? ' · ' : ''}
                              {w.distance_km ? `${w.distance_km}km` : ''}
                              {!w.duration_min && !w.distance_km ? w.status : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setFormState({ workout: w, defaultDate: null })}
                              title="Edit"
                              className="p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors">
                              <Pencil size={12} strokeWidth={2} />
                            </button>
                            <button onClick={() => { setSelectedDate(null); setMovingWorkout(w) }}
                              title="Move to another day"
                              className="p-1.5 rounded text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors">
                              <ArrowRight size={12} strokeWidth={2} />
                            </button>
                            <button onClick={() => handleDeleteSingle(w.id)}
                              title="Delete"
                              className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                              <Trash2 size={12} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {formState !== null && (
        <WorkoutForm
          workout={formState.workout}
          defaultDate={formState.defaultDate}
          onSave={handleSave}
          onDelete={handleDeleteSingle}
          onClose={() => setFormState(null)}
        />
      )}
    </div>
  )
}
