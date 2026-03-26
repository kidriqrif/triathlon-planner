import React, { useState } from 'react'
import { updateName, changePassword, deleteAccount } from '../api'
import { User, Lock, Trash2, AlertCircle, CheckCircle } from 'lucide-react'

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all bg-white'

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
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
