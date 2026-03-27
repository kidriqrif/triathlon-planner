import React, { useState } from 'react'
import Calendar from '../components/Calendar'
import WorkoutForm from '../components/WorkoutForm'
import { createWorkout, updateWorkout, deleteWorkout } from '../api'
import { Waves, Bike, Footprints, Layers, Dumbbell } from 'lucide-react'

const LEGEND = [
  { color: 'bg-blue-500',   label: 'Swim',  Icon: Waves      },
  { color: 'bg-orange-500', label: 'Bike',  Icon: Bike       },
  { color: 'bg-green-500',  label: 'Run',   Icon: Footprints },
  { color: 'bg-violet-500', label: 'Brick', Icon: Layers     },
  { color: 'bg-rose-500',   label: 'Gym',   Icon: Dumbbell   },
]

export default function PlanPage({ workouts, onRefresh }) {
  const [formState, setFormState] = useState(null) // null | { workout, defaultDate }

  const openNew = (dateStr) => setFormState({ workout: null, defaultDate: dateStr })
  const openEdit = (workout) => setFormState({ workout, defaultDate: null })
  const closeForm = () => setFormState(null)

  const handleSave = async (payload) => {
    if (formState?.workout) {
      await updateWorkout(formState.workout.id, payload)
    } else {
      await createWorkout(payload)
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Training Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">Click to add · click event to edit · drag to move</p>
        </div>
        <button
          onClick={() => openNew(new Date().toISOString().split('T')[0])}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          + Add Workout
        </button>
      </div>

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
        onSelectEvent={openEdit}
        onMoveWorkout={handleMoveWorkout}
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
