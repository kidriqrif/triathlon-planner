import React, { useEffect } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight, Waves, Bike, Footprints, Calendar, BarChart3, Zap,
  Target, Watch, BookOpen, Activity, CheckCircle2, Flag, Sparkles,
} from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

function StreloMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="strelo-mark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7a00" />
          <stop offset="100%" stopColor="#ff0080" />
        </linearGradient>
      </defs>
      <path d="M12 2L2 22H22L12 2Z" fill="url(#strelo-mark)" opacity="0.15" />
      <path d="M12 2L2 22H10L14 12L12 2Z" fill="url(#strelo-mark)" />
      <path d="M16 11L12 21H22L16 11Z" fill="#52525b" />
    </svg>
  )
}

export default function LandingPage({ onGetStarted, onSignIn, onNavigate }) {
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/health').catch(() => {})
  }, [])

  return (
    <div className="dark min-h-screen bg-zinc-950 text-zinc-100 font-sans relative atmosphere overflow-x-hidden">
      <div className="topo-bg" />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StreloMark />
            <span className="font-display font-bold text-lg tracking-tight">Strelo</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={onSignIn} className="hidden sm:block text-zinc-300 hover:text-white transition-colors px-3 py-1.5">
              Log in
            </button>
            <button onClick={onGetStarted} className="btn-sunrise text-sm px-4 py-2 rounded-full">
              Get started free
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div initial="hidden" animate="show" variants={stagger} className="lg:col-span-6 space-y-7">
              <motion.div variants={fade} className="inline-flex items-center gap-3">
                <span className="h-px w-8 bg-zinc-600 block" />
                <span className="eyebrow">Pre-Dawn Protocol</span>
              </motion.div>

              <motion.h1 variants={fade}
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
                <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  Build the plan<br />your race demands.
                </span>
              </motion.h1>

              <motion.p variants={fade} className="text-lg text-zinc-400 max-w-lg leading-relaxed">
                Strelo structures your swim, bike, and run week around your race date,
                fitness level, and available hours. <span className="text-white font-medium">Ace</span> handles
                the periodisation. You do the work.
              </motion.p>

              <motion.div variants={fade} className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={onGetStarted} className="btn-sunrise text-base">
                  Get started free <ArrowRight size={16} />
                </button>
                <button onClick={onSignIn} className="btn-ghost text-base">
                  Log in
                </button>
              </motion.div>

              <motion.div variants={fade} className="flex items-center gap-6 pt-6 border-t border-white/10 text-zinc-500">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-orange-400" />
                  <span className="text-xs font-mono uppercase tracking-wider">Strava synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <Watch size={14} className="text-orange-400" />
                  <span className="text-xs font-mono uppercase tracking-wider">Garmin ready</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero data visual */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative h-[540px] hidden md:block"
            >
              <div className="panel absolute inset-0 p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <div className="eyebrow mb-1">Build Phase · Week 14</div>
                    <div className="font-display font-medium text-lg text-white">Peak Overload</div>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-sport-swim border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">S</div>
                    <div className="w-7 h-7 rounded-full bg-sport-bike border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">B</div>
                    <div className="w-7 h-7 rounded-full bg-sport-run border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">R</div>
                  </div>
                </div>

                {/* Volume bars */}
                <div className="h-20 w-full flex items-end gap-1.5 px-1">
                  {[30, 45, 70, 60, 85, 40, 95].map((h, i) => (
                    <div key={i} className="w-full bg-white/5 rounded-t-sm relative" style={{ height: `${h}%` }}>
                      {h === 70 && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-sunrise-start to-sunrise-end rounded-full" />}
                    </div>
                  ))}
                </div>

                {/* Mini calendar */}
                <div className="grid grid-cols-7 gap-1.5 flex-grow mt-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className={`text-[10px] font-mono text-center ${i >= 5 ? 'text-white font-bold' : 'text-zinc-500'}`}>{d}</div>
                  ))}
                  <div className="bg-white/[0.02] rounded border border-white/5 p-1" />
                  <div className="bg-white/[0.02] rounded border border-white/5 p-1">
                    <div className="w-full h-7 chip-swim rounded flex items-center justify-center text-[9px] font-bold">2.5k</div>
                  </div>
                  <div className="bg-white/[0.02] rounded border border-white/5 p-1">
                    <div className="w-full h-10 chip-bike rounded flex items-center justify-center text-[9px] font-bold">60m</div>
                  </div>
                  <div className="bg-white/[0.02] rounded border border-white/5 p-1">
                    <div className="w-full h-9 chip-run rounded flex items-center justify-center text-[9px] font-bold">12k</div>
                  </div>
                  <div className="bg-white/[0.02] rounded border border-white/5 p-1" />
                  <div className="bg-white/[0.02] rounded border border-orange-500/30 p-1 flex flex-col gap-1">
                    <div className="w-full h-12 chip-bike rounded flex flex-col items-center justify-center text-[9px] font-bold leading-tight">
                      <span>Long</span><span>120m</span>
                    </div>
                    <div className="w-full h-5 chip-run rounded flex items-center justify-center text-[9px] font-bold">5k</div>
                  </div>
                  <div className="bg-white/[0.02] rounded border border-white/5 p-1">
                    <div className="w-full h-12 chip-run rounded flex flex-col items-center justify-center text-[9px] font-bold leading-tight">
                      <span>Long</span><span>21k</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating fitness widget */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="panel absolute -right-4 top-1/4 p-3.5 flex items-center gap-3 z-20"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Activity size={16} className="text-orange-400" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 font-mono uppercase">Fitness</div>
                  <div className="text-white font-display text-base font-semibold">104.2</div>
                </div>
              </motion.div>

              {/* Floating countdown */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="panel absolute -left-6 bottom-1/4 p-4 z-20"
              >
                <div className="text-[10px] text-zinc-400 font-mono uppercase mb-1.5">Race countdown</div>
                <div className="flex items-end gap-1.5">
                  <span className="text-3xl font-display font-semibold text-white leading-none">84</span>
                  <span className="text-xs text-zinc-500 mb-0.5">DAYS</span>
                </div>
                <div className="w-full bg-zinc-800 h-1 mt-2.5 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-gradient-to-r from-sunrise-start to-sunrise-end" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-24 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mb-16">
            <motion.span variants={fade} className="eyebrow block mb-3">How it works</motion.span>
            <motion.h2 variants={fade} className="font-display text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl">
              Three steps to race-ready.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-12 left-0 right-0 h-px border-t border-dashed border-zinc-800" />
            {[
              {
                n: '01', Icon: Flag, title: 'Set your race',
                desc: 'Pick a distance and date. Strelo maps base, build, peak, and taper phases from day one.',
                preview: <div className="bg-zinc-950/50 rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-zinc-500 font-mono">IRONMAN 70.3 · Oct 14</span>
                    <Flag size={12} className="text-white" />
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-white rounded-full" />
                  </div>
                </div>,
              },
              {
                n: '02', Icon: Calendar, title: 'Build your week',
                desc: 'Drag sessions onto the calendar yourself, or let Ace generate a balanced week for you.',
                preview: <div className="flex flex-wrap gap-1.5">
                  {['Mon · Rest', 'Tue · Swim', 'Sat · Long', 'Sun · Brick'].map(t => (
                    <span key={t} className="px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[10px] text-zinc-300 font-mono">{t}</span>
                  ))}
                </div>,
              },
              {
                n: '03', Icon: Sparkles, title: 'Train and adapt',
                desc: 'Log results, sync from Strava, and Ace recalibrates the week if you miss a session.',
                preview: <div className="border-l-2 border-orange-400 pl-3">
                  <p className="text-xs text-white font-medium mb-1">Ace · Recalculation</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">"Shifted threshold run to Friday — Wednesday's HR drift suggests fatigue."</p>
                </div>,
                highlight: true,
              },
            ].map(({ n, Icon, title, desc, preview, highlight }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="panel p-7 relative overflow-hidden"
              >
                {highlight && (
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-400 opacity-10 rounded-full blur-3xl" />
                )}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-mono text-sm font-medium text-white mb-5 ${
                  highlight
                    ? 'bg-gradient-to-br from-sunrise-start to-sunrise-end shadow-glow-sunrise'
                    : 'bg-zinc-900 border border-white/10'
                }`}>
                  {n}
                </div>
                <h3 className="text-xl font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-5">{desc}</p>
                <div className="relative">{preview}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="text-center mb-16">
            <motion.span variants={fade} className="eyebrow block mb-3" style={{ color: '#ff7a00' }}>The architecture</motion.span>
            <motion.h2 variants={fade} className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
              Engineered for execution.
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
            {/* Adaptive Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="panel md:col-span-5 p-7 flex flex-col justify-between min-h-[320px]"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={18} className="text-zinc-400" />
                  <h3 className="text-2xl font-display font-medium text-white">Adaptive calendar</h3>
                </div>
                <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                  Drag, drop, and let the math handle the rest. Time-in-zone targeting auto-adjusts when you restructure your days.
                </p>
              </div>
              <div className="relative w-full h-32 bg-zinc-950/60 rounded-xl border border-white/5 flex items-end px-4 py-3 gap-2 mt-6">
                {[
                  { sport: 'swim', h: 40 }, { sport: 'bike', h: 65 }, { sport: 'run', h: 30 },
                  { sport: 'swim', h: 50 }, { sport: 'bike', h: 80 }, { sport: 'run', h: 45 },
                  { sport: 'bike', h: 95 },
                ].map((b, i) => (
                  <div key={i} className={`w-1/7 flex-1 rounded-t-md border-t-2 ${
                    b.sport === 'swim' ? 'bg-sport-swim/20 border-sport-swim/60' :
                    b.sport === 'bike' ? 'bg-sport-bike/20 border-sport-bike/60' :
                    'bg-sport-run/20 border-sport-run/60'
                  }`} style={{ height: `${b.h}%` }} />
                ))}
              </div>
            </motion.div>

            {/* Ace */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="panel md:col-span-3 p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="pulse-dot" />
                  <h3 className="text-xl font-display font-medium text-white">Meet Ace.</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Your AI periodisation architect — running compliance checks against your macrocycle 24/7.
                </p>
              </div>
              <div className="mt-6 bg-zinc-950/80 rounded-lg p-4 font-mono text-[11px] text-zinc-500 space-y-1.5 border border-white/5">
                <p><span className="text-orange-400">{'>'}</span> Analyzing HR drift...</p>
                <p className="pl-3 opacity-60">Fatigue decoupled by 5%.</p>
                <p><span className="text-orange-400">{'>'}</span> Recommendation:</p>
                <p className="text-white pl-3">Downgrade tomorrow's run to Z2.</p>
              </div>
            </motion.div>

            {/* Sync */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="panel md:col-span-3 p-7 flex flex-col justify-between text-center items-center"
            >
              <div className="w-full flex justify-center items-center gap-4 mb-6 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Watch size={20} className="text-zinc-300" />
                </div>
                <div className="w-6 h-px bg-zinc-700" />
                <div className="w-14 h-14 rounded-2xl p-[1px] bg-gradient-to-br from-sunrise-start to-sunrise-end">
                  <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                    <StreloMark size={20} />
                  </div>
                </div>
                <div className="w-6 h-px bg-zinc-700" />
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <Activity size={20} className="text-zinc-300" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-display font-medium text-white mb-2">Zero-friction sync</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">Pull from Strava. Push structured workouts to Garmin & COROS.</p>
              </div>
            </motion.div>

            {/* Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="panel md:col-span-5 p-7 flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={18} className="text-zinc-400" />
                  <h3 className="text-2xl font-display font-medium text-white">Granular tracking</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  TSS ramp rates, ATL/CTL workload ratios, and exact discipline breakdowns at a glance.
                </p>
                <div className="space-y-3 max-w-[220px]">
                  {[
                    { label: 'SWIM', color: 'bg-sport-swim', w: 40 },
                    { label: 'BIKE', color: 'bg-sport-bike', w: 85 },
                    { label: 'RUN',  color: 'bg-sport-run',  w: 60 },
                  ].map(r => (
                    <div key={r.label} className="flex items-center gap-3">
                      <div className="text-[10px] w-10 font-mono text-zinc-500">{r.label}</div>
                      <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-44 h-44 relative flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" className="stroke-zinc-800" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#sunrise-arc)" strokeWidth="6"
                    strokeDasharray="283" strokeDashoffset="60" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="sunrise-arc" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff7a00" />
                      <stop offset="100%" stopColor="#ff0080" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-white">78%</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Base Ready</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-24 z-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="text-center mb-12">
            <motion.span variants={fade} className="eyebrow block mb-3">Pricing</motion.span>
            <motion.h2 variants={fade} className="font-display text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              Free to start. Pro when you're ready.
            </motion.h2>
            <motion.p variants={fade} className="text-zinc-400 text-base max-w-md mx-auto">
              Most features work forever on Free. Pro unlocks Ace and advanced analytics.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-white/10 bg-zinc-950/50 p-8 flex flex-col"
            >
              <h3 className="text-2xl font-display font-semibold text-white mb-2">Base Camp</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-display font-bold text-white leading-none">$0</span>
                <span className="text-zinc-500 mb-1.5 text-sm">/ forever</span>
              </div>
              <ul className="space-y-3 text-sm text-zinc-400 mb-8 flex-1">
                {['Calendar, log, basic stats', '1 race · 3 templates', 'Strava sync', 'PWA mobile install'].map(t => (
                  <li key={t} className="flex items-start gap-3"><CheckCircle2 size={15} className="text-zinc-600 mt-0.5 shrink-0" /> {t}</li>
                ))}
              </ul>
              <button onClick={onGetStarted} className="btn-ghost w-full">Get started</button>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl p-[1px] bg-gradient-to-br from-orange-500/40 via-pink-500/30 to-orange-500/10"
            >
              <div className="rounded-[calc(1.5rem-1px)] bg-zinc-900 p-8 flex flex-col h-full relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-pink-500 opacity-15 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-display font-semibold text-white">Pro Engine</h3>
                  <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">Popular</span>
                </div>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-5xl font-display font-bold text-sunrise leading-none">$12.99</span>
                  <span className="text-zinc-500 mb-1.5 text-sm">/ month</span>
                </div>
                <ul className="space-y-3 text-sm text-zinc-300 mb-8 flex-1">
                  {[
                    'Ace AI periodisation & recalibration',
                    'FIT/CSV export to Garmin & COROS',
                    'Unlimited races & templates',
                    'Advanced TSS, ATL/CTL charts',
                    'Priority support',
                  ].map(t => (
                    <li key={t} className="flex items-start gap-3"><CheckCircle2 size={15} className="text-orange-400 mt-0.5 shrink-0" /> {t}</li>
                  ))}
                </ul>
                <p className="text-xs text-zinc-500 mb-4">Annual: $123.99 — <span className="text-emerald-400 font-medium">save 20%</span></p>
                <button onClick={onGetStarted} className="btn-sunrise w-full">
                  Enable Pro Engine <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 z-10 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto px-6 text-center"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Start planning your race.
            </span>
          </h2>
          <p className="text-zinc-400 text-base max-w-md mx-auto mb-8">
            Set up in under a minute. Free forever — upgrade when you want more.
          </p>
          <button onClick={onGetStarted} className="btn-sunrise text-base">
            Create free account <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 z-10 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <StreloMark />
              <span className="font-display font-bold text-lg tracking-tight">Strelo</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs">Build the plan your race demands. Smarter periodisation for age-group athletes.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms</button></li>
              <li><a href="mailto:support@strelo.app" className="hover:text-white transition-colors">support@strelo.app</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-8 text-xs text-zinc-600 font-mono flex justify-between items-center border-t border-white/5 pt-6">
          <span>© {new Date().getFullYear()} Strelo Training</span>
          <span>v2.0 · Pre-Dawn Protocol</span>
        </div>
      </footer>
    </div>
  )
}
