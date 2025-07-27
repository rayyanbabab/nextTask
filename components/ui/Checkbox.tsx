import React from 'react'
import clsx from 'clsx'

type CustomCheckboxProps = {
  checked?: boolean
  onChange?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
}

export default function Checkbox({ checked, onChange, className = '', disabled = false }: CustomCheckboxProps) {
  return (
    <button type="button" onClick={onChange} disabled={disabled} aria-pressed={checked}
      className={clsx(
        'w-5 h-5 rounded border border-gray-400 flex items-center justify-center transition-colors',
          checked ? 'bg-neutral-800 border-neutral-800' : 'bg-white',
          disabled && 'opacity-50 cursor-not-allowed',
          className
      )}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}
