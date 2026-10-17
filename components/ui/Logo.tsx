import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  textClassName?: string
}

export function Logo({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
}: LogoProps) {
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-lg', icon: 'w-4 h-4' },
    md: { box: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4' },
    lg: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
  }

  const { box, icon } = sizeMap[size]

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${box} bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold shadow-xs shrink-0 transition-transform group-hover:scale-105`}
      >
        <svg
          className={icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Clean, geometric task checkmark with upper baseline */}
          <path d="M4 12.5L9 17.5L20 6.5" />
          <path d="M12 4h8" strokeWidth="2" strokeOpacity="0.4" />
        </svg>
      </div>
      {showText && (
        <span
          className={`font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ${textClassName}`}
        >
          Nexttask
        </span>
      )}
    </div>
  )
}

export default Logo
