'use client'

import { ChevronDown } from 'lucide-react'
import React from 'react'

type Option = {
  label: string
  value: string | number
}

type DropdownProps = {
  label: string
  name: string
  value: string | number
  options: Option[]
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export const Dropdown = ({ label, name, value, options, onChange, placeholder, required, disabled }: DropdownProps) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1">
        {label}
      </label>
      <div className="relative">
        <select id={name} name={name} value={value} onChange={onChange} required={required} disabled={disabled}
          className="w-full text-sm border border-gray-300 px-3 py-2 rounded-md appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
          size={18}
        />
      </div>
    </div>
  )
}
