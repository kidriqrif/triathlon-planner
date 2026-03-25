import React, { useState, useEffect } from 'react'
import { getAthlete, updateAthlete } from '../api'
import { Sprout, Zap, Flame, AlertTriangle, User } from 'lucide-react'

const FITNESS_LEVELS = [
  { key: 'beginner',     label: 'Beginner',     desc: 'New to triathlon / first season', Icon: Sprout },
  { key: 'intermediate', label: 'Intermediate',  desc: '1–3 years racing experience',     Icon: Zap    },
  { key: 'advanced',     label: 'Advanced',      desc: '3+ years, competitive goals',     Icon: Flame  },
]

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all bg-white'

export default function ProfilePage() {
  const [form, setForm]     = useState(null)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    getAthlete()
      .then(a => setForm({
        name: a.name,
        fitness_level: a.fitness_level,
        weekly_hours_target: a.weekly_hours_target,
      }))
      .catch((err) => setError(`Load failed: ${err?.message || err}`))
  }, [])

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateAthlete({ ...form, weekly_hours_target: parseFloat(form.weekly_hours_target) })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Failed to save. Please try again.')
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <AlertTriangle size={36} strokeWidth={1.5} className="text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold">{error}</p>
          <button onClick={() => { setError(null); window.location.reload() }}
            className="text-indigo-600 text-sm underline">Retry</button>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <User size={36} strokeWidth={1.5} className="text-slate-200 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm">Loading profile…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-lg">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Athlete Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your details are used by the AI coach to personalise training suggestions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Name</label>
          <input value={form.name} onChange={set('name')} required placeholder="Your name"
            className={inputCls} />
        </div>

        {/* Fitness level */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Fitness Level</label>
          <div className="space-y-2">
            {FITNESS_LEVELS.map(({ key, label, desc, Icon }) => (
              <button key={key} type="button"
                onClick={() => setForm(f => ({ ...f, fitness_level: key }))}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl border-2 text-left transition-all ${
                  form.fitness_level === key
                    ? 'bg-indigo-50 border-indigo-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}>
                <Icon size={22} strokeWidth={1.5} className={form.fitness_level === key ? 'text-indigo-500' : 'text-slate-400'} />
                <div>
                  <p className={`text-sm font-bold ${form.fitness_level === key ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
                {form.fitness_level === key && (
                  <span className="ml-auto text-indigo-500 font-black">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly hours */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Weekly Hours Target
          </label>
          <div className="flex items-center gap-4">
            <input type="range" min="2" max="30" step="0.5"
              value={form.weekly_hours_target}
              onChange={set('weekly_hours_target')}
              className="flex-1 accent-indigo-600" />
            <div className="w-20 shrink-0">
              <input type="number" step="0.5" min="1" max="40"
                value={form.weekly_hours_target}
                onChange={set('weekly_hours_target')}
                className={inputCls + ' text-center font-bold'} />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1 px-0.5">
            <span>2h — casual</span>
            <span>15h — serious</span>
            <span>30h — pro</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            The AI coach uses this to set total weekly load. Include all sports.
          </p>
        </div>

        {/* Save */}
        <button type="submit"
          className={`w-full py-3 rounded-2xl font-bold text-white transition-all shadow-sm ${
            saved
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90'
          }`}>
          {saved ? '✓ Profile Saved!' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
