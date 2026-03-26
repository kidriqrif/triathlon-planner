import React, { useEffect } from 'react'
import { ArrowRight, Waves, Bike, Footprints, Calendar, BarChart3, Zap, Target, Watch, BookOpen } from 'lucide-react'

export default function LandingPage({ onGetStarted, onSignIn, onNavigate }) {
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/health').catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Nav */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-sm">Strelo</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <a href="#pricing" className="text-white/40 hover:text-white transition-colors hidden sm:block">Pricing</a>
            <a href="#contact" className="text-white/40 hover:text-white transition-colors hidden sm:block">Contact</a>
            <button onClick={onSignIn} className="text-white/50 hover:text-white transition-colors">Log in</button>
            <button onClick={onGetStarted} className="font-medium bg-indigo-500 hover:bg-indigo-400 px-3.5 py-1.5 rounded-md transition-colors">
              Sign up free
            </button>
          </div>
        </div>
      </header>

      {/* Hero — dark with gradient blobs */}
      <section className="relative">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px]" />

        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Waves size={16} className="text-blue-400" />
              <Bike size={16} className="text-orange-400" />
              <Footprints size={16} className="text-emerald-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Your triathlon.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400">
                Planned by AI.
              </span>
            </h1>
            <p className="text-lg text-white/50 mt-5 leading-relaxed max-w-lg">
              Log your training. Set a race. StreloIQ builds your week — swim, bike, run —
              with the right volume, intensity, and periodisation. Syncs with Strava.
              Exports to your watch.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button onClick={onGetStarted}
                className="font-medium bg-indigo-500 hover:bg-indigo-400 px-5 py-3 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
                Start free <ArrowRight size={15} />
              </button>
              <button onClick={onSignIn}
                className="font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-5 py-3 rounded-lg transition-colors text-sm">
                Log in
              </button>
            </div>
            <p className="text-xs text-white/30 mt-4">No credit card. No spam.</p>
          </div>

          {/* Mock app preview */}
          <div className="mt-16 relative">
            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Mock top bar */}
              <div className="bg-white/5 border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-indigo-500/50" />
                  <span className="text-xs font-medium text-white/40">Strelo</span>
                </div>
                <div className="flex gap-4 text-xs text-white/25">
                  <span className="text-white/60">Dashboard</span>
                  <span>Calendar</span>
                  <span>Log</span>
                  <span>Races</span>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="p-5 space-y-3">
                {/* Mock stat row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'This week', value: '5', sub: 'sessions', color: 'text-emerald-400' },
                    { label: 'Hours', value: '6.2h', sub: 'training', color: 'text-blue-400' },
                    { label: 'Streak', value: '12d', sub: 'consecutive', color: 'text-orange-400' },
                    { label: 'Total', value: '148h', sub: 'all time', color: 'text-violet-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3">
                      <p className="text-[10px] text-white/30">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-white/20">{s.sub}</p>
                    </div>
                  ))}
                </div>
                {/* Mock sport bar */}
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 w-[25%]" />
                  <div className="bg-orange-500 w-[40%]" />
                  <div className="bg-emerald-500 w-[35%]" />
                </div>
                <div className="flex gap-4 text-[10px] text-white/30">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Swim</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Bike</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Run</span>
                </div>
                {/* Mock chart bars */}
                <div className="flex items-end gap-1.5 h-20 pt-4">
                  {[40, 55, 35, 65, 50, 70, 45, 60].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-0.5">
                      <div className="bg-blue-500/60 rounded-sm" style={{ height: `${h * 0.3}%` }} />
                      <div className="bg-orange-500/60 rounded-sm" style={{ height: `${h * 0.4}%` }} />
                      <div className="bg-emerald-500/60 rounded-sm" style={{ height: `${h * 0.3}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Glow under the preview */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-indigo-500/20 blur-[60px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Features — dark cards with icons */}
      <section className="relative border-t border-white/5 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">What you get</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-12">
            Everything a triathlete needs.<br className="hidden sm:block" />
            <span className="text-white/40">Nothing you don't.</span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { Icon: Calendar, title: 'Weekly calendar', desc: 'Drag-and-drop your swim, bike, and run sessions. Colour-coded by sport.', color: 'text-blue-400 bg-blue-500/10' },
              { Icon: Zap, title: 'StreloIQ', desc: 'AI generates your week based on race target, fitness level, and history.', color: 'text-violet-400 bg-violet-500/10' },
              { Icon: Target, title: 'Race periodisation', desc: 'Set a race date. Auto base, build, peak, taper phases.', color: 'text-orange-400 bg-orange-500/10' },
              { Icon: BarChart3, title: 'Dashboard', desc: 'Volume trends, sport balance, RPE, streak, and personal records.', color: 'text-emerald-400 bg-emerald-500/10' },
              { Icon: Watch, title: 'Device export', desc: '.FIT files for Garmin, COROS, Wahoo. Follow workouts on your wrist.', color: 'text-cyan-400 bg-cyan-500/10' },
              { Icon: BookOpen, title: 'Strava sync', desc: 'Import completed activities. No double logging.', color: 'text-rose-400 bg-rose-500/10' },
            ].map(({ Icon, title, desc, color }) => (
              <div key={title} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.06] transition-colors">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/5 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="sm:flex items-start gap-12">
            <div className="mb-8 sm:mb-0 sm:w-1/3">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Pricing</p>
              <h2 className="text-xl font-bold">Free to start.<br />Pro when you're ready.</h2>
              <p className="text-sm text-white/40 mt-2">
                Most features are free forever. Pro unlocks StreloIQ.
              </p>
            </div>
            <div className="sm:flex-1 grid sm:grid-cols-2 gap-4">
              <div className="border border-white/10 rounded-xl p-5 bg-white/[0.02]">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold text-sm">Free</p>
                  <p className="font-bold text-lg">$0</p>
                </div>
                <p className="text-xs text-white/30 mt-2">Calendar, log, basic stats, 1 race, 3 templates, Strava sync</p>
              </div>
              <div className="border-2 border-indigo-500 rounded-xl p-5 bg-indigo-500/5 relative">
                <div className="absolute -top-2.5 right-4 bg-indigo-500 text-[10px] font-bold px-2 py-0.5 rounded-full">POPULAR</div>
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold text-sm">Pro</p>
                  <p className="font-bold text-lg">$12.99<span className="text-xs font-normal text-white/40">/mo</span></p>
                </div>
                <p className="text-xs text-white/30 mt-2">StreloIQ, volume trends, FIT/CSV export, unlimited races & templates, support chat</p>
                <p className="text-xs text-white/30 mt-1">Annual: $123.99 <span className="text-emerald-400 font-medium">(save 20%)</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-5 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Race day won't wait.</h2>
          <p className="text-white/40 mt-3 max-w-md mx-auto text-sm">Set up your plan in under a minute.</p>
          <button onClick={onGetStarted}
            className="mt-8 font-medium bg-indigo-500 hover:bg-indigo-400 px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
            Create free account <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/5 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="sm:flex items-start gap-12">
            <div className="mb-6 sm:mb-0 sm:w-1/3">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Contact</p>
              <h2 className="text-xl font-bold">Get in touch</h2>
              <p className="text-sm text-white/40 mt-2">
                Questions, feedback, or partnership inquiries — we'd love to hear from you.
              </p>
            </div>
            <div className="sm:flex-1 space-y-4">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                <p className="text-sm font-medium mb-1">Email</p>
                <a href="mailto:support@strelo.app" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">support@strelo.app</a>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                <p className="text-sm font-medium mb-1">Strava partnerships</p>
                <p className="text-sm text-white/40">Interested in integrating with Strelo? Reach out via email.</p>
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
                <p className="text-sm font-medium mb-1">Bug reports</p>
                <p className="text-sm text-white/40">Found something broken? Use the in-app support chat (Pro) or email us.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5 py-6 flex items-center justify-between text-xs text-white/25">
          <span>Strelo &copy; 2026</span>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-white/50 transition-colors">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-white/50 transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
