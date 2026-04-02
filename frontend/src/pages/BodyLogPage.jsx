import React, { useState, useEffect, useMemo } from 'react'
import { getBodyLogs, createBodyLog, deleteBodyLog } from '../api'
import { Heart, Scale, Moon, Trash2, Plus } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import useDark from '../utils/useDark'
import { useI18n } from '../i18n/I18nContext'

const inputCls = 'w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white'

const QUALITY_LABELS = ['', 'Poor', 'Fair', 'OK', 'Good', 'Great']

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function BodyLogPage() {
  const dark = useDark()
  const { t } = useI18n()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: todayStr(),
    weight_kg: '',
    resting_hr: '',
    sleep_hours: '',
    sleep_quality: '',
    notes: '',
  })

  const fetchLogs = async () => {
    try {
      const data = await getBodyLogs()
      setLogs(data)
    } catch (e) {
      console.error('Failed to load body logs:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createBodyLog({
        date: form.date,
        weight_kg: form.weight_kg !== '' ? parseFloat(form.weight_kg) : null,
        resting_hr: form.resting_hr !== '' ? parseInt(form.resting_hr) : null,
        sleep_hours: form.sleep_hours !== '' ? parseFloat(form.sleep_hours) : null,
        sleep_quality: form.sleep_quality !== '' ? parseInt(form.sleep_quality) : null,
        notes: form.notes || null,
      })
      setForm({ date: todayStr(), weight_kg: '', resting_hr: '', sleep_hours: '', sleep_quality: '', notes: '' })
      await fetchLogs()
    } catch (err) {
      console.error('Failed to save body log:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('deleteEntryConfirm'))) return
    try {
      await deleteBodyLog(id)
      await fetchLogs()
    } catch (err) {
      console.error('Failed to delete body log:', err)
    }
  }

  // Chart data — weight over time, sorted ascending by date
  const chartData = useMemo(() => {
    return logs
      .filter(l => l.weight_kg != null)
      .map(l => ({ date: l.date, weight: l.weight_kg }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [logs])

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('bodyLog')}</h1>
        <p className="text-slate-400 text-sm mt-0.5">{t('trackBodyMetrics')}</p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Plus size={16} strokeWidth={2} className="text-indigo-500" />
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('newEntry')}</p>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t('date')}</label>
          <input type="date" value={form.date} onChange={set('date')} required
            className={inputCls} />
        </div>

        {/* Weight + HR row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              <Scale size={12} className="inline mr-1" />{t('weightKg')}
            </label>
            <input type="number" min="20" max="300" step="0.1" value={form.weight_kg} onChange={set('weight_kg')}
              placeholder="—" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              <Heart size={12} className="inline mr-1" />{t('restingHr')}
            </label>
            <input type="number" min="20" max="200" value={form.resting_hr} onChange={set('resting_hr')}
              placeholder="—" className={inputCls} />
          </div>
        </div>

        {/* Sleep row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              <Moon size={12} className="inline mr-1" />{t('sleepHours')}
            </label>
            <input type="number" min="0" max="24" step="0.25" value={form.sleep_hours} onChange={set('sleep_hours')}
              placeholder="—" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t('sleepQuality')}</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(q => (
                <button key={q} type="button"
                  onClick={() => setForm(f => ({ ...f, sleep_quality: f.sleep_quality === String(q) ? '' : String(q) }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    form.sleep_quality === String(q)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  title={QUALITY_LABELS[q]}>
                  {q}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {form.sleep_quality ? QUALITY_LABELS[parseInt(form.sleep_quality)] : t('sleepQualityHint')}
            </p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t('notes')}</label>
          <textarea value={form.notes} onChange={set('notes')} rows={2}
            placeholder={t('howAreYouFeeling')}
            className={inputCls + ' resize-none'} />
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-xl font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors disabled:opacity-50">
          {saving ? t('saving') : t('logEntry')}
        </button>
      </form>

      {/* Weight chart */}
      {chartData.length >= 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('weightTrend')}</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }}
                tickFormatter={(v) => {
                  const d = new Date(v + 'T12:00:00')
                  return `${d.getDate()}/${d.getMonth() + 1}`
                }} />
              <YAxis tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} unit=" kg" domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip
                labelFormatter={(v) => v}
                formatter={(v) => [`${v} kg`, 'Weight']}
                contentStyle={{ background: dark ? '#1e293b' : '#fff', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: dark ? '#94a3b8' : '#64748b' }} />
              <Line type="monotone" dataKey="weight" name="Weight" stroke="#6366f1" strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log entries table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('recentEntries')}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t('last90Days')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-slate-400 text-sm">{t('loading')}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="flex justify-center mb-3">
              <Scale size={40} strokeWidth={1} className="text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('noEntriesYet')}</p>
            <p className="text-xs mt-1">{t('noEntriesDesc')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-5 py-3">{t('date')}</th>
                  <th className="text-left px-3 py-3">{t('weight')}</th>
                  <th className="text-left px-3 py-3">{t('hr')}</th>
                  <th className="text-left px-3 py-3">{t('sleep')}</th>
                  <th className="text-left px-3 py-3">{t('quality')}</th>
                  <th className="text-left px-3 py-3">{t('notes')}</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{log.date}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                      {log.weight_kg != null ? `${log.weight_kg} kg` : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                      {log.resting_hr != null ? `${log.resting_hr} bpm` : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                      {log.sleep_hours != null ? `${log.sleep_hours}h` : '—'}
                    </td>
                    <td className="px-3 py-3">
                      {log.sleep_quality != null ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          log.sleep_quality >= 4
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : log.sleep_quality >= 3
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {log.sleep_quality}/5
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {log.notes || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => handleDelete(log.id)}
                        className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title={t('deleteEntry')}>
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
