'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle2, XCircle, SquarePen, Trash2, Calendar, Folder, Plus, AlertTriangle } from 'lucide-react'
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
  { id: 'PROCESS' as const, label: 'In Progress', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', headerBg: 'bg-amber-100', dot: 'bg-amber-500' },
  { id: 'SUCCESS' as const, label: 'Completed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', headerBg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  { id: 'FAILED' as const, label: 'Failed', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', headerBg: 'bg-rose-100', dot: 'bg-rose-500' },
]

const priorityConfig = {
  HIGH: { label: 'High', cls: 'bg-rose-100 text-rose-700' },
  MEDIUM: { label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
  LOW: { label: 'Low', cls: 'bg-green-100 text-green-700' },
}

function isOverdue(dueDate: string) { return new Date(dueDate) < new Date() }

function KanbanCard({ task, onStatusChange, onDelete, onDragStart }: {
  task: Task
  onStatusChange: (id: number, status: 'PROCESS' | 'SUCCESS' | 'FAILED') => void
  onDelete: (id: number) => void
  onDragStart: (id: number) => void
}) {
  const router = useRouter()
  const completedSubs = task.subtasks.filter(s => s.completed).length
  const totalSubs = task.subtasks.length
  const overdue = task.status === 'PROCESS' && isOverdue(task.dueDate)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 space-y-3 group cursor-grab active:cursor-grabbing active:opacity-70 active:scale-95"
    >
      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map(({ label }) => (
            <span key={label.name} className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: label.color + '25', color: label.color }}>
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
        onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
        {task.title}
      </h3>

      {/* Subtask progress */}
      {totalSubs > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{completedSubs}/{totalSubs} subtasks</span>
            <span>{Math.round((completedSubs / totalSubs) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(completedSubs / totalSubs) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
        {task.category && (
          <div className="flex items-center gap-1">
            <Folder className="w-3 h-3" /><span>{task.category.name}</span>
          </div>
        )}
        <div className={clsx('flex items-center gap-1', overdue && 'text-rose-500 font-medium')}>
          {overdue && <AlertTriangle className="w-3 h-3" />}
          <Calendar className="w-3 h-3" />
          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <span className={clsx('px-1.5 py-0.5 rounded-full', priorityConfig[task.priority].cls)}>
          {priorityConfig[task.priority].label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        {task.status !== 'SUCCESS' && (
          <button onClick={() => onStatusChange(task.id, 'SUCCESS')}
            className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors font-medium">
            ✓ Done
          </button>
        )}
        {task.status !== 'FAILED' && (
          <button onClick={() => onStatusChange(task.id, 'FAILED')}
            className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors font-medium">
            ✗ Failed
          </button>
        )}
        {task.status !== 'PROCESS' && (
          <button onClick={() => onStatusChange(task.id, 'PROCESS')}
            className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-lg transition-colors font-medium">
            ↩ Reopen
          </button>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => router.push(`/dashboard/tasks/edit/${task.id}`)}
            className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
            <SquarePen className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(task.id)}
            className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
    const res = await fetch('/api/tasks')
    const data = await res.json()
    setTasks(data.tasks || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleStatusChange = async (id: number, status: 'PROCESS' | 'SUCCESS' | 'FAILED') => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    await fetch(`/api/tasks/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  // DnD handlers
  const handleDragStart = (id: number) => setDraggingId(id)
  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    setDragOverCol(colId)
  }
  const handleDragLeave = () => setDragOverCol(null)
  const handleDrop = async (e: React.DragEvent, colId: 'PROCESS' | 'SUCCESS' | 'FAILED') => {
    e.preventDefault()
    setDragOverCol(null)
    if (draggingId === null) return
    const task = tasks.find(t => t.id === draggingId)
    if (!task || task.status === colId) { setDraggingId(null); return }
    await handleStatusChange(draggingId, colId)
    setDraggingId(null)
  }

  const filtered = filterPriority === 'ALL' ? tasks : tasks.filter(t => t.priority === filterPriority)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">Drag & drop cards to change their status</p>
        </div>
        <Link href="/dashboard/tasks/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Task
        </Link>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
          <button key={p} onClick={() => setFilterPriority(p)}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
              filterPriority === p ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300')}>
            {p}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-2">{filtered.length} tasks</span>
      </div>

      {/* Columns */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse" />
              {[1, 2].map(j => <div key={j} className="h-28 bg-white rounded-xl animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map(col => {
            const colTasks = filtered.filter(t => t.status === col.id)
            const Icon = col.icon
            const isDropTarget = dragOverCol === col.id
            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={clsx(
                  'rounded-2xl border p-4 space-y-3 transition-all duration-200',
                  col.bg, col.border,
                  isDropTarget && 'ring-2 ring-blue-400 ring-offset-2 scale-[1.01]'
                )}
              >
                {/* Column Header */}
                <div className={clsx('flex items-center justify-between px-3 py-2 rounded-xl', col.headerBg)}>
                  <div className="flex items-center gap-2">
                    <Icon className={clsx('w-4 h-4', col.color)} />
                    <span className={clsx('text-sm font-semibold', col.color)}>{col.label}</span>
                  </div>
                  <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full text-white', col.dot)}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Drop hint */}
                {isDropTarget && draggingId !== null && (
                  <div className="border-2 border-dashed border-blue-400 rounded-xl py-4 text-center text-xs text-blue-500 font-medium bg-blue-50">
                    Drop here to move to {col.label}
                  </div>
                )}

                {/* Cards */}
                <div className="space-y-3">
                  {colTasks.map(task => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onDragStart={handleDragStart}
                    />
                  ))}
                  {colTasks.length === 0 && !isDropTarget && (
                    <div className="py-8 text-center">
                      <p className="text-xs text-gray-400">No tasks here</p>
                    </div>
                  )}
                </div>

                {/* Add Task shortcut */}
                <Link href="/dashboard/tasks/create"
                  className="flex items-center gap-2 w-full py-2 px-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors text-xs font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add task
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
