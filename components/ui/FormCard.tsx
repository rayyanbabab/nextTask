import React, { ReactNode } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

type FormCardProps = {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string

  actionHref?: string
  actionLabel?: string
}

export function FormCard({
  title,
  subtitle,
  children,
  className = "",
  actionHref,
  actionLabel = "Create",
}: FormCardProps) {
  return (
    <main
      className={`mt-4 mx-auto p-6 bg-white rounded-xl shadow border border-gray-200 space-y-6 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          {title && (
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>

        {actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </Link>
        )}
      </div>

      {children}
    </main>
  )
}
