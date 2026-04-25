import React, { useState } from 'react'
import { Waves, Bike, Footprints, Layers, BookOpen } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

const SPORT_CONFIG = {
  swim:  { Icon: Waves,      label: 'Swim',  color: 'text-blue-500',    bg: 'bg-blue-500/10 dark:bg-blue-500/20',   border: 'border-blue-500/20'   },
  bike:  { Icon: Bike,       label: 'Bike',  color: 'text-orange-500',  bg: 'bg-orange-500/10 dark:bg-orange-500/20', border: 'border-orange-500/20' },
  run:   { Icon: Footprints, label: 'Run',   color: 'text-emerald-500', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', border: 'border-emerald-500/20' },
  brick: { Icon: Layers,     label: 'Brick', color: 'text-violet-500',  bg: 'bg-violet-500/10 dark:bg-violet-500/20', border: 'border-violet-500/20' },
}

const TYPE_LABELS = {
  easy: 'Easy', tempo: 'Tempo', interval: 'Interval', long: 'Long', recovery: 'Recovery',
  strength: 'Strength', mobility: 'Mobility', hiit: 'HIIT', circuit: 'Circuit', yoga: 'Yoga',
}

const FILTERS = [
  { key: 'all',  tKey: 'all'  },
  { key: 'swim', tKey: 'swim' },
  { key: 'bike', tKey: 'bike' },
  { key: 'run',  tKey: 'run'  },
]

export default function JournalPage({ workouts }) {
  const { t } = useI18n()
  const [filter, setFilter] = useState('all')

  // Only workouts with non-empty notes, sorted by date descending
  const withNotes = [...workouts]
    .filter(w => w.notes && w.notes.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date))

  const filtered = filter === 'all'
    ? withNotes
    : withNotes.filter(w => w.sport === filter)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">{t('trainingNotes')}</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">
          {withNotes.length} {withNotes.length === 1 ? t('entryWithNotes') : t('entriesWithNotes')}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map(({ key, tKey }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
              filter === key
                ? 'bg-slate-800 dark:bg-orange-600 text-white border-slate-800 dark:border-orange-600'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}>
            {t(tKey)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <div className="flex justify-center mb-4">
            <BookOpen size={48} strokeWidth={1} className="text-slate-200 dark:text-slate-700" />
          </div>
          <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">{t('noNotesYet')}</p>
          <p className="text-sm mt-1">{t('noNotesDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(w => {
            const sport = SPORT_CONFIG[w.sport] || SPORT_CONFIG.run
            const SportIcon = sport.Icon

            return (
              <div key={w.id}
                className="vista-panel rounded-xl overflow-hidden">
                {/* Entry header */}
                <div className="px-4 pt-4 pb-2 flex items-center gap-3">
                  {/* Sport icon */}
                  <div className={`w-8 h-8 rounded-lg ${sport.bg} ${sport.border} border flex items-center justify-center shrink-0`}>
                    <SportIcon size={16} strokeWidth={1.5} className={sport.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${sport.color}`}>{sport.label}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">
                        {TYPE_LABELS[w.workout_type] || w.workout_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(w.date + 'T12:00:00').toLocaleDateString('en-GB', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Notes body */}
                <div className="px-4 pb-4 pt-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {w.notes}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
