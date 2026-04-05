import React, { useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Waves, Bike, Footprints, Calendar, BarChart3, Zap, Target, Watch, BookOpen } from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage({ onGetStarted, onSignIn, onNavigate }) {
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/health').catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-rose-500 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-sm">Strelo</span>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <a href="#features" className="text-white/40 hover:text-white transition-colors hidden sm:block">Features</a>
            <a href="#pricing" className="text-white/40 hover:text-white transition-colors hidden sm:block">Pricing</a>
            <button onClick={onSignIn} className="text-white/50 hover:text-white transition-colors">Log in</button>
            <button onClick={onGetStarted} className="font-medium bg-rose-500 hover:bg-rose-400 px-3.5 py-1.5 rounded-md transition-colors">
              Sign up free
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-16 pb-10 sm:pt-24 sm:pb-16">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fade} className="flex items-center gap-2 mb-6">
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium">Swim</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 font-medium">Bike</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Run</span>
            </motion.div>
            <motion.h1 variants={fade} className="font-display text-4xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight">
              Build the plan<br />
              your race demands.
            </motion.h1>
            <motion.p variants={fade} className="text-white/45 mt-5 leading-relaxed max-w-md">
              Strelo structures your swim, bike, and run week around your race date,
              fitness level, and available hours. <span className="font-logo font-extrabold tracking-tight uppercase">Strelo<span className="text-rose-400">IQ</span></span> handles the periodisation.
            </motion.p>
            <motion.div variants={fade} className="flex items-center gap-3 mt-8">
              <motion.button onClick={onGetStarted} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="font-semibold bg-rose-500 hover:bg-rose-400 px-5 py-3 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
                Get started free <ArrowRight size={15} />
              </motion.button>
              <button onClick={onSignIn}
                className="font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-5 py-3 rounded-lg transition-colors text-sm">
                Log in
              </button>
            </motion.div>
            <motion.p variants={fade} className="text-xs text-white/25 mt-4">Free forever &middot; Syncs with Strava &middot; No credit card</motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 lg:mt-0"
          >
            <img src="/hero.webp" alt="Triathlon training" className="w-full rounded-xl" />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.p variants={fade} className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">How it works</motion.p>
            <motion.h2 variants={fade} className="font-display text-2xl font-bold mb-14">Three steps to race-ready.</motion.h2>

            <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
              {[
                { n: '01', title: 'Set your race', desc: 'Pick a distance and date. Strelo maps base, build, peak, and taper phases from day one.' },
                { n: '02', title: 'Build your week', desc: 'Drag sessions onto the calendar yourself, or let StreloIQ generate a balanced week for you.' },
                { n: '03', title: 'Train and adapt', desc: 'Log results, sync from Strava, and export structured workouts to your Garmin or COROS.' },
              ].map(({ n, title, desc }) => (
                <motion.div key={n} variants={fade}>
                  <p className="font-display text-3xl font-bold text-white/[0.06] mb-3">{n}</p>
                  <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features — asymmetric layout */}
      <section id="features" className="border-t border-white/5 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-5 pt-24 pb-20">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.p variants={fade} className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Features</motion.p>
            <motion.h2 variants={fade} className="font-display text-2xl font-bold mb-10">What you get.</motion.h2>
          </motion.div>

          {/* Main feature + supporting pair */}
          <div className="lg:grid lg:grid-cols-5 gap-4 mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              whileHover={{ y: -3 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 h-full hover:bg-white/[0.05] hover:border-white/[0.1] transition-colors">
                <Zap size={20} strokeWidth={1.5} className="text-violet-400 mb-3" />
                <h3 className="text-lg font-bold mb-2"><span className="font-logo font-extrabold tracking-tight uppercase">Strelo<span className="text-rose-400">IQ</span></span> writes your training week</h3>
                <p className="text-sm text-white/40 leading-relaxed max-w-md">
                  Tell it your goal race, available hours, and fitness level. It builds swim, bike, and run
                  sessions with the right mix of easy, tempo, and intervals — adjusted as your race approaches.
                </p>
              </div>
            </motion.div>
            <div className="lg:col-span-2 space-y-4 mt-4 lg:mt-0">
              {[
                { Icon: Calendar, color: 'text-blue-400', title: 'Drag-and-drop calendar', desc: 'Move sessions between days. Colour-coded by sport, filterable by week or month.' },
                { Icon: Watch, color: 'text-cyan-400', title: 'Export to your watch', desc: '.FIT files for Garmin, COROS, and Wahoo. Follow structured workouts on your wrist.' },
              ].map(({ Icon, color, title, desc }, i) => (
                <motion.div key={title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
                  whileHover={{ y: -3 }}
                >
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/[0.1] transition-colors">
                    <Icon size={18} strokeWidth={1.5} className={`${color} mb-2`} />
                    <h3 className="font-semibold text-sm mb-1">{title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Secondary features — compact row */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {[
              { Icon: Target, color: 'text-orange-400', title: 'Race periodisation', desc: 'Auto base, build, peak, taper' },
              { Icon: BarChart3, color: 'text-emerald-400', title: 'Volume trends', desc: 'Weekly hours, sport balance, RPE' },
              { Icon: BookOpen, color: 'text-rose-400', title: 'Strava sync', desc: 'Import activities automatically' },
            ].map(({ Icon, color, title, desc }) => (
              <motion.div key={title} variants={fade}
                className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3 hover:bg-white/[0.04] hover:border-white/[0.08] transition-colors">
                <Icon size={16} strokeWidth={1.5} className={`${color} shrink-0`} />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-white/35">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Device section */}
      <section className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
              <motion.p variants={fade} className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Works everywhere</motion.p>
              <motion.h2 variants={fade} className="font-display text-2xl font-bold mb-4">
                Your plan on every device.
              </motion.h2>
              <motion.p variants={fade} className="text-sm text-white/40 leading-relaxed mb-6">
                Strelo runs on desktop, tablet, and phone. Install it as a PWA for instant access.
                Export workouts to your watch and sync completed sessions from Strava.
              </motion.p>
              <motion.ul variants={fade} className="space-y-2.5 text-sm text-white/50">
                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Strava auto-sync</li>
                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> .FIT export to watch</li>
                <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PWA — install on phone</li>
              </motion.ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="mt-10 lg:mt-0 flex justify-center"
            >
              <img src="/mobile.webp" alt="Strelo on mobile" className="max-h-96 rounded-xl" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-white/5 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <div className="sm:flex items-start gap-12">
              <motion.div variants={fade} className="mb-8 sm:mb-0 sm:w-1/3">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Pricing</p>
                <h2 className="font-display text-xl font-bold">Free to start.<br />Pro when you're ready.</h2>
                <p className="text-sm text-white/40 mt-2">Most features work forever on Free. Pro unlocks StreloIQ and advanced stats.</p>
              </motion.div>
              <div className="sm:flex-1 grid sm:grid-cols-2 gap-4">
                <motion.div variants={fade}
                  className="border border-white/[0.08] rounded-xl p-5 bg-white/[0.02]">
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold text-sm">Free</p>
                    <p className="font-display font-bold text-lg">$0</p>
                  </div>
                  <p className="text-xs text-white/30 mt-3 leading-relaxed">Calendar, workout log, basic stats, 1 race, 3 templates, Strava sync</p>
                </motion.div>
                <motion.div variants={fade} whileHover={{ y: -3 }}
                  className="border border-rose-500/40 rounded-xl p-5 bg-rose-500/[0.04] relative">
                  <div className="absolute -top-2.5 right-4 bg-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full">POPULAR</div>
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold text-sm">Pro</p>
                    <p className="font-display font-bold text-lg">$12.99<span className="text-xs font-normal text-white/40">/mo</span></p>
                  </div>
                  <p className="text-xs text-white/30 mt-3 leading-relaxed">StreloIQ, volume trends, FIT/CSV export, unlimited races & templates, support chat</p>
                  <p className="text-xs text-white/30 mt-1.5">Annual: $123.99 <span className="text-emerald-400 font-medium">(save 20%)</span></p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="border-t border-white/5"
      >
        <div className="max-w-5xl mx-auto px-5 py-24 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Start planning your race.</h2>
          <p className="text-white/40 mt-3 max-w-sm mx-auto text-sm">Set up in under a minute. Free forever, upgrade when you want more.</p>
          <motion.button onClick={onGetStarted} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="mt-8 font-semibold bg-rose-500 hover:bg-rose-400 px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 text-sm">
            Create free account <ArrowRight size={15} />
          </motion.button>
        </div>
      </motion.section>

      {/* Contact */}
      <section id="contact" className="border-t border-white/5 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger}>
            <div className="sm:flex items-start gap-12">
              <motion.div variants={fade} className="mb-6 sm:mb-0 sm:w-1/3">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Contact</p>
                <h2 className="font-display text-xl font-bold">Get in touch</h2>
                <p className="text-sm text-white/40 mt-2">Questions, feedback, or partnership enquiries.</p>
              </motion.div>
              <motion.div variants={fade} className="sm:flex-1 space-y-3">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
                  <p className="text-sm font-medium mb-1">Email</p>
                  <a href="mailto:support@strelo.app" className="text-sm text-rose-400 hover:text-rose-300 transition-colors">support@strelo.app</a>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
                  <p className="text-sm font-medium mb-1">Partnerships</p>
                  <p className="text-sm text-white/40">Strava clubs, coaches, race organisers — reach out via email.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-6 flex items-center justify-between text-xs text-white/25">
          <span>&copy; {new Date().getFullYear()} Strelo</span>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('privacy')} className="hover:text-white/50 transition-colors">Privacy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-white/50 transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
