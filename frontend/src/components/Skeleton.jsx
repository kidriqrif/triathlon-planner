import React from 'react'

function Bone({ className = '' }) {
  return <div className={`bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse ${className}`} />
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
      <Bone className="h-3 w-16" />
      <Bone className="h-7 w-12" />
      <Bone className="h-2.5 w-20" />
    </div>
  )
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3">
      <Bone className="h-4 w-32" />
      {Array.from({ length: lines }).map((_, i) => (
        <Bone key={i} className={`h-3 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
      <div className="flex justify-between items-center">
        <Bone className="h-5 w-28" />
        <div className="flex gap-2">
          <Bone className="h-8 w-8 rounded-lg" />
          <Bone className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Bone key={`h${i}`} className="h-3 w-full" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Bone key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-3">
          <Bone className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Bone className="h-3.5 w-2/5" />
            <Bone className="h-2.5 w-3/5" />
          </div>
          <Bone className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <CardSkeleton lines={2} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <CardSkeleton lines={4} />
      <CardSkeleton lines={5} />
    </div>
  )
}

export default Bone
