import React, { useState, useCallback } from 'react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })
const DnDCalendar = withDragAndDrop(BigCalendar)

const SPORT_COLORS = {
  swim:  '#3b82f6',
  bike:  '#f97316',
  run:   '#22c55e',
  brick: '#a855f7',
  gym:   '#f43f5e',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function workoutsToEvents(workouts) {
  return workouts.map(w => ({
    id: w.id,
    title: `${w.sport.toUpperCase()} · ${w.workout_type}${w.duration_min ? ` · ${w.duration_min}m` : ''}`,
    start: new Date(w.date + 'T08:00:00'),
    end: new Date(w.date + 'T09:00:00'),
    resource: w,
  }))
}

function CustomToolbar({ date, onNavigate }) {
  const month = date.getMonth()
  const year = date.getFullYear()

  const changeMonth = (dir) => {
    const d = new Date(date)
    d.setMonth(d.getMonth() + dir)
    onNavigate('DATE', d)
  }

  const changeYear = (dir) => {
    const d = new Date(date)
    d.setFullYear(d.getFullYear() + dir)
    onNavigate('DATE', d)
  }

  return (
    <div className="flex items-center justify-between mb-3">
      {/* Month selector */}
      <div className="flex items-center gap-1">
        <button onClick={() => changeMonth(-1)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-white w-10 text-center">
          {MONTHS[month]}
        </span>
        <button onClick={() => changeMonth(1)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-1">
        <button onClick={() => changeYear(-1)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-white w-12 text-center">
          {year}
        </span>
        <button onClick={() => changeYear(1)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Today button */}
      <button onClick={() => onNavigate('TODAY')}
        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
        Today
      </button>
    </div>
  )
}

export default function Calendar({ workouts, onSelectSlot, onSelectEvent, onMoveWorkout, selectedIds }) {
  const [date, setDate] = useState(new Date())

  const events = workoutsToEvents(workouts)

  const eventStyleGetter = useCallback((event) => {
    const w = event.resource
    const color = SPORT_COLORS[w.sport] || '#6b7280'
    const isSkipped = w.status === 'skipped'
    const isCompleted = w.status === 'completed'
    return {
      style: {
        backgroundColor: color,
        opacity: isSkipped ? 0.35 : isCompleted ? 1 : 0.75,
        border: 'none',
        borderLeft: isCompleted ? '3px solid rgba(255,255,255,0.8)' : '3px solid rgba(255,255,255,0.3)',
        textDecoration: isSkipped ? 'line-through' : 'none',
        borderRadius: '4px',
        fontSize: '0.7rem',
        cursor: 'grab',
        padding: '1px 4px',
      },
    }
  }, [])

  const handleSelectSlot = useCallback(({ start }) => {
    const dateStr = format(start, 'yyyy-MM-dd')
    onSelectSlot(dateStr)
  }, [onSelectSlot])

  const handleSelectEvent = useCallback((event, e) => {
    onSelectEvent(event.resource, e)
  }, [onSelectEvent])

  const handleEventDrop = useCallback(({ event, start }) => {
    if (onMoveWorkout) {
      const newDate = format(start, 'yyyy-MM-dd')
      onMoveWorkout(event.resource.id, newDate)
    }
  }, [onMoveWorkout])

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 550 }}
        view="month"
        onView={() => {}}
        date={date}
        onNavigate={setDate}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        eventPropGetter={eventStyleGetter}
        views={['month']}
        popup
        draggableAccessor={() => true}
        resizable={false}
        components={{ toolbar: CustomToolbar }}
      />
    </div>
  )
}
