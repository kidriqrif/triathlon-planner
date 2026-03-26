import React, { useState, useCallback } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

const SPORT_COLORS = {
  swim:  '#3b82f6',
  bike:  '#f97316',
  run:   '#22c55e',
  brick: '#a855f7',
  gym:   '#f43f5e',
}

function workoutsToEvents(workouts) {
  return workouts.map(w => ({
    id: w.id,
    title: `${w.sport.toUpperCase()} · ${w.workout_type}${w.duration_min ? ` · ${w.duration_min}m` : ''}`,
    start: new Date(w.date + 'T08:00:00'),
    end: new Date(w.date + 'T09:00:00'),
    resource: w,
  }))
}

function eventStyleGetter(event) {
  const w = event.resource
  const color = SPORT_COLORS[w.sport] || '#6b7280'
  const isDashed = w.status === 'planned'
  const isSkipped = w.status === 'skipped'
  return {
    style: {
      backgroundColor: color,
      opacity: isSkipped ? 0.4 : isDashed ? 0.7 : 1,
      border: isDashed ? '2px dashed rgba(255,255,255,0.7)' : 'none',
      textDecoration: isSkipped ? 'line-through' : 'none',
      borderRadius: '6px',
      fontSize: '0.75rem',
      cursor: 'pointer',
    },
  }
}

export default function Calendar({ workouts, onSelectSlot, onSelectEvent }) {
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())

  const events = workoutsToEvents(workouts)

  const handleSelectSlot = useCallback(({ start }) => {
    const dateStr = format(start, 'yyyy-MM-dd')
    onSelectSlot(dateStr)
  }, [onSelectSlot])

  const handleSelectEvent = useCallback((event) => {
    onSelectEvent(event.resource)
  }, [onSelectEvent])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week']}
        popup
      />
    </div>
  )
}
