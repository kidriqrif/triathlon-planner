import React, { useState } from 'react'

const BRICK_SPORTS = {
  swim:       { icon: '🏊', label: 'Swim',       bg: 'bg-blue-50',    border: 'border-blue-300',    header: 'bg-blue-100',    distUnit: 'm',  distStep: 50,  distPlaceholder: '400'  },
  bike:       { icon: '🚴', label: 'Bike',       bg: 'bg-orange-50',  border: 'border-orange-300',  header: 'bg-orange-100',  distUnit: 'km', distStep: 1,   distPlaceholder: '20'   },
  run:        { icon: '🏃', label: 'Run',        bg: 'bg-green-50',   border: 'border-green-300',   header: 'bg-green-100',   distUnit: 'km', distStep: 0.5, distPlaceholder: '5'    },
  walk:       { icon: '🚶', label: 'Walk',       bg: 'bg-slate-50',   border: 'border-slate-300',   header: 'bg-slate-100',   distUnit: 'km', distStep: 0.1, distPlaceholder: '1'    },
  transition: { icon: '⏱', label: 'Transition', bg: 'bg-yellow-50',  border: 'border-yellow-300',  header: 'bg-yellow-100',  distUnit: null, distStep: null,distPlaceholder: null   },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSegment(sport) {
  return { id: Date.now() + Math.random(), sport, duration_min: '', distance: '' }
}

function segmentLabel(seg) {
  const meta = BRICK_SPORTS[seg.sport]
  const parts = []
  if (seg.distance)    parts.push(`${seg.distance}${meta.distUnit}`)
  if (seg.duration_min) parts.push(`${seg.duration_min}min`)
  return `${meta.icon} ${parts.length ? parts.join('/') : meta.label}`
}

export function serializeBrick(segments) {
  if (!segments?.length) return ''
  const summary = segments.map(segmentLabel).join(' → ')
  return JSON.stringify({ _brickv: 1, segments, summary })
}

export function parseBrick(notes) {
  if (!notes) return null
  try {
    const p = JSON.parse(notes)
    if (p._brickv === 1 && Array.isArray(p.segments)) return p.segments
  } catch {}
  return null
}

export function brickReadableSummary(notes) {
  if (!notes) return null
  try {
    const p = JSON.parse(notes)
    if (p._brickv === 1) return p.summary
  } catch {}
  return null
}

// ─── Segment card ─────────────────────────────────────────────────────────────

function SegmentCard({ seg, index, total, onChange, onDelete, onMove }) {
  const meta = BRICK_SPORTS[seg.sport]
  const setNum = (field) => (e) =>
    onChange({ ...seg, [field]: e.target.value === '' ? '' : +e.target.value })

  const inputCls = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none'

  return (
    <div className={`rounded-2xl border-2 ${meta.border} ${meta.bg} w-36 flex-shrink-0 overflow-hidden shadow-sm flex flex-col`}>
      {/* header */}
      <div className={`${meta.header} border-b-2 ${meta.border} px-3 py-2 flex items-center justify-between`}>
        <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
          {meta.icon} {meta.label}
        </span>
        <button type="button" onClick={onDelete}
          className="w-5 h-5 rounded-full bg-white/60 hover:bg-red-100 text-gray-400 hover:text-red-500 text-sm leading-none flex items-center justify-center transition-colors">
          ×
        </button>
      </div>

      {/* fields */}
      <div className="p-3 space-y-2 flex-1">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Min</p>
          <input type="number" min="0" step="1" value={seg.duration_min}
            onChange={setNum('duration_min')} placeholder="—" className={inputCls} />
        </div>
        {meta.distUnit && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{meta.distUnit}</p>
            <input type="number" min="0" step={meta.distStep} value={seg.distance}
              onChange={setNum('distance')} placeholder={meta.distPlaceholder} className={inputCls} />
          </div>
        )}
      </div>

      {/* reorder */}
      <div className="flex border-t-2 border-gray-200">
        <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0}
          className="flex-1 py-1.5 text-gray-400 hover:text-indigo-500 disabled:opacity-20 text-sm font-bold hover:bg-white/60 transition-all">
          ←
        </button>
        <div className="w-px bg-gray-200" />
        <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1}
          className="flex-1 py-1.5 text-gray-400 hover:text-indigo-500 disabled:opacity-20 text-sm font-bold hover:bg-white/60 transition-all">
          →
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BrickBuilder({ value, onChange }) {
  const [segments, setSegments] = useState(value || [])

  const update = (next) => { setSegments(next); onChange(next) }
  const add    = (sport) => update([...segments, makeSegment(sport)])
  const remove = (id)    => update(segments.filter(s => s.id !== id))
  const change = (upd)   => update(segments.map(s => s.id === upd.id ? upd : s))

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= segments.length) return
    const next = [...segments]
    ;[next[i], next[j]] = [next[j], next[i]]
    update(next)
  }

  const totalMin = segments.reduce((s, seg) => s + (+seg.duration_min || 0), 0)

  // Build colour-coded sequence badge strip
  const STRIP_COLORS = { swim: 'bg-blue-400', bike: 'bg-orange-400', run: 'bg-green-400', walk: 'bg-slate-300', transition: 'bg-yellow-300' }

  return (
    <div className="space-y-3">
      {/* Add sport buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(BRICK_SPORTS).map(([sport, meta]) => (
          <button key={sport} type="button" onClick={() => add(sport)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            {meta.icon} {meta.label}
          </button>
        ))}
      </div>

      {/* Colour strip showing the sequence at a glance */}
      {segments.length > 0 && (
        <div className="flex items-center gap-0.5 h-2 rounded-full overflow-hidden">
          {segments.map((seg) => (
            <div key={seg.id} className={`flex-1 h-full ${STRIP_COLORS[seg.sport] || 'bg-gray-300'}`} />
          ))}
        </div>
      )}

      {/* Cards */}
      {segments.length > 0 ? (
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex items-stretch gap-2 min-w-max">
            {segments.map((seg, i) => (
              <React.Fragment key={seg.id}>
                <SegmentCard seg={seg} index={i} total={segments.length}
                  onChange={change} onDelete={() => remove(seg.id)} onMove={move} />
                {i < segments.length - 1 && (
                  <div className="self-center text-gray-300 text-xl">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-8 text-center text-sm text-gray-400">
          <p className="text-2xl mb-2">🔄</p>
          Add sport segments above — any order, any number
        </div>
      )}

      {/* Summary */}
      {segments.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sequence</p>
          <p className="text-sm text-gray-700 leading-relaxed flex flex-wrap gap-x-1 gap-y-0.5">
            {segments.map((seg, i) => (
              <span key={seg.id} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">→</span>}
                <span>{segmentLabel(seg)}</span>
              </span>
            ))}
          </p>
          {totalMin > 0 && <p className="text-xs text-gray-400">~{totalMin} min total</p>}
        </div>
      )}
    </div>
  )
}
