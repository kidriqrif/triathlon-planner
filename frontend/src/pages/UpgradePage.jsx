import React, { useState } from 'react'
import { createCheckout } from '../api'
import { Check, AlertCircle } from 'lucide-react'

const FREE_FEATURES = [
  'Log unlimited workouts',
  'Training calendar',
  'Basic dashboard stats',
  '1 active race',
  '3 saved workout templates',
]

const PRO_FEATURES = [
  'Everything in Free, plus:',
  'StreloIQ — auto-generated weekly plans',
  'Weekly volume trends & RPE analysis',
  'FIT export to Garmin / COROS / Wahoo',
  'CSV data export',
  'Unlimited races & templates',
  'Auto Strava sync on login',
  'Priority support chat',
]

export default function UpgradePage({ user }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const handleUpgrade = async (plan) => {
    setLoading(plan)
    setError(null)
    try {
      const { checkout_url } = await createCheckout(plan)
      window.location.href = checkout_url
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start checkout')
      setLoading(null)
    }
  }

  const isPro = user?.plan === 'pro'

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        {isPro ? 'You\'re on Pro' : 'Upgrade to Pro'}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">
        {isPro ? 'All premium features are unlocked.' : <>Unlock <span className="font-logo font-extrabold tracking-wide uppercase">Strelo<span className="text-rose-500">IQ</span></span> and let the engine write your training week.</>}
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-3">
          <AlertCircle size={16} strokeWidth={1.5} />
          {error}
        </div>
      )}

      {isPro ? (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
          <p className="font-bold text-slate-900 dark:text-white">Pro Plan Active</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">You have access to all features including <span className="font-logo font-extrabold tracking-wide uppercase">Strelo<span className="text-rose-500">IQ</span></span>.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Free</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">$0</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">No limits, no expiry</p>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={15} strokeWidth={2.5} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button disabled
              className="w-full mt-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-default">
              Current plan
            </button>
          </div>

          <div className="border-2 border-rose-500 rounded-xl p-4 bg-white dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Pro</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">$12.99</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">/mo</p>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">or $123.99/yr <span className="text-emerald-500 font-semibold">(save 20%)</span></p>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={15} strokeWidth={2.5} className="text-rose-500 mt-0.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <button onClick={() => handleUpgrade('monthly')} disabled={!!loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-rose-500 text-white hover:bg-rose-400 transition-colors disabled:opacity-50">
                {loading === 'monthly' ? 'Redirecting...' : 'Monthly — $12.99/mo'}
              </button>
              <button onClick={() => handleUpgrade('yearly')} disabled={!!loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors disabled:opacity-50">
                {loading === 'yearly' ? 'Redirecting...' : 'Yearly — $123.99/yr'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
