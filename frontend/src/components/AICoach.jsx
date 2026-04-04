import React, { useState, useRef, useEffect } from 'react'
import { aiChat, createWorkout } from '../api'
import { addDays, nextMonday, format } from 'date-fns'
import { Bot, Send, User, Waves, Bike, Footprints, CalendarPlus, Check, Layers } from 'lucide-react'

const DAY_OFFSETS = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
  Friday: 4, Saturday: 5, Sunday: 6,
}

const SPORT_ICON = { swim: Waves, bike: Bike, run: Footprints, brick: Layers }
const SPORT_COLOR = {
  swim:  'border-blue-400 bg-blue-50 dark:bg-blue-950',
  bike:  'border-orange-400 bg-orange-50 dark:bg-orange-950',
  run:   'border-emerald-400 bg-emerald-50 dark:bg-emerald-950',
  brick: 'border-violet-400 bg-violet-50 dark:bg-violet-950',
}
const SPORT_BADGE = {
  swim:  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  bike:  'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  run:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  brick: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
}

function getNextWeekDate(dayName) {
  const monday = nextMonday(new Date())
  const offset = DAY_OFFSETS[dayName] ?? 0
  return format(addDays(monday, offset), 'yyyy-MM-dd')
}

function PlanCard({ plan, onAdd, addedIds, addingId }) {
  return (
    <div className="space-y-2 mt-2">
      {plan.week_focus && (
        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{plan.week_focus}</p>
      )}
      {plan.workouts?.map((w, i) => {
        const Icon = SPORT_ICON[w.sport] || Footprints
        const added = addedIds.has(i)
        return (
          <div key={i} className={`rounded-lg border-l-[3px] p-2.5 ${SPORT_COLOR[w.sport] || 'border-slate-300 bg-slate-50 dark:bg-slate-800'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Icon size={13} strokeWidth={1.5} className="text-slate-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{w.day}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${SPORT_BADGE[w.sport] || 'bg-slate-100 text-slate-600'}`}>
                  {w.sport}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{w.workout_type}</span>
              </div>
              <button
                onClick={() => onAdd(w, i)}
                disabled={added || addingId === i}
                className={`shrink-0 p-1 rounded-md transition-colors ${
                  added
                    ? 'text-emerald-500'
                    : 'text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800'
                }`}
                title={added ? 'Added' : 'Add to calendar'}
              >
                {added ? <Check size={14} strokeWidth={2} /> : <CalendarPlus size={14} strokeWidth={1.5} />}
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{w.description}</p>
            <div className="flex gap-3 mt-0.5 text-[10px] text-slate-400">
              {w.duration_min && <span>{w.duration_min}min</span>}
              {w.distance_km && <span>{w.distance_km}km</span>}
            </div>
          </div>
        )
      })}
      {plan.workouts?.length > 0 && (
        <button
          onClick={() => plan.workouts.forEach((w, i) => { if (!addedIds.has(i)) onAdd(w, i) })}
          className="w-full text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-lg py-2 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors">
          Add all to calendar
        </button>
      )}
    </div>
  )
}

export default function AICoach({ onWorkoutsAdded }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [latestPlan, setLatestPlan] = useState(null)
  const [addedIds, setAddedIds] = useState(new Set())
  const [addingId, setAddingId] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const { reply, plan } = await aiChat(updated)
      setMessages(prev => [...prev, { role: 'assistant', content: reply, plan }])
      if (plan) {
        setLatestPlan(plan)
        setAddedIds(new Set())
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to get a response.'
      setMessages(prev => [...prev, { role: 'assistant', content: detail }])
    }
    setLoading(false)
  }

  const handleAdd = async (workout, idx) => {
    setAddingId(idx)
    try {
      await createWorkout({
        date: getNextWeekDate(workout.day),
        sport: workout.sport,
        workout_type: workout.workout_type,
        status: 'planned',
        distance_km: workout.distance_km ?? null,
        duration_min: workout.duration_min ?? null,
        notes: workout.description ?? '',
      })
      setAddedIds(prev => new Set([...prev, idx]))
      onWorkoutsAdded?.()
    } catch {
      // silently fail
    } finally {
      setAddingId(null)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
      style={{ height: isEmpty ? 'auto' : '520px' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <h2 className="font-display text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Bot size={16} strokeWidth={1.5} className="text-rose-500" />
          Strelo<span className="text-rose-500">IQ</span>
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Discuss your week, then push it to your calendar</p>
      </div>

      {/* Messages */}
      {isEmpty ? (
        <div className="px-4 py-10 text-center">
          <div className="flex justify-center gap-2 mb-3 text-slate-200 dark:text-slate-700">
            <Waves size={22} strokeWidth={1.5} />
            <Bike size={22} strokeWidth={1.5} />
            <Footprints size={22} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500">Tell StreloIQ how you're feeling, what you want to focus on, or just ask for next week's plan.</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {['Plan my next week', 'I want to focus on the bike', "I'm feeling tired, keep it easy"].map(q => (
              <button key={q} onClick={() => { setInput(q) }}
                className="text-xs text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-full px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={13} strokeWidth={2} className="text-rose-500 dark:text-rose-400" />
                </div>
              )}
              <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
                <div className={`text-sm leading-relaxed px-3 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-rose-500 text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.plan && (
                  <PlanCard
                    plan={msg.plan}
                    onAdd={handleAdd}
                    addedIds={addedIds}
                    addingId={addingId}
                  />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={13} strokeWidth={2} className="text-slate-500 dark:text-slate-400" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900 flex items-center justify-center shrink-0">
                <Bot size={13} strokeWidth={2} className="text-rose-500 dark:text-rose-400" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-sm px-3 py-2 rounded-lg rounded-bl-sm">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask StreloIQ about your week..."
          className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none"
        />
        <button type="submit" disabled={loading || !input.trim()}
          className="w-9 h-9 rounded-lg bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0">
          <Send size={15} strokeWidth={2} />
        </button>
      </form>
    </div>
  )
}
