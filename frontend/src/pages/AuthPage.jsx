import React, { useState, useEffect } from 'react'
import { register, login, forgotPassword, resetPassword } from '../api'
import { Mail, Lock, User, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all bg-white'

export default function AuthPage({ onAuth, resetToken }) {
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login') // 'login' | 'register' | 'forgot' | 'reset'
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Wake up backend while user types credentials
  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/health').catch(() => {})
  }, [])
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.25)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Strelo</h1>
        </div>

        {/* Card */}
        <div className="border border-slate-200 rounded-lg p-5">
          {/* Tab toggle — only for login/register */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex border-b border-slate-200 mb-5 -mt-1">
              <button onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'login' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                Sign in
              </button>
              <button onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  mode === 'register' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                Create account
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
              className="w-full py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
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
