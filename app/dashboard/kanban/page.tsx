'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock,
  CheckCircle2,
  XCircle,
  SquarePen,
  Trash2,
  Calendar,
  Folder,
  Plus,
  AlertCircle,
} from 'lucide-react'
import clsx from 'clsx'
import Link from 'next/link'

type Task = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string
  category?: { name: string }
  subtasks: { id: number; completed: boolean }[]
  labels: { label: { name: string; color: string } }[]
}

const columns = [
  {
    id: 'PROCESS' as const,
    label: 'In Progress',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    headerBadge: 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
  },
  {
    id: 'SUCCESS' as const,
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    headerBadge: 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
  },
  {
    id: 'FAILED' as const,
    label: 'Failed',
    icon: XCircle,
    color: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
    headerBadge: 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
  },
]

const priorityConfig = {
  HIGH: {
    label: 'High',
    cls: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
  },
  MEDIUM: {
    label: 'Med',
    cls: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
  },
  LOW: {
    label: 'Low',
    cls: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
  },
}

function isOverdue(dueDate: string) {
  return dueDate ? new Date(dueDate) < new Date() : false
}

function KanbanCard({
  task,
  onStatusChange,
  onDelete,
  onDragStart,
}: {
  task: Task
  onStatusChange: (id: number, status: 'PROCESS' | 'SUCCESS' | 'FAILED') => void
  onDelete: (id: number) => void
  onDragStart: (id: number) => void
}) {
  const router = useRouter()
  const completedSubs = task.subtasks?.filter((s) => s.completed).length ?? 0
  const totalSubs = task.subtasks?.length ?? 0
  const overdue = task.status === 'PROCESS' && isOverdue(task.dueDate)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 p-4 space-y-3 group cursor-grab active:cursor-grabbing active:opacity-75"
    >
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map(({ label }) => (
            <span
              key={label.name}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: label.color + '22',
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3
        className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
        onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
      >
        {task.title}
      </h3>

      {/* Subtask progress */}
      {totalSubs > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>
              {completedSubs}/{totalSubs} subtasks
            </span>
            <span>{Math.round((completedSubs / totalSubs) * 100)}%</span>
          </div>
          <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta tags */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
        {task.category && (
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
            <Folder className="w-3 h-3 text-zinc-400" />
            <span>{task.category.name}</span>
          </div>
        )}
        {task.dueDate && (
          <div
            className={clsx(
              'flex items-center gap-1 px-1.5 py-0.5 rounded',
              overdue
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 font-medium'
                : 'text-zinc-500 dark:text-zinc-400'
            )}
          >
            {overdue ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <Calendar className="w-3 h-3 text-zinc-400" />
            )}
            <span>
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
        <span
          className={clsx(
            'px-1.5 py-0.2 rounded border text-[10px] font-medium',
            priorityConfig[task.priority]?.cls
          )}
        >
          {priorityConfig[task.priority]?.label}
        </span>
      </div>

      {/* Quick Move / Action buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
        <div className="flex items-center gap-1">
          {task.status !== 'SUCCESS' && (
            <button
              onClick={() => onStatusChange(task.id, 'SUCCESS')}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2 py-0.5 rounded transition font-medium cursor-pointer"
            >
              ✓ Complete
            </button>
          )}
          {task.status !== 'FAILED' && (
            <button
              onClick={() => onStatusChange(task.id, 'FAILED')}
              className="text-[11px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-0.5 rounded transition font-medium cursor-pointer"
            >
              ✗ Fail
            </button>
          )}
          {task.status !== 'PROCESS' && (
            <button
              onClick={() => onStatusChange(task.id, 'PROCESS')}
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 px-2 py-0.5 rounded transition font-medium cursor-pointer"
            >
              ↩ Reopen
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => router.push(`/dashboard/tasks/edit/${task.id}`)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Edit"
          >
            <SquarePen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data.tasks || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleStatusChange = async (
    id: number,
    status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  ) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    await fetch(`/api/tasks/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const handleDragStart = (id: number) => setDraggingId(id)
  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    setDragOverCol(colId)
  }
  const handleDragLeave = () => setDragOverCol(null)
  const handleDrop = async (
    e: React.DragEvent,
    colId: 'PROCESS' | 'SUCCESS' | 'FAILED'
  ) => {
    e.preventDefault()
    setDragOverCol(null)
    if (draggingId === null) return
    const task = tasks.find((t) => t.id === draggingId)
    if (!task || task.status === colId) {
      setDraggingId(null)
      return
    }
    await handleStatusChange(draggingId, colId)
    setDraggingId(null)
  }

  const filtered =
    filterPriority === 'ALL'
      ? tasks
      : tasks.filter((t) => t.priority === filterPriority)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Kanban Board
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Drag cards between status columns or use quick action tags.
          </p>
        </div>

        <Link
          href="/dashboard/tasks/create"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Link>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 mr-1">
          Priority:
        </span>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={clsx(
              'px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer border',
              filterPriority === p
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            )}
          >
            {p}
          </button>
        ))}
        <span className="text-xs text-zinc-400 ml-2">
          {filtered.length} tasks
        </span>
      </div>

      {/* Columns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-zinc-100/60 dark:bg-zinc-900/40 rounded-xl p-4 space-y-3"
            >
              <div className="h-8 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg animate-pulse" />
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="h-28 bg-white dark:bg-zinc-900 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.id)
            const Icon = col.icon
            const isDropTarget = dragOverCol === col.id

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={clsx(
                  'rounded-xl border p-3.5 space-y-3 transition-all duration-150',
                  'bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800',
                  isDropTarget &&
                    'ring-2 ring-blue-500/30 border-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                )}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <span className={clsx('w-2 h-2 rounded-full', col.dot)} />
                    <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
                      {col.label}
                    </span>
                  </div>
                  <span
                    className={clsx(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      col.headerBadge
                    )}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Drop indicator banner */}
                {isDropTarget && draggingId !== null && (
                  <div className="border border-dashed border-blue-400 dark:border-blue-500 rounded-lg py-3 text-center text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-950/30">
                    Release to move to {col.label}
                  </div>
                )}

                {/* Task Cards in Column */}
                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onDragStart={handleDragStart}
                    />
                  ))}

                  {colTasks.length === 0 && !isDropTarget && (
                    <div className="py-10 text-center">
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        No tasks in this stage
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Add link */}
                <Link
                  href="/dashboard/tasks/create"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
