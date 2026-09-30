'use client'

import * as React from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SearchInputProps = {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  className?: string
}

export function Search({
  placeholder = 'Search tasks...',
  value: externalValue,
  onChange,
  onSearch,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState('')
  const isControlled = externalValue !== undefined
  const value = isControlled ? externalValue : internalValue

  const handleUpdate = (val: string) => {
    if (!isControlled) setInternalValue(val)
    onChange?.(val)
    onSearch?.(val)
  }

  return (
    <div className={cn('relative w-full', className)}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleUpdate(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-all focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-zinc-950/5 dark:focus:ring-zinc-100/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => handleUpdate('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
