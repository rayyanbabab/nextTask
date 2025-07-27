'use client'

import { useState, useCallback } from 'react'

type SearchInputProps = {
  placeholder?: string
  onSearch: (value: string) => void
}

export function Search({ placeholder = 'Search...', onSearch }: SearchInputProps) {
  const [term, setTerm] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setTerm(value)
      onSearch(value)
    },
    [onSearch]
  )

  return (
    <input type="text" value={term} onChange={handleChange} placeholder={placeholder}
      className="w-full px-2 py-[5px] border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring focus:ring-blue-500 placeholder-gray-400"
    />
  )
}
