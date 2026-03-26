import React, { useState } from 'react'
import { createRace, updateRace, deleteRace } from '../api'
import { Activity, Footprints, Bike, Waves, Medal, Flag } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

// ─── Race category config ────────────────────────────────────────────────────

const RACE_CATEGORIES = {
  triathlon: {
    label: 'Triathlon', Icon: Activity,
    gradient: 'from-indigo-500 to-violet-600',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    types: {
      sprint:  'Sprint  ·  750m / 20km / 5km',
      olympic: 'Olympic  ·  1.5km / 40km / 10km',
      '70.3':  '70.3 Half  ·  1.9km / 90km / 21km',
      ironman: 'Full Ironman  ·  3.8km / 180km / 42km',
    },
  },
  running: {
    label: 'Running', Icon: Footprints,
    gradient: 'from-green-400 to-emerald-600',
    badge: 'bg-green-100 text-green-700 border-green-200',
    types: {
      '5k':           '5K',
      '10k':          '10K',
      half_marathon:  'Half Marathon  ·  21.1km',
      marathon:       'Marathon  ·  42.2km',
      ultra:          'Ultramarathon',
      trail:          'Trail Run',
      road_race:      'Road Race',
      cross_country:  'Cross Country',
    },
  },
  cycling: {
    label: 'Cycling', Icon: Bike,
    gradient: 'from-orange-400 to-amber-500',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    types: {
      criterium:  'Criterium',
      road_race:  'Road Race',
      time_trial: 'Time Trial',
      gran_fondo: 'Gran Fondo / Sportive',
      track:      'Track Race',
      mtb:        'Mountain Bike',
      cyclocross: 'Cyclocross',
    },
  },
  swimming: {
    label: 'Swimming', Icon: Waves,
    gradient: 'from-blue-400 to-cyan-500',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    types: {
      '50m':       '50m Sprint',
      '100m':      '100m',
      '200m':      '200m',
      '400m':      '400m',
      '800m':      '800m',
      '1500m':     '1500m',
      open_water:  'Open Water  ·  1.5km',
      ow_5k:       'Open Water  ·  5K',
    },
  },
  other: {
    label: 'Other', Icon: Medal,
    gradient: 'from-violet-400 to-purple-600',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    types: {
      duathlon:  'Duathlon',
      aquathlon: 'Aquathlon',
      xterra:    'XTERRA Off-Road Tri',
      custom:    'Custom Event',
    },
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDistance(distance) {
  if (!distance) return { category: 'triathlon', type: 'olympic' }
  if (distance.includes(':')) {
    const [cat, type] = distance.split(':')
    return { category: cat, type }
  }
  // legacy triathlon values (sprint, olympic, 70.3, ironman)
  return { category: 'triathlon', type: distance }
}

function raceTypeLabel(distance) {
  const { category, type } = parseDistance(distance)
  const cat = RACE_CATEGORIES[category]
  const raw = cat?.types[type] || type
  return raw.split('·')[0].trim()  // strip the detail after ·
}

function raceCategoryMeta(distance) {
  const { category } = parseDistance(distance)
  return RACE_CATEGORIES[category] || RACE_CATEGORIES.triathlon
}

// ─── Race Form ────────────────────────────────────────────────────────────────

function RaceForm({ race, onSave, onClose }) {
  const { t } = useI18n()
  const parsed = parseDistance(race?.distance)
  const [category, setCategory] = useState(parsed.category)
  const [form, setForm] = useState({
    name: race?.name ?? '',
    date: race?.date ?? '',
    type: parsed.type,
    is_active: race?.is_active ?? true,
  })

  const catMeta = RACE_CATEGORIES[category]
  const types = Object.entries(catMeta.types)

  // Reset type when category changes
  const handleCategoryChange = (cat) => {
    setCategory(cat)
    setForm(f => ({ ...f, type: Object.keys(RACE_CATEGORIES[cat].types)[0] }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ name: form.name, date: form.date, distance: `${category}:${form.type}`, is_active: form.is_active })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${catMeta.gradient} rounded-t-3xl px-6 py-5 flex items-center justify-between`}>
          <div>
            <p className="text-white font-black text-xl">{race ? t('editRace') : t('addRaceTitle')}</p>
            <div className="flex items-center gap-1.5 text-white/70 text-sm mt-0.5">
              <catMeta.Icon size={13} strokeWidth={1.5} />
              <span>{catMeta.label}</span>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xl leading-none transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Race name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('raceName')}</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              placeholder="e.g. City Olympic Tri 2025"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('raceDate')}</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
          </div>

          {/* Category tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('sport')}</label>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.entries(RACE_CATEGORIES).map(([key, meta]) => (
                <button key={key} type="button" onClick={() => handleCategoryChange(key)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all ${
                    category === key
                      ? `bg-gradient-to-b ${meta.gradient} text-white border-transparent shadow-md`
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}>
                  <meta.Icon size={16} strokeWidth={1.5} />
                  <span className="leading-tight text-center">{meta.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event type */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('event')}</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {types.map(([key, label]) => (
                <button key={key} type="button"
                  onClick={() => setForm(f => ({ ...f, type: key }))}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                    form.type === key
                      ? `border-transparent bg-gradient-to-r ${catMeta.gradient} text-white shadow-sm`
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="sr-only" />
              <div className={`w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-indigo-500' : 'bg-slate-200'}`} />
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-semibold text-slate-700">{t('setAsGoal')}</span>
          </label>

          <button type="submit"
            className={`w-full bg-gradient-to-r ${catMeta.gradient} text-white font-bold py-3 rounded-2xl shadow-sm hover:opacity-90 transition-opacity`}>
            {race ? t('saveChanges') : t('addRaceTitle')}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Race Card ────────────────────────────────────────────────────────────────

function RaceCard({ race, onEdit, onDelete, onToggleActive }) {
  const { t } = useI18n()
  const daysToRace = Math.ceil((new Date(race.date + 'T12:00:00') - new Date()) / 86400000)
  const meta = raceCategoryMeta(race.distance)
  const typeLabel = raceTypeLabel(race.distance)

  const countdownText = daysToRace > 0
    ? `${daysToRace} ${t('daysToGo')}`
    : daysToRace === 0 ? t('raceDay') : `${Math.abs(daysToRace)} ${t('daysAgo')}`

  const countdownColor = daysToRace < 0 ? 'text-slate-400' : daysToRace <= 14 ? 'text-orange-500' : 'text-indigo-600'

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${
      race.is_active ? 'border-indigo-200 shadow-indigo-100 shadow-md' : 'border-slate-100'
    }`}>
      {/* Top colour bar */}
      <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />

      <div className="p-5 flex items-center gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shrink-0`}>
          <meta.Icon size={22} strokeWidth={1.5} className="text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-black text-slate-800 text-base">{race.name}</p>
            {race.is_active && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                {t('goalRace')}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{meta.label} · {typeLabel} · {race.date}</p>
          <p className={`text-sm font-bold mt-1 ${countdownColor}`}>{countdownText}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button onClick={() => onToggleActive(race)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
              race.is_active
                ? 'border-slate-200 text-slate-500 hover:bg-slate-50'
                : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
            }`}>
            {race.is_active ? t('deactivate') : t('setGoal')}
          </button>
          <button onClick={() => onEdit(race)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold transition-colors">
            {t('edit')}
          </button>
          <button onClick={() => onDelete(race.id)}
            className="text-xs px-3 py-1.5 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 font-semibold transition-colors">
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RacesPage({ races, onRefresh }) {
  const { t } = useI18n()
  const [formState, setFormState] = useState(null)
  const [filterCat, setFilterCat] = useState('all')

  const handleSave = async (payload) => {
    if (formState?.race) await updateRace(formState.race.id, payload)
    else await createRace(payload)
    setFormState(null)
    onRefresh()
  }

  const handleDelete = async (id) => {
    if (!confirm(t('deleteRaceConfirm'))) return
    await deleteRace(id)
    onRefresh()
  }

  const handleToggleActive = async (race) => {
    await updateRace(race.id, { is_active: !race.is_active })
    onRefresh()
  }

  const filtered = filterCat === 'all'
    ? races
    : races.filter(r => parseDistance(r.distance).category === filterCat)

  const categoryKeys = ['all', ...Object.keys(RACE_CATEGORIES)]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{t('races')}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{races.length} {t('racesPlanned')}</p>
        </div>
        <button onClick={() => setFormState({ race: null })}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          {t('addRace')}
        </button>
      </div>

      {/* Category filter */}
      {races.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryKeys.map(key => {
            const meta = RACE_CATEGORIES[key]
            return (
              <button key={key} onClick={() => setFilterCat(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 shrink-0 transition-all ${
                  filterCat === key
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}>
                {key === 'all'
                  ? <><Flag size={12} strokeWidth={1.5} /> {t('filterAll')}</>
                  : <><meta.Icon size={12} strokeWidth={1.5} /> {meta.label}</>
                }
              </button>
            )
          })}
        </div>
      )}

      {/* Race list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="flex justify-center mb-4">
            <Flag size={48} strokeWidth={1} className="text-slate-200" />
          </div>
          <p className="text-lg font-semibold text-slate-500">{t('noRacesYet')}</p>
          <p className="text-sm mt-1">{t('noRacesDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(race => (
            <RaceCard key={race.id} race={race}
              onEdit={(r) => setFormState({ race: r })}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive} />
          ))}
        </div>
      )}

      {formState !== null && (
        <RaceForm race={formState.race} onSave={handleSave} onClose={() => setFormState(null)} />
      )}
    </div>
  )
}
