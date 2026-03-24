import React, { useState } from 'react'
import Calendar from '../components/Calendar'
import WorkoutForm from '../components/WorkoutForm'
import { createWorkout, updateWorkout, deleteWorkout } from '../api'

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Training Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">Click a date to add · click an event to edit</p>
        </div>
        <button
          onClick={() => openNew(new Date().toISOString().split('T')[0])}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
          + Add Workout
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { color: 'bg-blue-500',   label: 'Swim',  icon: '🏊' },
          { color: 'bg-orange-500', label: 'Bike',  icon: '🚴' },
          { color: 'bg-green-500',  label: 'Run',   icon: '🏃' },
          { color: 'bg-violet-500', label: 'Brick', icon: '🔄' },
          { color: 'bg-rose-500',   label: 'Gym',   icon: '🏋️' },
        ].map(({ color, label, icon }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span className={`w-3 h-3 rounded-full ${color}`} /> {icon} {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <span className="w-6 h-3 rounded border-2 border-dashed border-slate-300" /> Planned
        </span>
      </div>

      <Calendar
        workouts={workouts}
        onSelectSlot={openNew}
        onSelectEvent={openEdit}
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
