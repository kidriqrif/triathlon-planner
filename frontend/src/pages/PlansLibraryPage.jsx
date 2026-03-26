import React, { useState, useEffect } from 'react'
import { getPlans, importPlan } from '../api'
import { Waves, Bike, Footprints, Calendar, CheckCircle, AlertCircle } from 'lucide-react'

const DISTANCE_META = {
  sprint:  { label: 'Sprint', desc: '750m / 20km / 5km', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  olympic: { label: 'Olympic', desc: '1.5km / 40km / 10km', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  '70.3':  { label: '70.3', desc: '1.9km / 90km / 21.1km', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
  ironman: { label: 'Ironman', desc: '3.8km / 180km / 42.2km', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
}

const LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export default function PlansLibraryPage({ onRefresh }) {
  const [plans, setPlans] = useState([])
  const [importing, setImporting] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [startDates, setStartDates] = useState({})

  useEffect(() => {
    getPlans().then(setPlans).catch(() => {})
  }, [])

  const handleImport = async (planId) => {
    setImporting(planId)
    setError(null)
    setResult(null)
    try {
      const res = await importPlan(planId, startDates[planId] || null)
      setResult(res)
      if (onRefresh) onRefresh()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to import plan')
    }
    setImporting(null)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Training Plans</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          Pick a plan. It fills your calendar with structured workouts from day one.
        </p>
      </div>

      {result && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg px-4 py-3">
          <CheckCircle size={15} strokeWidth={1.5} />
          Imported {result.imported} workouts from "{result.plan}" — {result.start_date} to {result.end_date}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3">
          <AlertCircle size={15} strokeWidth={1.5} /> {error}
        </div>
      )}

      <div className="space-y-3">
        {plans.map(plan => {
          const meta = DISTANCE_META[plan.distance] || DISTANCE_META.sprint
          return (
            <div key={plan.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg ${meta.bg} flex flex-col items-center justify-center shrink-0`}>
                  <Waves size={10} className={meta.color} />
                  <Bike size={10} className={meta.color} />
                  <Footprints size={10} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{plan.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {meta.desc} · {plan.weeks} weeks · {LEVEL_LABELS[plan.level] || plan.level}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{plan.desc}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <input
                        type="date"
                        value={startDates[plan.id] || ''}
                        onChange={e => setStartDates(s => ({ ...s, [plan.id]: e.target.value }))}
                        className="text-xs border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 bg-white dark:bg-slate-800 dark:text-white"
                        placeholder="Start date"
                      />
                      <span className="text-xs text-slate-400">or defaults to next Monday</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleImport(plan.id)}
                  disabled={importing === plan.id}
                  className="shrink-0 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-40">
                  {importing === plan.id ? 'Importing...' : 'Import Plan'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
