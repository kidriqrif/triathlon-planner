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
      <h1 className="text-2xl font-extrabold text-slate-900">
        {isPro ? 'You\'re on Pro' : 'Upgrade to Pro'}
      </h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        {isPro ? 'All premium features are unlocked.' : 'Unlock StreloIQ and let the engine write your training week.'}
      </p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
          <AlertCircle size={16} strokeWidth={1.5} />
          {error}
        </div>
      )}

      {isPro ? (
        <div className="border border-slate-200 rounded-xl p-6">
          <p className="font-bold text-slate-900">Pro Plan Active</p>
          <p className="text-sm text-slate-500 mt-1">You have access to all features including StreloIQ.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="border border-slate-200 rounded-xl p-6">
            <p className="text-sm font-bold text-slate-900">Free</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">$0</p>
            <p className="text-sm text-slate-400 mb-5">No limits, no expiry</p>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={15} strokeWidth={2.5} className="text-slate-400 mt-0.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button disabled
              className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-400 cursor-default">
              Current plan
            </button>
          </div>

          <div className="border-2 border-slate-900 rounded-xl p-6">
            <p className="text-sm font-bold text-slate-900">Pro</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-extrabold text-slate-900">$12.99</p>
              <p className="text-sm text-slate-400">/mo</p>
            </div>
            <p className="text-sm text-slate-400 mb-5">or $123.99/yr <span className="text-emerald-600 font-semibold">(save 20%)</span></p>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={15} strokeWidth={2.5} className="text-slate-900 mt-0.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <button onClick={() => handleUpgrade('monthly')} disabled={!!loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50">
                {loading === 'monthly' ? 'Redirecting...' : 'Monthly — $12.99/mo'}
              </button>
              <button onClick={() => handleUpgrade('yearly')} disabled={!!loading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:border-slate-300 transition-colors disabled:opacity-50">
                {loading === 'yearly' ? 'Redirecting...' : 'Yearly — $123.99/yr'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
