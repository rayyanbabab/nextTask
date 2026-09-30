'use client'

import { Calendar, Folder, Clock, CheckCircle2, XCircle, SquarePen, Trash2, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

export type TaskCardProps = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt?: string
  updatedAt?: string
  dueDate?: string
  category?: {
    id?: number
    name?: string
  }
  failureReason?: string
  isSelected?: boolean
  onToggleSelect?: () => void
  showCheckbox?: boolean
  hideEdit?: boolean
  recurrence?: string
}

const statusConfig = {
  PROCESS: {
    label: 'In Progress',
    icon: Clock,
    cls: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
  },
  SUCCESS: {
    label: 'Completed',
    icon: CheckCircle2,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    cls: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60',
  },
}

const priorityConfig = {
  LOW: {
    label: 'Low',
    cls: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    dot: 'bg-emerald-500',
  },
  MEDIUM: {
    label: 'Medium',
    cls: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  HIGH: {
    label: 'High',
    cls: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
    dot: 'bg-rose-500',
  },
}

export default function TaskCard({
  id,
  title,
  description,
  status,
  priority = 'MEDIUM',
  dueDate,
  category,
  isSelected = false,
  onToggleSelect,
  showCheckbox = true,
  hideEdit = false,
  recurrence,
}: TaskCardProps) {
  const router = useRouter()
  const sconfig = statusConfig[status] || statusConfig.PROCESS
  const StatusIcon = sconfig.icon
  const pconfig = priorityConfig[priority] || priorityConfig.MEDIUM

  const isOverdue =
    status === 'PROCESS' && dueDate ? new Date(dueDate) < new Date() : false

  return (
    <div
      className={clsx(
        'group relative flex flex-col justify-between bg-white dark:bg-zinc-900/90 rounded-xl border transition-all duration-150 shadow-xs hover:shadow-sm',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/10 dark:ring-blue-400/20'
          : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      )}
    >
      {/* Card Header: Selection + Status + Priority */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/70">
        <div className="flex items-center gap-2">
          {showCheckbox && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <span
            className={clsx(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border',
              sconfig.cls
            )}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{sconfig.label}</span>
          </span>
        </div>

        {/* Priority Badge */}
        <div
          className={clsx(
            'flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium',
            pconfig.cls
          )}
        >
          <span className={clsx('w-1.5 h-1.5 rounded-full', pconfig.dot)} />
          <span>{pconfig.label}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 flex flex-col gap-2.5">
        <h3
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          onClick={() => router.push(`/dashboard/tasks/${id}`)}
        >
          {title}
        </h3>

        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          {category && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px]">
              <Folder className="w-3 h-3 text-zinc-400" />
              <span>{category.name}</span>
            </div>
          )}

          {dueDate && (
            <div
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium',
                isOverdue
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60'
                  : 'text-zinc-500 dark:text-zinc-400'
              )}
            >
              {isOverdue ? (
                <AlertCircle className="w-3 h-3 text-rose-500" />
              ) : (
                <Calendar className="w-3 h-3 text-zinc-400" />
              )}
              <span>
                {new Date(dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {recurrence && recurrence !== 'NONE' && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 text-[11px]">
              <RefreshCw className="w-3 h-3" />
              <span className="capitalize">
                {recurrence.toLowerCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      {!hideEdit && (
        <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <button
            onClick={() => router.push(`/dashboard/tasks/${id}`)}
            className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-200 transition font-medium"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/dashboard/tasks/edit/${id}`)}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
              title="Edit task"
            >
              <SquarePen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (confirm('Delete this task?')) {
                  fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(() =>
                    router.refresh()
                  )
                }
              }}
              className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
