'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CustomCheckboxProps = {
  checked?: boolean
  onChange?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
  id?: string
  'aria-label'?: string
}

export default function Checkbox({
  checked = false,
  onChange,
  className = '',
  disabled = false,
  id,
  'aria-label': ariaLabel,
}: CustomCheckboxProps) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-150 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20',
        checked
          ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-600'
          : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {checked && (
        <Check className="w-3 h-3 stroke-[2.5]" />
      )}
    </button>
  )
}
