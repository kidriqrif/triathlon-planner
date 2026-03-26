import React, { useState, useEffect } from 'react'
import { updateName, changePassword, deleteAccount, getStravaConnectUrl, getStravaStatus, disconnectStrava, syncStrava } from '../api'
import { User, Lock, Trash2, AlertCircle, CheckCircle, Link, Unlink, RefreshCw } from 'lucide-react'

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all bg-white'

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-slate-800">{title}</h3>
      {children}
    </div>
  )
}

function Alert({ type, message }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 ${
      isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
    }`}>
      {isError ? <AlertCircle size={16} strokeWidth={1.5} className="shrink-0" /> : <CheckCircle size={16} strokeWidth={1.5} className="shrink-0" />}
      {message}
    </div>
  )
}

export default function SettingsPage({ user, onUserUpdate, onLogout }) {
  // Name
  const [name, setName] = useState(user.name)
  const [nameMsg, setNameMsg] = useState(null)
  const [nameSaving, setNameSaving] = useState(false)

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState(null)
  const [pwSaving, setPwSaving] = useState(false)

  // Strava
  const [stravaConnected, setStravaConnected] = useState(false)
  const [stravaSyncing, setStravaSyncing] = useState(false)
  const [stravaMsg, setStravaMsg] = useState(null)

  useEffect(() => {
    getStravaStatus().then(s => setStravaConnected(s.connected)).catch(() => {})
  }, [])

  const handleStravaConnect = async () => {
    try {
      const { url } = await getStravaConnectUrl()
      window.location.href = url
    } catch { setStravaMsg({ type: 'error', message: 'Failed to start Strava connection' }) }
  }

  const handleStravaDisconnect = async () => {
    try {
      await disconnectStrava()
      setStravaConnected(false)
      setStravaMsg({ type: 'success', message: 'Strava disconnected' })
    } catch { setStravaMsg({ type: 'error', message: 'Failed to disconnect' }) }
  }

  const handleStravaSync = async () => {
    setStravaSyncing(true)
    setStravaMsg(null)
    try {
      const res = await syncStrava()
      setStravaMsg({ type: 'success', message: `Imported ${res.imported} activities from Strava` })
    } catch (err) {
      setStravaMsg({ type: 'error', message: err.response?.data?.detail || 'Sync failed' })
    }
    setStravaSyncing(false)
  }

  // Delete
  const [deletePw, setDeletePw] = useState('')
  const [deleteMsg, setDeleteMsg] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const handleNameSave = async () => {
    setNameMsg(null)
    setNameSaving(true)
    try {
      const updated = await updateName(name)
      onUserUpdate(updated)
      setNameMsg({ type: 'success', message: 'Name updated' })
    } catch (err) {
      setNameMsg({ type: 'error', message: err.response?.data?.detail || 'Failed to update' })
    }
    setNameSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwMsg(null)
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', message: 'Passwords do not match' })
      return
    }
    setPwSaving(true)
    try {
      await changePassword(currentPw, newPw)
      setPwMsg({ type: 'success', message: 'Password updated' })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (err) {
      setPwMsg({ type: 'error', message: err.response?.data?.detail || 'Failed to update' })
    }
    setPwSaving(false)
  }

  const handleDelete = async () => {
    setDeleteMsg(null)
    setDeleting(true)
    try {
      await deleteAccount(deletePw)
      onLogout()
    } catch (err) {
      setDeleteMsg({ type: 'error', message: err.response?.data?.detail || 'Failed to delete' })
    }
    setDeleting(false)
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <h1 className="text-2xl font-black text-slate-800">Account Settings</h1>

      {/* Name */}
      <Section title="Profile">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Name</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <User size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all bg-white" />
            </div>
            <button onClick={handleNameSave} disabled={nameSaving || name === user.name}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-40">
              {nameSaving ? '...' : 'Save'}
            </button>
          </div>
        </div>
        {nameMsg && <Alert {...nameMsg} />}
        <div>
          <label className="text-xs font-semibold text-slate-500">Plan</label>
          <p className="text-sm text-slate-600 capitalize">{user.plan}</p>
        </div>
      </Section>

      {/* Password */}
      <Section title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="relative">
            <Lock size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
              required placeholder="Current password" className={inputCls} />
          </div>
          <div className="relative">
            <Lock size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              required minLength={6} placeholder="New password" className={inputCls} />
          </div>
          <div className="relative">
            <Lock size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              required minLength={6} placeholder="Confirm new password" className={inputCls} />
          </div>
          {pwMsg && <Alert {...pwMsg} />}
          <button type="submit" disabled={pwSaving}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors disabled:opacity-40">
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* Delete Account */}
      {/* Strava */}
      <Section title="Connected Apps">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#FC4C02">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Strava</p>
              <p className="text-xs text-slate-400">
                {stravaConnected ? 'Connected — auto-import activities' : 'Import completed workouts'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {stravaConnected ? (
              <>
                <button onClick={handleStravaSync} disabled={stravaSyncing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 border border-indigo-200 hover:border-indigo-400 transition-all disabled:opacity-40">
                  <RefreshCw size={13} strokeWidth={2} className={stravaSyncing ? 'animate-spin' : ''} />
                  {stravaSyncing ? 'Syncing...' : 'Sync'}
                </button>
                <button onClick={handleStravaDisconnect}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 border border-red-200 hover:border-red-400 transition-all">
                  <Unlink size={13} strokeWidth={2} /> Disconnect
                </button>
              </>
            ) : (
              <button onClick={handleStravaConnect}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#FC4C02] hover:opacity-90 transition-all">
                <Link size={13} strokeWidth={2} /> Connect Strava
              </button>
            )}
          </div>
        </div>
        {stravaMsg && <Alert {...stravaMsg} />}
      </Section>

      <Section title="Danger Zone">
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
            <Trash2 size={16} strokeWidth={1.5} />
            Delete my account
          </button>
        ) : (
          <div className="space-y-3 bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-600 font-semibold">
              This will permanently delete your account and all training data. This cannot be undone.
            </p>
            <div className="relative">
              <Lock size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
              <input type="password" value={deletePw} onChange={e => setDeletePw(e.target.value)}
                placeholder="Enter your password to confirm"
                className="w-full border border-red-200 rounded-xl px-3 py-2.5 pl-10 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all bg-white" />
            </div>
            {deleteMsg && <Alert {...deleteMsg} />}
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting || !deletePw}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-40">
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
              <button onClick={() => { setShowDelete(false); setDeletePw(''); setDeleteMsg(null) }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}
