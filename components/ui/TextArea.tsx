'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type TextareaProps = {
  label?: string
  name: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  rows?: number
  className?: string
}

export const Textarea = ({ label, name, value, onChange, placeholder, required = false, disabled = false, error, rows = 4, className }: TextareaProps) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        name={name}
        id={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm text-gray-600 border-gray-300 focus:border-gray-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-gray-600 transition',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
