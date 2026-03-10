'use client'

import { Calendar, Folder, Clock, CheckCircle2, XCircle, SquarePen, Trash2, CircleArrowDown, CircleArrowUp, ChevronsLeftRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

type Task = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
  updatedAt: string
  dueDate: string
  category?: {
    id?: number
    name?: string
  }
  failureReason?: string
}

const statusConfig = {
  PROCESS: {
    label: 'In Progress',
    icon: Clock,
    bg: 'bg-amber-100/40 border-amber-100',
    text: 'text-amber-800',
  },
  SUCCESS: {
    label: 'Completed',
    icon: CheckCircle2,
    bg: 'bg-emerald-100/40 border-emerald-100',
    text: 'text-emerald-800',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    bg: 'bg-rose-100/40 border-rose-100',
    text: 'text-rose-800',
  },
}

const priorityConfig = {
  LOW: {
    label: 'Low',
    icon: CircleArrowDown,
    text: 'text-green-600',
  },
  MEDIUM: {
    label: 'Medium',
    icon: ChevronsLeftRight,
    text: 'text-yellow-600',
  },
  HIGH: {
    label: 'High',
    icon: CircleArrowUp,
    text: 'text-red-600',
  },
}

export default function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  category,
  isSelected,
  onToggleSelect
}: Task) {
  const router = useRouter()
  const sconfig = statusConfig[status]
  const StatusIcon = sconfig.icon

  const pconfig = priorityConfig[priority]
  const PriorityIcon = pconfig.icon
  return (
    <div
      className={clsx(
        'relative flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-gray-300',
        isSelected && 'ring-2 ring-blue-500/30'
      )}
    >
      {/* Selection + Status */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
            <div className={clsx('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium', sconfig.bg, sconfig.text)}>
              <StatusIcon className="w-3 h-3" />
              <span>{sconfig.label}</span>
            </div>
          </div>
        </div>

        <div className={clsx('flex items-center gap-x-1 text-sm', pconfig.text)}>
          <PriorityIcon className='size-4' />
          {pconfig.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <h3 className="text-gray-900 font-semibold text-base line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
          onClick={() => router.push(`/dashboard/tasks/${id}`)}>
          {title}
        </h3>

        {description && (
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-gray-500 text-xs">
          {category && (
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
              <Folder className="w-3 h-3 text-gray-400" />
              <span>{category.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span>{new Date(dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 pt-2 border-t border-gray-100">
          <button
            onClick={() => router.push(`/dashboard/tasks/edit/${id}`)}
            className="p-1 pt-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
            title="Edit task"
          >
            <SquarePen className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (confirm('Delete this task?')) {
                fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(() => router.refresh())
              }
            }}
            className="p-1 pt-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>

        </div>
      </div>
    </div>
  )
}
