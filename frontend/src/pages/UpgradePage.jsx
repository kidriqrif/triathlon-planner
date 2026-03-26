import React, { useState } from 'react'
import { createCheckout } from '../api'
import { Check, Sparkles, Zap, AlertCircle } from 'lucide-react'

const FREE_FEATURES = [
  'Log workouts & races',
  'Calendar view',
  'Dashboard stats',
  'Basic athlete profile',
]

const PRO_FEATURES = [
  'Everything in Free',
  'StreloIQ — personalised weekly plans',
  'Advanced analytics & trends',
  'Unlimited race tracking',
  'Priority support',
]

export default function UpgradePage({ user, onPlanChange }) {
  const [loading, setLoading] = useState(null) // 'monthly' | 'yearly'
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
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-black text-slate-800">
          {isPro ? 'You\'re on Pro' : 'Upgrade to Pro'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isPro
            ? 'You have access to all premium features'
            : 'Unlock StreloIQ and advanced features'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
          <AlertCircle size={16} strokeWidth={1.5} />
          {error}
        </div>
      )}

      {isPro ? (
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white text-center">
          <Sparkles size={32} strokeWidth={1.5} className="mx-auto mb-3 opacity-80" />
          <p className="font-bold text-lg">Pro Plan Active</p>
          <p className="text-white/70 text-sm mt-1">All premium features are unlocked</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Free tier */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Free</p>
            <p className="text-3xl font-black text-slate-800 mt-2">$0</p>
            <p className="text-slate-400 text-sm">Forever</p>
            <ul className="mt-5 space-y-2.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check size={16} strokeWidth={2} className="text-slate-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button disabled
              className="w-full mt-6 py-2.5 rounded-xl text-sm font-bold border-2 border-slate-200 text-slate-400 cursor-default">
              Current Plan
            </button>
          </div>

          {/* Pro tier */}
          <div className="bg-white rounded-2xl border-2 border-indigo-400 shadow-sm p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Recommended
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Pro</p>
              <Zap size={14} strokeWidth={2} className="text-indigo-500" />
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <div>
                <p className="text-3xl font-black text-slate-800">$12.99</p>
                <p className="text-slate-400 text-sm">/month</p>
              </div>
              <div className="text-slate-300">|</div>
              <div>
                <p className="text-2xl font-black text-slate-800">$123.99</p>
                <p className="text-slate-400 text-sm">/year <span className="text-emerald-500 font-bold">Save 20%</span></p>
              </div>
            </div>

            <ul className="mt-5 space-y-2.5">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check size={16} strokeWidth={2} className="text-indigo-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => handleUpgrade('monthly')}
                disabled={!!loading}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-all shadow-sm disabled:opacity-60">
                {loading === 'monthly' ? 'Redirecting...' : 'Get Monthly — $12.99/mo'}
              </button>
              <button
                onClick={() => handleUpgrade('yearly')}
                disabled={!!loading}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400 transition-all disabled:opacity-60">
                {loading === 'yearly' ? 'Redirecting...' : 'Get Yearly — $123.99/yr'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
