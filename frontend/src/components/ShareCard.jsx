import React, { useRef, useState } from 'react'
import { Share2, Download, Copy, Check } from 'lucide-react'

function formatHours(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function WeekContent({ data }) {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-wider text-rose-400">Week Summary</p>
      <p className="text-3xl font-bold text-white mt-2">
        {data.sessions} <span className="text-lg font-semibold text-slate-400">sessions</span>
      </p>
      <p className="text-lg font-bold text-slate-300 mt-0.5">
        {formatHours(data.totalHours)} total
      </p>

      {data.breakdown && Object.keys(data.breakdown).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(data.breakdown).map(([sport, mins]) => (
            <span key={sport}
              className="px-2.5 py-1 rounded-lg bg-white/10 text-xs font-semibold text-slate-300 capitalize">
              {sport} · {Math.round(mins)}min
            </span>
          ))}
        </div>
      )}
    </>
  )
}

function RaceContent({ data }) {
  const formattedDate = data.date
    ? new Date(data.date + 'T12:00:00').toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <>
      <p className="text-xs font-medium uppercase tracking-wider text-rose-400">Race Day</p>
      <p className="text-2xl font-bold text-white mt-2">{data.name || 'Upcoming Race'}</p>
      {formattedDate && (
        <p className="text-sm font-medium text-slate-400 mt-1">{formattedDate}</p>
      )}
      {data.distance && (
        <p className="text-lg font-bold text-slate-300 mt-2">{data.distance}</p>
      )}
    </>
  )
}

function buildShareText(type, data) {
  if (type === 'week') {
    let text = `Week Summary: ${data.sessions} sessions, ${formatHours(data.totalHours)} total`
    if (data.breakdown && Object.keys(data.breakdown).length > 0) {
      const parts = Object.entries(data.breakdown).map(
        ([sport, mins]) => `${sport}: ${Math.round(mins)}min`
      )
      text += ` (${parts.join(', ')})`
    }
    text += '\n\nTracked with Strelo'
    return text
  }

  let text = `Race: ${data.name || 'Upcoming Race'}`
  if (data.date) {
    text += ` on ${new Date(data.date + 'T12:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })}`
  }
  if (data.distance) text += ` - ${data.distance}`
  text += '\n\nTracked with Strelo'
  return text
}

export default function ShareCard({ type, data }) {
  const cardRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const shareText = buildShareText(type, data)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: type === 'week' ? 'My Week Summary' : data.name || 'Race Day',
          text: shareText,
        })
      } catch {
        // User cancelled or share failed, no action needed
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy()
    }
  }

  const handleDownload = () => {
    // Create a simple text file download as a lightweight alternative to html2canvas
    const blob = new Blob([shareText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = type === 'week' ? 'strelo-week-summary.txt' : 'strelo-race-card.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      {/* Card */}
      <div ref={cardRef}
        className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-md">
        <div className="p-4">
          {type === 'week' ? <WeekContent data={data} /> : <RaceContent data={data} />}

          {/* Branding */}
          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-rose-600 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                <path d="M10 6 L13 3 L16 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.5 11 L9 6 L12.5 11" stroke="rgba(255,255,255,0.65)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 15 L4.5 12 L7 15" stroke="rgba(255,255,255,0.35)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-500">Strelo</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors">
          <Share2 size={15} strokeWidth={2} />
          Share
        </button>

        <button onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
          <Download size={15} strokeWidth={2} />
          Download
        </button>

        <button onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
          {copied ? <Check size={15} strokeWidth={2} className="text-emerald-500" /> : <Copy size={15} strokeWidth={2} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
