import React, { useState, useMemo } from 'react'
import Calendar from '../components/Calendar'
import WorkoutForm from '../components/WorkoutForm'
import { createWorkout, updateWorkout, deleteWorkout } from '../api'
import { Waves, Bike, Footprints, Layers, Dumbbell, Trash2, X, Plus, GripVertical, ArrowRight, Pencil } from 'lucide-react'
import { format } from 'date-fns'

const SPORT_META = {
  swim:  { Icon: Waves,      label: 'Swim',  color: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400' },
  bike:  { Icon: Bike,       label: 'Bike',  color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  run:   { Icon: Footprints, label: 'Run',   color: 'bg-green-500',  text: 'text-green-600 dark:text-green-400' },
  brick: { Icon: Layers,     label: 'Brick', color: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400' },
  gym:   { Icon: Dumbbell,   label: 'Gym',   color: 'bg-rose-500',   text: 'text-rose-600 dark:text-rose-400' },
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
  { color: 'bg-rose-500',   label: 'Gym',   Icon: Dumbbell   },
]

export default function PlanPage({ workouts, onRefresh }) {
  const [formState, setFormState] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [movingWorkout, setMovingWorkout] = useState(null) // workout being moved to another day
  const [localWorkouts, setLocalWorkouts] = useState(null)
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Training Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {movingWorkout
              ? 'Click a date to move the workout there'
              : 'Click a date to see workouts · drag events to move'}
          </p>
        </div>
        <button
          onClick={() => setFormState({ workout: null, defaultDate: selectedDate || new Date().toISOString().split('T')[0] })}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          + Add Workout
        </button>
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

      <div className="flex flex-wrap gap-3 mb-4">
        {LEGEND.map(({ color, label, Icon }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            <Icon size={12} strokeWidth={1.5} />
            {label}
          </span>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr,320px] gap-4">
        {/* Calendar */}
        <Calendar
          workouts={displayWorkouts}
          onSelectSlot={handleDateClick}
          onSelectEvent={handleEventClick}
          onMoveWorkout={handleMoveWorkout}
          selectedIds={new Set()}
        />

        {/* Day panel */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden lg:max-h-[590px] lg:overflow-y-auto">
          {selectedDate ? (
            <>
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedDateFormatted}</p>
                  <p className="text-xs text-slate-400">{dayWorkouts.length} workout{dayWorkouts.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setFormState({ workout: null, defaultDate: selectedDate })}
                  className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <Plus size={14} strokeWidth={2} />
                </button>
              </div>

              {dayWorkouts.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500">No workouts</p>
                  <button onClick={() => setFormState({ workout: null, defaultDate: selectedDate })}
                    className="text-xs text-indigo-500 hover:text-indigo-400 font-medium mt-1">
                    Add one
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dayWorkouts.map(w => {
                    const meta = SPORT_META[w.sport] || SPORT_META.run
                    return (
                      <div key={w.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        {/* Sport dot */}
                        <div className={`w-8 h-8 rounded-md ${meta.color} flex items-center justify-center shrink-0`}>
                          <meta.Icon size={14} strokeWidth={1.5} className="text-white" />
                        </div>

                        {/* Info */}
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

                        {/* Actions — visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setFormState({ workout: w, defaultDate: null })}
                            title="Edit"
                            className="p-1.5 rounded text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
                            <Pencil size={12} strokeWidth={2} />
                          </button>
                          <button onClick={() => setMovingWorkout(w)}
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
            </>
          ) : (
            <div className="px-4 py-16 text-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Select a date</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Click any day on the calendar</p>
            </div>
          )}
        </div>
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
