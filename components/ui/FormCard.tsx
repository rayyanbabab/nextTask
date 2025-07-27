import React, { ReactNode } from 'react'

type FormCardProps = {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function FormCard({ title, subtitle, children, className = '' }: FormCardProps) {
  return (
    <main className={`mt-4 mx-auto p-6 bg-white rounded-xl shadow space-y-6 border border-gray-200 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </main>
  )
}
