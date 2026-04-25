import React, { useId } from 'react'

export default function StreloMark({ size = 24, className = '' }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={`strelo-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7a00" />
          <stop offset="100%" stopColor="#ff0080" />
        </linearGradient>
      </defs>
      <path d="M12 2L2 22H22L12 2Z" fill={`url(#strelo-${id})`} opacity="0.15" />
      <path d="M12 2L2 22H10L14 12L12 2Z" fill={`url(#strelo-${id})`} />
      <path d="M16 11L12 21H22L16 11Z" fill="#71717a" />
    </svg>
  )
}
