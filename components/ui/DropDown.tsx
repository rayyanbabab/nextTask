'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Option = {
  label: string
  value: string | number
}

export type DropdownProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  name: string
  value: string | number
  options: Option[]
  placeholder?: string
  error?: string
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, name, value, options, placeholder, error, className, id, ...props }, ref) => {
    const selectId = id || name

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            name={name}
            value={value}
            ref={ref}
            className={cn(
              'w-full h-10 px-3.5 pr-10 text-sm rounded-lg border bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 appearance-none cursor-pointer transition-all duration-150',
              'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
              'focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-zinc-950/5 dark:focus:ring-zinc-100/10',
              error && 'border-rose-500 dark:border-rose-500 focus:ring-rose-500/10',
              props.disabled &&
                'opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-950',
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none w-4 h-4"
          />
        </div>
        {error && (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Dropdown.displayName = 'Dropdown'
