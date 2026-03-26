import React, { useState } from 'react'
import { register, login, forgotPassword, resetPassword } from '../api'
import { Mail, Lock, User, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all bg-white'

export default function AuthPage({ onAuth, resetToken }) {
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login') // 'login' | 'register' | 'forgot' | 'reset'
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'forgot') {
        const res = await forgotPassword(form.email)
        setSuccess(res.message)
        setLoading(false)
        return
      }

      if (mode === 'reset') {
        if (form.password !== form.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }
        const res = await resetPassword(resetToken, form.password)
        setSuccess(res.message)
        setTimeout(() => { setMode('login'); setSuccess(null) }, 2000)
        setLoading(false)
        return
      }

      if (mode === 'register' && form.password !== form.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      const res = mode === 'register'
        ? await register({ email: form.email, password: form.password, name: form.name })
        : await login({ email: form.email, password: form.password })

      localStorage.setItem('strelo_token', res.token)
      localStorage.setItem('strelo_user', JSON.stringify(res.user))
      onAuth(res.user)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m) => { setMode(m); setError(null); setSuccess(null) }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Strelo</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered triathlon training</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {/* Tab toggle — only for login/register */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button onClick={() => switchMode('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}>
                Sign In
              </button>
              <button onClick={() => switchMode('register')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}>
                Create Account
              </button>
            </div>
          )}

          {/* Forgot password header */}
          {mode === 'forgot' && (
            <div className="mb-5">
              <button onClick={() => switchMode('login')}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-3">
                <ArrowLeft size={14} /> Back to sign in
              </button>
              <h2 className="text-lg font-bold text-slate-800">Forgot password</h2>
              <p className="text-sm text-slate-400 mt-1">Enter your email and we'll send a reset link</p>
            </div>
          )}

          {/* Reset password header */}
          {mode === 'reset' && (
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">Set new password</h2>
              <p className="text-sm text-slate-400 mt-1">Enter your new password below</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2.5 mb-4">
              <AlertCircle size={16} strokeWidth={1.5} className="shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 text-sm rounded-xl px-3 py-2.5 mb-4">
              <CheckCircle size={16} strokeWidth={1.5} className="shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={form.name} onChange={set('name')} required placeholder="Full name" className={inputCls} />
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div className="relative">
                <Mail size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" value={form.email} onChange={set('email')} required placeholder="Email address" className={inputCls} />
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <div className="relative">
                <Lock size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={form.password} onChange={set('password')} required minLength={6}
                  placeholder={mode === 'reset' ? 'New password' : 'Password'} className={inputCls} />
              </div>
            )}

            {(mode === 'register' || mode === 'reset') && (
              <div className="relative">
                <Lock size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required minLength={6}
                  placeholder="Confirm password" className={inputCls} />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <>
                  {{ login: 'Sign In', register: 'Create Account', forgot: 'Send Reset Link', reset: 'Reset Password' }[mode]}
                  <ArrowRight size={16} strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          {/* Forgot password link */}
          {mode === 'login' && (
            <button onClick={() => switchMode('forgot')}
              className="block w-full text-center text-xs text-slate-400 hover:text-indigo-500 mt-3 transition-colors">
              Forgot your password?
            </button>
          )}
        </div>

        {(mode === 'login' || mode === 'register') && (
          <p className="text-center text-xs text-slate-400 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-indigo-500 font-semibold hover:underline">
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
