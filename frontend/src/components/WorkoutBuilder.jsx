import React, { useState } from 'react'
import { TrendingUp, Zap, Minus, Wind, TrendingDown } from 'lucide-react'

// ─── Config ───────────────────────────────────────────────────────────────────

const BLOCK_META = {
  warmup:   { label: 'Warm-up',   Icon: TrendingUp,   bg: 'bg-amber-50',  border: 'border-amber-300',  header: 'bg-amber-100  border-amber-300',  hasReps: false },
  interval: { label: 'Interval',  Icon: Zap,          bg: 'bg-red-50',    border: 'border-red-300',    header: 'bg-red-100    border-red-300',    hasReps: true  },
  steady:   { label: 'Steady',    Icon: Minus,        bg: 'bg-blue-50',   border: 'border-blue-300',   header: 'bg-blue-100   border-blue-300',   hasReps: false },
  recovery: { label: 'Recovery',  Icon: Wind,         bg: 'bg-sky-50',    border: 'border-sky-300',    header: 'bg-sky-100    border-sky-300',    hasReps: false },
  cooldown: { label: 'Cool-down', Icon: TrendingDown, bg: 'bg-green-50',  border: 'border-green-300',  header: 'bg-green-100  border-green-300',  hasReps: false },
}

const TARGET_TYPES = {
  zone:  { label: 'Zone',        placeholder: '',         suffix: ''      },
  hr:    { label: 'Heart rate',  placeholder: '140–155',  suffix: 'bpm'   },
  pace:  { label: 'Pace',        placeholder: '4:30',     suffix: '/km'   },
  power: { label: 'Power',       placeholder: '240–260',  suffix: 'W'     },
  rpe:   { label: 'RPE',         placeholder: '7',        suffix: '/ 10'  },
  feel:  { label: 'Feel / cue',  placeholder: 'e.g. comfortably hard', suffix: '' },
}

const ZONES = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']
const ZONE_LABELS = {
  Z1: 'Z1 — Recovery',
  Z2: 'Z2 — Aerobic',
  Z3: 'Z3 — Tempo',
  Z4: 'Z4 — Threshold',
  Z5: 'Z5 — VO2max / Max',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeBlock(type) {
  const id = Date.now() + Math.random()
  const base = { id, type, duration_min: 10, distance_m: '', target_type: 'zone', target_value: 'Z2' }
  if (type === 'interval') return { ...base, reps: 4, duration_min: 2, distance_m: 400, rest_min: 1, rest_sec: 30, target_type: 'zone', target_value: 'Z4' }
  if (type === 'recovery') return { ...base, duration_min: 2, target_value: 'Z1' }
  if (type === 'cooldown') return { ...base, duration_min: 10, target_value: 'Z1' }
  if (type === 'steady')   return { ...base, duration_min: 20, target_value: 'Z3' }
  return base
}

function formatRest(rest_min, rest_sec) {
  const m = +rest_min || 0
  const s = +rest_sec || 0
  if (m === 0 && s === 0) return '0s'
  if (m === 0) return `${s}s`
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}

function formatTarget(type, value) {
  if (!value && value !== 0) return ''
  switch (type) {
    case 'zone':  return String(value)
    case 'hr':    return `${value} bpm`
    case 'pace':  return `${value}/km`
    case 'power': return `${value} W`
    case 'rpe':   return `RPE ${value}`
    case 'feel':  return String(value)
    default:      return String(value)
  }
}

function blockSummary(b) {
  const target = formatTarget(b.target_type, b.target_value)
  const targetStr = target ? ` @ ${target}` : ''
  if (b.type === 'interval') {
    const work = b.distance_m ? `${b.distance_m}m` : `${b.duration_min}min`
    const rest = formatRest(b.rest_min, b.rest_sec)
    return `${b.reps}×${work}${targetStr} · ${rest} rest`
  }
  const dist = b.distance_m ? ` / ${b.distance_m}m` : ''
  return `${b.duration_min}min${dist}${targetStr}`
}

function blockTotalMin(b) {
  if (b.type === 'interval') {
    const restMin = (+b.rest_min || 0) + (+b.rest_sec || 0) / 60
    return (+b.reps || 0) * ((+b.duration_min || 0) + restMin)
  }
  return +b.duration_min || 0
}

// ─── Exported helpers ────────────────────────────────────────────────────────

export function serializeBlocks(blocks) {
  if (!blocks || blocks.length === 0) return ''
  const summary = blocks.map(blockSummary).join(' → ')
  return JSON.stringify({ _wbv: 2, blocks, summary })
}

export function parseBlocks(notes) {
  if (!notes) return null
  try {
    const p = JSON.parse(notes)
    if ((p._wbv === 1 || p._wbv === 2) && Array.isArray(p.blocks)) return p.blocks
  } catch {}
  return null
}

export function readableSummary(notes) {
  if (!notes) return null
  try {
    const p = JSON.parse(notes)
    if (p._wbv && p.summary) return p.summary
  } catch {}
  return null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none'
const selectCls = inputCls

// Rest duration: side-by-side min + sec inputs
function RestField({ block, onChange }) {
  const setMin = (e) => onChange({ ...block, rest_min: Math.max(0, +e.target.value || 0) })
  const setSec = (e) => onChange({ ...block, rest_sec: Math.min(59, Math.max(0, +e.target.value || 0)) })
  return (
    <Field label="Rest between reps">
      <div className="flex gap-1.5 items-center">
        <div className="flex-1 relative">
          <input type="number" min="0" max="59" value={block.rest_min ?? 1}
            onChange={setMin}
            className={inputCls + ' pr-8'} />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none">min</span>
        </div>
        <div className="flex-1 relative">
          <input type="number" min="0" max="59" value={block.rest_sec ?? 30}
            onChange={setSec}
            className={inputCls + ' pr-8'} />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none">sec</span>
        </div>
      </div>
    </Field>
  )
}

// Target: type selector + contextual value input
function TargetField({ block, onChange }) {
  const type = block.target_type || 'zone'
  const value = block.target_value ?? (type === 'zone' ? 'Z2' : '')
  const meta = TARGET_TYPES[type]

  const setType = (e) => {
    const newType = e.target.value
    const defaultVal = newType === 'zone' ? 'Z2' : ''
    onChange({ ...block, target_type: newType, target_value: defaultVal })
  }
  const setValue = (e) => onChange({ ...block, target_value: e.target.value })

  return (
    <Field label="Target">
      <div className="space-y-1.5">
        {/* type selector */}
        <select value={type} onChange={setType} className={selectCls}>
          {Object.entries(TARGET_TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* value input — depends on type */}
        {type === 'zone' ? (
          <select value={value || 'Z2'} onChange={setValue} className={selectCls}>
            {ZONES.map(z => <option key={z} value={z}>{ZONE_LABELS[z]}</option>)}
          </select>
        ) : (
          <div className="relative">
            <input
              type={type === 'rpe' ? 'number' : 'text'}
              min={type === 'rpe' ? 1 : undefined}
              max={type === 'rpe' ? 10 : undefined}
              value={value}
              onChange={setValue}
              placeholder={meta.placeholder}
              className={inputCls + (meta.suffix ? ' pr-10' : '')}
            />
            {meta.suffix && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 pointer-events-none whitespace-nowrap">
                {meta.suffix}
              </span>
            )}
          </div>
        )}
      </div>
    </Field>
  )
}

// ─── Block card ───────────────────────────────────────────────────────────────

function BlockCard({ block, onChange, onDelete }) {
  const meta = BLOCK_META[block.type]
  const setNum = (field) => (e) => onChange({ ...block, [field]: e.target.value === '' ? '' : +e.target.value })

  return (
    <div className={`rounded-2xl border-2 ${meta.border} ${meta.bg} w-52 flex-shrink-0 overflow-hidden shadow-sm`}>
      {/* header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b-2 ${meta.header}`}>
        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <meta.Icon size={12} strokeWidth={1.5} /> {meta.label}
        </span>
        <button type="button" onClick={onDelete}
          className="w-5 h-5 rounded-full bg-white/60 hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors text-sm leading-none flex items-center justify-center">
          ×
        </button>
      </div>

      {/* fields */}
      <div className="p-3 space-y-2.5">

        {/* Reps — interval only */}
        {meta.hasReps && (
          <Field label="Reps">
            <input type="number" min="1" value={block.reps} onChange={setNum('reps')} className={inputCls} />
          </Field>
        )}

        {/* Duration */}
        <Field label={meta.hasReps ? 'Work duration (min)' : 'Duration (min)'}>
          <input type="number" min="0" step="0.5" value={block.duration_min} onChange={setNum('duration_min')} className={inputCls} />
        </Field>

        {/* Distance */}
        <Field label="Distance (m)">
          <input type="number" min="0" step="50" value={block.distance_m} onChange={setNum('distance_m')}
            placeholder="optional" className={inputCls} />
        </Field>

        {/* Rest — interval only */}
        {meta.hasReps && (
          <RestField block={block} onChange={onChange} />
        )}

        {/* Target */}
        <TargetField block={block} onChange={onChange} />

      </div>
    </div>
  )
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export default function WorkoutBuilder({ value, onChange }) {
  const [blocks, setBlocks] = useState(value || [])

  const update = (next) => { setBlocks(next); onChange(next) }

  const addBlock    = (type) => update([...blocks, makeBlock(type)])
  const removeBlock = (id)   => update(blocks.filter(b => b.id !== id))
  const changeBlock = (upd)  => update(blocks.map(b => b.id === upd.id ? upd : b))

  const totalMin = blocks.reduce((s, b) => s + blockTotalMin(b), 0)

  return (
    <div className="space-y-3">
      {/* Add block buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(BLOCK_META).map(([type, meta]) => (
          <button key={type} type="button" onClick={() => addBlock(type)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <meta.Icon size={12} strokeWidth={1.5} /> {meta.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {blocks.length > 0 ? (
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex items-start gap-2 min-w-max">
            {blocks.map((block, i) => (
              <React.Fragment key={block.id}>
                <BlockCard block={block} onChange={changeBlock} onDelete={() => removeBlock(block.id)} />
                {i < blocks.length - 1 && (
                  <div className="self-center text-gray-300 text-xl mt-6">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl py-8 text-center text-sm text-gray-400">
          Add blocks above to build your interval workout
        </div>
      )}

      {/* Summary */}
      {blocks.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Workout preview</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {blocks.map((b, i) => {
              const meta = BLOCK_META[b.type]
              return (
                <span key={b.id} className="inline-flex items-center gap-1">
                  {i > 0 && <span className="text-gray-300 mx-1">→</span>}
                  <meta.Icon size={11} strokeWidth={1.5} className="text-gray-400" />
                  <span>{blockSummary(b)}</span>
                </span>
              )
            })}
          </p>
          <p className="text-xs text-gray-400">~{Math.round(totalMin)} min total</p>
        </div>
      )}
    </div>
  )
}
