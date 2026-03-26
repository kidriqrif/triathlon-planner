import React, { useState } from 'react'
import { updateAthlete, createRace, markOnboarded } from '../api'
import { ArrowRight, ArrowLeft, Waves, Bike, Footprints, Flag, Sparkles, Check } from 'lucide-react'

const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'New to triathlon or returning after a long break' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Completed a few races, train regularly' },
  { value: 'advanced', label: 'Advanced', desc: 'Experienced racer, structured training' },
]

const RACE_DISTANCES = [
  { value: 'sprint', label: 'Sprint', desc: '750m / 20km / 5km' },
  { value: 'olympic', label: 'Olympic', desc: '1.5km / 40km / 10km' },
  { value: '70.3', label: 'Half Ironman', desc: '1.9km / 90km / 21.1km' },
  { value: 'ironman', label: 'Ironman', desc: '3.8km / 180km / 42.2km' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all bg-white'

export default function OnboardingPage({ user, onComplete }) {
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Profile state
  const [fitness, setFitness] = useState('intermediate')
  const [weeklyHours, setWeeklyHours] = useState(8)
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [swimPace, setSwimPace] = useState('')
  const [bikeFtp, setBikeFtp] = useState('')
  const [runPace, setRunPace] = useState('')
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri', 'Sat'])
  const [goal, setGoal] = useState('')

  // Race state
  const [raceName, setRaceName] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [raceDistance, setRaceDistance] = useState('olympic')
  const [skipRace, setSkipRace] = useState(false)

  const toggleDay = (d) => setSelectedDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  )

  const handleFinish = async () => {
    setSaving(true)
    try {
      // Save athlete profile
      await updateAthlete({
        name: user.name,
        fitness_level: fitness,
        weekly_hours_target: weeklyHours,
        age: age ? parseInt(age) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        swim_pace_100m: swimPace || null,
        bike_ftp_watts: bikeFtp ? parseInt(bikeFtp) : null,
        run_pace_km: runPace || null,
        preferred_days: selectedDays.join(','),
        goal_description: goal || null,
      })

      // Save race if provided
      if (!skipRace && raceName && raceDate) {
        await createRace({
          name: raceName,
          date: raceDate,
          distance: raceDistance,
          is_active: true,
        })
      }

      // Mark onboarding complete
      await markOnboarded()
      onComplete()
    } catch (e) {
      console.error('Onboarding save failed:', e)
      onComplete() // Still proceed even if save fails
    }
  }

  const steps = [
    // Step 0: Welcome
    () => (
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
              <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
              <path d="M12 14L15 4" stroke="rgba(255,255,255,0.25)" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800">Welcome to Strelo, {user.name}!</h2>
        <p className="text-slate-400 mt-2 max-w-sm mx-auto">
          Let's set up your training profile in under a minute so we can personalise your experience.
        </p>
        <div className="flex justify-center gap-6 mt-8 text-slate-400">
          <div className="flex items-center gap-2 text-sm"><Waves size={18} strokeWidth={1.5} className="text-blue-400" /> Swim</div>
          <div className="flex items-center gap-2 text-sm"><Bike size={18} strokeWidth={1.5} className="text-orange-400" /> Bike</div>
          <div className="flex items-center gap-2 text-sm"><Footprints size={18} strokeWidth={1.5} className="text-green-400" /> Run</div>
        </div>
      </div>
    ),

    // Step 1: Fitness & basics
    () => (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your fitness level</h2>
          <p className="text-sm text-slate-400 mt-1">This helps us calibrate training suggestions</p>
        </div>
        <div className="space-y-2">
          {FITNESS_LEVELS.map(({ value, label, desc }) => (
            <button key={value} onClick={() => setFitness(value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                fitness === value
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-slate-100 hover:border-slate-200'
              }`}>
              <p className="font-bold text-sm text-slate-800">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </button>
          ))}
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Weekly training hours</label>
          <div className="flex items-center gap-3 mt-1">
            <input type="range" min="3" max="20" step="0.5" value={weeklyHours}
              onChange={e => setWeeklyHours(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500" />
            <span className="text-sm font-bold text-indigo-600 w-12 text-right">{weeklyHours}h</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Training days</label>
          <div className="flex gap-1.5">
            {DAYS.map(d => (
              <button key={d} onClick={() => toggleDay(d)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedDays.includes(d)
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    ),

    // Step 2: Benchmarks (optional)
    () => (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your benchmarks</h2>
          <p className="text-sm text-slate-400 mt-1">Optional — helps the AI give better paces. Skip any you don't know.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)}
              placeholder="e.g. 30" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Weight (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 72" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Waves size={12} className="text-blue-400" /> Swim /100m</label>
            <input value={swimPace} onChange={e => setSwimPace(e.target.value)}
              placeholder="1:45" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Bike size={12} className="text-orange-400" /> FTP (W)</label>
            <input type="number" value={bikeFtp} onChange={e => setBikeFtp(e.target.value)}
              placeholder="200" className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Footprints size={12} className="text-green-400" /> Run /km</label>
            <input value={runPace} onChange={e => setRunPace(e.target.value)}
              placeholder="5:30" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Training goal (optional)</label>
          <input value={goal} onChange={e => setGoal(e.target.value)}
            placeholder="e.g. Finish my first Olympic tri under 3 hours"
            className={inputCls} />
        </div>
      </div>
    ),

    // Step 3: Race
    () => (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Set your target race</h2>
          <p className="text-sm text-slate-400 mt-1">We'll build your training around race day</p>
        </div>

        {!skipRace ? (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-500">Race name</label>
              <input value={raceName} onChange={e => setRaceName(e.target.value)}
                placeholder="e.g. Singapore Triathlon 2026" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Race date</label>
              <input type="date" value={raceDate} onChange={e => setRaceDate(e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Distance</label>
              <div className="space-y-2">
                {RACE_DISTANCES.map(({ value, label, desc }) => (
                  <button key={value} onClick={() => setRaceDistance(value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      raceDistance === value
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}>
                    <p className="font-bold text-sm text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setSkipRace(true)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Skip — I'll add a race later
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <Flag size={32} strokeWidth={1.5} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-400">No race set. You can add one anytime from the Races tab.</p>
            <button onClick={() => setSkipRace(false)}
              className="text-xs text-indigo-500 font-semibold hover:underline mt-2">
              Actually, let me add one
            </button>
          </div>
        )}
      </div>
    ),

    // Step 4: Done
    () => (
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check size={28} strokeWidth={2.5} className="text-emerald-600" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800">You're all set!</h2>
        <p className="text-slate-400 mt-2 max-w-sm mx-auto">
          Your profile is ready. Head to the dashboard to start planning your training.
        </p>
        {!skipRace && raceName && (
          <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-sm font-semibold px-4 py-2 rounded-xl">
            <Flag size={14} strokeWidth={2} />
            {raceName} — {raceDate}
          </div>
        )}
      </div>
    ),
  ]

  const isLast = step === steps.length - 1
  const isFirst = step === 0

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? 'bg-indigo-500' : 'bg-slate-200'
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[380px] flex flex-col">
          <div className="flex-1">
            {steps[step]()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            {!isFirst ? (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft size={14} strokeWidth={2} /> Back
              </button>
            ) : <div />}

            {isLast ? (
              <button onClick={handleFinish} disabled={saving}
                className="flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-60">
                {saving ? 'Saving...' : <>Go to Dashboard <Sparkles size={14} strokeWidth={2} /></>}
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm">
                {isFirst ? 'Let\'s Go' : 'Next'} <ArrowRight size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
