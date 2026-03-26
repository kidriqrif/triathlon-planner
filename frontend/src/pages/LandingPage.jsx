import React, { useEffect } from 'react'
import { Check, ArrowRight, Waves, Bike, Footprints } from 'lucide-react'

export default function LandingPage({ onGetStarted, onSignIn, onNavigate }) {
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/health').catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.25)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">Strelo</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onSignIn} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Log in
            </button>
            <button onClick={onGetStarted}
              className="text-sm font-semibold text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Sign up free
            </button>
          </div>
        </div>
      </header>

      {/* Hero — left-aligned, conversational */}
      <section className="max-w-5xl mx-auto px-5 pt-20 sm:pt-28 pb-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
            <Waves size={15} className="text-blue-400" />
            <Bike size={15} className="text-orange-400" />
            <Footprints size={15} className="text-emerald-400" />
            <span className="ml-1">For triathletes who want structure</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Stop training random.<br />
            Start training with a plan.
          </h1>
          <p className="text-lg text-slate-500 mt-5 leading-relaxed max-w-lg">
            Strelo gives you a training calendar, workout logs, race countdown,
            and an engine that builds your week for you. Built for triathletes
            who are tired of spreadsheets.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <button onClick={onGetStarted}
              className="text-sm font-semibold text-white bg-slate-900 px-5 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
              Create free account <ArrowRight size={15} />
            </button>
            <span className="text-xs text-slate-400">No credit card. No spam. Just training.</span>
          </div>
        </div>
      </section>

      {/* What you get — simple two-column, not a grid of cards */}
      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-12">
            The stuff you actually need. Nothing you don't.
          </h2>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Training calendar</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                See your whole week at a glance. Drag workouts around. Click to log.
                Colour-coded by swim, bike, and run so you spot imbalances instantly.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">StreloIQ weekly plans</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tell it your race, your fitness, your available days. It generates
                a structured week with the right mix of easy, tempo, long, and recovery.
                <span className="text-slate-400"> Pro only.</span>
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Race countdown & periodisation</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Set your target race. Strelo figures out if you're in base, build, peak,
                or taper and adjusts suggestions accordingly.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Strava sync</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect Strava and your completed activities import automatically.
                No double logging. Your planned vs actual is always up to date.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Structured workouts → device</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Export planned sessions as .FIT files. Upload to your Garmin,
                COROS, or Wahoo. Follow the workout on your wrist.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">Dashboard that tells you something</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Weekly volume, sport breakdown, RPE trends, completion rate.
                Not 40 charts — just the ones that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — clean, no "Most Popular" badge */}
      <section className="border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Pricing</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Free to start. Upgrade if you want the engine.
          </h2>
          <p className="text-slate-500 text-sm mb-12 max-w-lg">
            Most features are free forever. Pro unlocks StreloIQ — the part that
            actually writes your training plan for you.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            {/* Free */}
            <div className="border border-slate-200 rounded-xl p-6">
              <p className="text-sm font-bold text-slate-900">Free</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">$0</p>
              <p className="text-sm text-slate-400 mb-5">No limits, no expiry</p>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {['Log workouts & races', 'Training calendar', 'Dashboard & stats', 'Strava sync', 'FIT file export'].map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} strokeWidth={2.5} className="text-slate-400 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted}
                className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:border-slate-300 transition-colors">
                Get started
              </button>
            </div>

            {/* Pro */}
            <div className="border-2 border-slate-900 rounded-xl p-6">
              <p className="text-sm font-bold text-slate-900">Pro</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-extrabold text-slate-900">$12.99</p>
                <p className="text-sm text-slate-400">/mo</p>
              </div>
              <p className="text-sm text-slate-400 mb-5">or $123.99/yr <span className="text-emerald-600 font-semibold">(save 20%)</span></p>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {['Everything in Free', 'StreloIQ weekly plans', 'Advanced analytics', 'Unlimited race tracking', 'Priority support'].map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} strokeWidth={2.5} className="text-slate-900 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted}
                className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                Start free, upgrade later
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA — not a giant gradient block */}
      <section className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-5 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Race day won't wait.</h2>
            <p className="text-sm text-slate-500 mt-1">Set up your plan in under a minute.</p>
          </div>
          <button onClick={onGetStarted}
            className="text-sm font-semibold text-white bg-slate-900 px-5 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shrink-0">
            Create free account <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.25)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm text-slate-400">Strelo</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-600 transition-colors">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-600 transition-colors">Terms</button>
            <span>&copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
