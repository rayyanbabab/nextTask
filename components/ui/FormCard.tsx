import React, { ReactNode } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

type FormCardProps = {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  actionHref?: string
  actionLabel?: string
  actionIcon?: React.ReactNode
}

export function FormCard({
  title,
  subtitle,
  children,
  className = "",
  actionHref,
  actionLabel = "Create",
  actionIcon,
}: FormCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-xs transition-colors p-6 sm:p-7 space-y-6",
        className
      )}
    >
      {(title || subtitle || actionHref) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            {title && (
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs sm:text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              {actionIcon || <Plus className="w-3.5 h-3.5" />}
              {actionLabel}
            </Link>
          )}
        </div>
      )}

      <div>{children}</div>
    </div>
  )
}
