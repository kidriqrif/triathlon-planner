import React, { useState } from 'react'
import { suggestWeek, createWorkout } from '../api'
import { addDays, nextMonday, format } from 'date-fns'
import { Bot, Waves, Bike, Footprints } from 'lucide-react'

const SPORT_COLORS = {
  swim: 'border-blue-300 bg-blue-50',
  bike: 'border-orange-300 bg-orange-50',
  run: 'border-green-300 bg-green-50',
  brick: 'border-purple-300 bg-purple-50',
}

const SPORT_BADGE = {
  swim: 'bg-blue-100 text-blue-800',
  bike: 'bg-orange-100 text-orange-800',
  run: 'bg-green-100 text-green-800',
  brick: 'bg-purple-100 text-purple-800',
}

const DAY_OFFSETS = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
  Friday: 4, Saturday: 5, Sunday: 6,
}

function getNextWeekDate(dayName) {
  const monday = nextMonday(new Date())
  const offset = DAY_OFFSETS[dayName] ?? 0
  return format(addDays(monday, offset), 'yyyy-MM-dd')
}

export default function AICoach({ onWorkoutsAdded }) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState(null)
  const [addedIds, setAddedIds] = useState(new Set())
  const [addingId, setAddingId] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setPlan(null)
    setAddedIds(new Set())
    try {
      const result = await suggestWeek()
      setPlan(result)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to generate plan. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (workout, idx) => {
    setAddingId(idx)
    try {
      await createWorkout({
        date: getNextWeekDate(workout.day),
        sport: workout.sport,
        workout_type: workout.workout_type,
        status: 'planned',
        distance_km: workout.distance_km ?? null,
        duration_min: workout.duration_min ?? null,
        notes: workout.description ?? '',
      })
      setAddedIds(prev => new Set([...prev, idx]))
      onWorkoutsAdded?.()
    } catch (e) {
      alert('Failed to add workout')
    } finally {
      setAddingId(null)
    }
  }

  const handleAddAll = async () => {
    if (!plan?.workouts) return
    for (let i = 0; i < plan.workouts.length; i++) {
      if (!addedIds.has(i)) await handleAdd(plan.workouts[i], i)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bot size={18} strokeWidth={1.5} className="text-indigo-500" />
            StreloIQ
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Your intelligent training engine — personalised plans based on your history</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Thinking…
            </>
          ) : 'Generate Next Week\'s Plan'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-4">
          {error}
        </div>
      )}

      {plan && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="font-semibold text-indigo-900">{plan.week_focus}</p>
            <p className="text-sm text-indigo-700 mt-1">{plan.rationale}</p>
          </div>

          <div className="grid gap-3">
            {plan.workouts?.map((w, i) => (
              <div key={i}
                className={`rounded-xl border-2 p-4 flex items-start justify-between gap-3 ${SPORT_COLORS[w.sport] || 'border-slate-200 bg-slate-50'}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-slate-700">{w.day}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${SPORT_BADGE[w.sport] || 'bg-slate-100 text-slate-700'}`}>
                      {w.sport}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{w.workout_type}</span>
                  </div>
                  <p className="text-sm text-slate-600">{w.description}</p>
                  <div className="flex gap-3 mt-1 text-xs text-slate-400">
                    {w.duration_min && <span>{w.duration_min} min</span>}
                    {w.distance_km && <span>{w.distance_km} km</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(w, i)}
                  disabled={addedIds.has(i) || addingId === i}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    addedIds.has(i)
                      ? 'bg-green-100 text-green-700 border-green-300 cursor-default'
                      : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                  }`}>
                  {addedIds.has(i) ? '✓ Added' : addingId === i ? '…' : 'Add'}
                </button>
              </div>
            ))}
          </div>

          {plan.workouts?.length > 0 && (
            <button
              onClick={handleAddAll}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors">
              Add All to Calendar
            </button>
          )}
        </div>
      )}

      {!plan && !loading && !error && (
        <div className="text-center py-10 text-slate-400">
          <div className="flex justify-center gap-3 mb-3 text-slate-200">
            <Waves size={28} strokeWidth={1.5} />
            <Bike size={28} strokeWidth={1.5} />
            <Footprints size={28} strokeWidth={1.5} />
          </div>
          <p className="text-sm">Click the button above to get AI-generated training suggestions</p>
        </div>
      )}
    </div>
  )
}
