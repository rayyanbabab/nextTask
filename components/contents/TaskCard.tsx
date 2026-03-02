'use client'

import { Calendar, Folder, Clock, CheckCircle2, XCircle, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

type TaskCardProps = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  dueDate: string
  category?: {
    id: number
    name: string
  }
  isSelected?: boolean
  onSelect?: () => void
}

const statusConfig = {
  PROCESS: {
    label: 'In Progress',
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  SUCCESS: {
    label: 'Completed',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
}

export default function TaskCard({
  id,
  title,
  description,
  status,
  dueDate,
  category,
  isSelected,
  onSelect
}: TaskCardProps) {
  const router = useRouter()
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div
      className={clsx(
        'group relative bg-white rounded-xl border transition-all hover:shadow-lg hover:border-gray-300',
        isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        <div className={clsx('flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', config.bg, config.text)}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{config.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-12">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {category && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Folder className="w-4 h-4 text-gray-400" />
              <span>{category.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Due {new Date(dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={() => router.push(`/dashboard/tasks/${id}`)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/dashboard/tasks/edit/${id}`)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit task"
            >
              <SquarePen className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this task?')) {
                  fetch(`/api/tasks/${id}`, { method: 'DELETE' })
                    .then(() => router.refresh())
                }
              }}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
