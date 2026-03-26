import React, { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

export default function LandingPage({ onGetStarted, onSignIn, onNavigate }) {
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/health').catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav — tight, no frills */}
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-sm">Strelo</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={onSignIn} className="text-slate-500 hover:text-slate-900">Log in</button>
            <button onClick={onGetStarted} className="font-medium text-white bg-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero — minimal, direct */}
      <section className="max-w-6xl mx-auto px-5 py-16 sm:py-24">
        <div className="max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
            Triathlon training planner<br />that actually plans for you.
          </h1>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Log your swims, rides, and runs. Set a race target. Strelo builds
            your training week, tracks what you've done, and adjusts as you go.
            Syncs with Strava. Exports to your watch.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <button onClick={onGetStarted}
              className="text-sm font-medium text-white bg-slate-900 px-4 py-2.5 rounded-md hover:bg-slate-800 transition-colors inline-flex items-center gap-2">
              Get started <ArrowRight size={14} />
            </button>
            <span className="text-xs text-slate-400">Free tier available. No card required.</span>
          </div>
        </div>
      </section>

      {/* What it does — dense, scannable */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Plan</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><strong className="text-slate-900">Weekly calendar</strong> — drag-and-drop, colour-coded by sport</li>
                <li><strong className="text-slate-900">StreloIQ</strong> — generates structured weeks based on your race, fitness, and schedule</li>
                <li><strong className="text-slate-900">Race periodisation</strong> — auto base/build/peak/taper phases</li>
                <li><strong className="text-slate-900">Interval builder</strong> — warm-up, work, rest, cool-down blocks</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Track</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><strong className="text-slate-900">Workout log</strong> — duration, distance, RPE, notes per session</li>
                <li><strong className="text-slate-900">Strava import</strong> — completed activities sync automatically</li>
                <li><strong className="text-slate-900">Dashboard</strong> — weekly volume, sport split, completion rate, streak</li>
                <li><strong className="text-slate-900">CSV export</strong> — download everything for your own analysis</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Execute</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><strong className="text-slate-900">.FIT export</strong> — push planned workouts to Garmin, COROS, Wahoo</li>
                <li><strong className="text-slate-900">Brick workouts</strong> — multi-sport sessions with per-leg structure</li>
                <li><strong className="text-slate-900">Race countdown</strong> — days to go, current training phase</li>
                <li><strong className="text-slate-900">Injury notes</strong> — flag limitations, StreloIQ adapts around them</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — inline, not a big section */}
      <section className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="sm:flex items-start gap-12">
            <div className="mb-6 sm:mb-0 sm:w-1/3">
              <h2 className="text-lg font-bold">Pricing</h2>
              <p className="text-sm text-slate-500 mt-1">
                Most features are free. Pro unlocks StreloIQ — the part that writes your plan.
              </p>
            </div>
            <div className="sm:flex-1 grid sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold text-sm">Free</p>
                  <p className="font-bold">$0</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">Calendar, log, dashboard, Strava sync, FIT export, races</p>
              </div>
              <div className="border-2 border-slate-900 rounded-lg p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold text-sm">Pro</p>
                  <p className="font-bold">$12.99<span className="text-xs font-normal text-slate-400">/mo</span></p>
                </div>
                <p className="text-xs text-slate-400 mt-1">Everything free + StreloIQ plans, advanced analytics, priority support</p>
                <p className="text-xs text-slate-400">Yearly: $123.99 <span className="text-emerald-600 font-medium">(save 20%)</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — just a line */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 py-10 sm:flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600 mb-3 sm:mb-0">
            <strong>Race day is coming.</strong> Start planning.
          </p>
          <button onClick={onGetStarted}
            className="text-sm font-medium text-white bg-slate-900 px-4 py-2.5 rounded-md hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shrink-0">
            Create account <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Footer — one line */}
      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between text-xs text-slate-400">
          <span>Strelo &copy; 2026</span>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-600">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-600">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
