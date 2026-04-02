import React, { useState, useCallback } from 'react'
import Calendar from '../components/Calendar'
import WorkoutForm from '../components/WorkoutForm'
import { createWorkout, updateWorkout, deleteWorkout } from '../api'
import { Waves, Bike, Footprints, Layers, Dumbbell, Trash2, X, CheckSquare } from 'lucide-react'

const LEGEND = [
  { color: 'bg-blue-500',   label: 'Swim',  Icon: Waves      },
  { color: 'bg-orange-500', label: 'Bike',  Icon: Bike       },
  { color: 'bg-green-500',  label: 'Run',   Icon: Footprints },
  { color: 'bg-violet-500', label: 'Brick', Icon: Layers     },
  { color: 'bg-rose-500',   label: 'Gym',   Icon: Dumbbell   },
]

export default function PlanPage({ workouts, onRefresh }) {
  const [formState, setFormState] = useState(null)
  const [selected, setSelected] = useState(new Set()) // multi-select workout IDs
  const [deleting, setDeleting] = useState(false)

  const openNew = (dateStr) => { clearSelection(); setFormState({ workout: null, defaultDate: dateStr }) }
  const openEdit = (workout) => { clearSelection(); setFormState({ workout, defaultDate: null }) }
  const closeForm = () => setFormState(null)
  const clearSelection = () => setSelected(new Set())

  const handleSave = async (payload) => {
    if (formState?.workout) await updateWorkout(formState.workout.id, payload)
    else await createWorkout(payload)
    closeForm()
    onRefresh()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this workout?')) return
    await deleteWorkout(id)
    closeForm()
    onRefresh()
  }

  const handleMoveWorkout = async (workoutId, newDate) => {
    await updateWorkout(workoutId, { date: newDate })
    onRefresh()
  }

  // Multi-select: Ctrl/Cmd+click toggles selection
  const handleEventClick = useCallback((workout, e) => {
    if (e?.ctrlKey || e?.metaKey) {
      setSelected(prev => {
        const next = new Set(prev)
        if (next.has(workout.id)) next.delete(workout.id)
        else next.add(workout.id)
        return next
      })
    } else {
      openEdit(workout)
    }
  }, [])

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} selected workout${selected.size > 1 ? 's' : ''}?`)) return
    setDeleting(true)
    for (const id of selected) {
      await deleteWorkout(id)
    }
    clearSelection()
    setDeleting(false)
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Training Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">Click to add · click event to edit · Ctrl+click to multi-select · drag to move</p>
        </div>
        <button
          onClick={() => openNew(new Date().toISOString().split('T')[0])}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          + Add Workout
        </button>
      </div>

      {/* Multi-select toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg px-4 py-2.5 mb-3">
          <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
            <CheckSquare size={15} strokeWidth={2} />
            <span className="font-medium">{selected.size} workout{selected.size > 1 ? 's' : ''} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleBulkDelete} disabled={deleting}
              className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-500 transition-colors disabled:opacity-50">
              <Trash2 size={13} strokeWidth={2} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button onClick={clearSelection}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 transition-colors">
              <X size={13} strokeWidth={2} /> Clear
            </button>
          </div>
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
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span className="w-6 h-3 rounded border-2 border-dashed border-slate-300 dark:border-slate-600" /> Planned
        </span>
      </div>

      <Calendar
        workouts={workouts}
        onSelectSlot={openNew}
        onSelectEvent={handleEventClick}
        onMoveWorkout={handleMoveWorkout}
        selectedIds={selected}
      />

      {formState !== null && (
        <WorkoutForm
          workout={formState.workout}
          defaultDate={formState.defaultDate}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeForm}
        />
      )}
    </div>
  )
}
