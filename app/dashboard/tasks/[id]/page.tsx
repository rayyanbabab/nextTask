'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Folder,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  SquarePen,
  Plus,
  X,
  Flag,
  AlertCircle,
  ChevronDown,
  MessageSquare,
  Send,
  Check,
} from 'lucide-react'
import clsx from 'clsx'
import { Button } from '@/components/ui/Button'

type Subtask = { id: number; title: string; completed: boolean }
type Label = { label: { name: string; color: string } }
type Comment = {
  id: number
  content: string
  createdAt: string
  user: { id: number; name: string; email: string }
}
type Task = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string
  createdAt: string
  failureReason?: string
  category?: { id: number; name: string }
  subtasks: Subtask[]
  labels: Label[]
}
type AvailableLabel = { id: number; name: string; color: string }

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
  HIGH: {
    label: 'High',
    cls: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
    dot: 'bg-rose-500',
  },
  MEDIUM: {
    label: 'Medium',
    cls: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
    dot: 'bg-amber-500',
  },
  LOW: {
    label: 'Low',
    cls: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    dot: 'bg-emerald-500',
  },
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [newSubtask, setNewSubtask] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [availableLabels, setAvailableLabels] = useState<AvailableLabel[]>([])
  const [showLabelMenu, setShowLabelMenu] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  const fetchTask = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${id}`)
      const data = await res.json()
      setTask(data.task)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTask()
    fetch('/api/labels')
      .then((r) => r.json())
      .then((d) => setAvailableLabels(d.labels || []))
    fetch(`/api/tasks/${id}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
  }, [fetchTask, id])

  const toggleSubtask = async (subtaskId: number, completed: boolean) => {
    await fetch(`/api/tasks/${id}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
    setTask((prev) =>
      prev
        ? {
            ...prev,
            subtasks: prev.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, completed: !completed } : s
            ),
          }
        : prev
    )
  }

  const addSubtask = async () => {
    if (!newSubtask.trim()) return
    setAddingSubtask(true)
    const res = await fetch(`/api/tasks/${id}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSubtask }),
    })
    const data = await res.json()
    setTask((prev) =>
      prev ? { ...prev, subtasks: [...prev.subtasks, data.subtask] } : prev
    )
    setNewSubtask('')
    setAddingSubtask(false)
  }

  const deleteSubtask = async (subtaskId: number) => {
    await fetch(`/api/tasks/${id}/subtasks/${subtaskId}`, { method: 'DELETE' })
    setTask((prev) =>
      prev
        ? {
            ...prev,
            subtasks: prev.subtasks.filter((s) => s.id !== subtaskId),
          }
        : prev
    )
  }

  const changeStatus = async (status: 'PROCESS' | 'SUCCESS' | 'FAILED') => {
    await fetch(`/api/tasks/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setTask((prev) => (prev ? { ...prev, status } : prev))
    setShowStatusMenu(false)
  }

  const toggleLabel = async (labelId: number) => {
    await fetch(`/api/tasks/${id}/labels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelId }),
    })
    fetchTask()
  }

  const deleteTask = async () => {
    if (!confirm('Permanently delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    router.push('/dashboard/tasks')
  }

  const postComment = async () => {
    if (!commentText.trim()) return
    setPostingComment(true)
    const res = await fetch(`/api/tasks/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText }),
    })
    const data = await res.json()
    if (res.ok) {
      setComments((prev) => [...prev, data.comment])
      setCommentText('')
    }
    setPostingComment(false)
  }

  const deleteComment = async (commentId: number) => {
    await fetch(`/api/tasks/${id}/comments/${commentId}`, { method: 'DELETE' })
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-4 border border-zinc-200 dark:border-zinc-800">
          <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded w-full" />
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Task record not found</p>
        <Link
          href="/dashboard/tasks"
          className="mt-3 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Return to Tasks
        </Link>
      </div>
    )
  }

  const completedCount = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length
  const progress =
    totalSubtasks > 0 ? Math.round((completedCount / totalSubtasks) * 100) : 0
  const isOverdue =
    task.status === 'PROCESS' && task.dueDate
      ? new Date(task.dueDate) < new Date()
      : false
  const sConfig = statusConfig[task.status] || statusConfig.PROCESS
  const SIcon = sConfig.icon
  const pConfig = priorityConfig[task.priority] || priorityConfig.MEDIUM

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back navigation + Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tasks</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/tasks/edit/${id}`)}
          >
            <SquarePen className="w-3.5 h-3.5 mr-1" />
            <span>Edit</span>
          </Button>

          <Button
            variant="subtleDestructive"
            size="sm"
            onClick={deleteTask}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 space-y-6 transition-colors">
        {/* Overdue alert */}
        {isOverdue && (
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-medium bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This task has passed its scheduled due date and remains incomplete.</span>
          </div>
        )}

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {task.title}
          </h1>
          {task.description ? (
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          ) : (
            <p className="text-xs text-zinc-400 italic">No description provided.</p>
          )}
        </div>

        {/* Properties metadata bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer select-none',
                sConfig.cls
              )}
            >
              <SIcon className="w-3.5 h-3.5" />
              <span>{sConfig.label}</span>
              <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
            </button>

            {showStatusMenu && (
              <div className="absolute left-0 top-full mt-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 overflow-hidden min-w-[150px] p-1 space-y-0.5">
                {Object.entries(statusConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        changeStatus(key as 'PROCESS' | 'SUCCESS' | 'FAILED')
                      }
                      className={clsx(
                        'flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer text-left',
                        task.status === key
                          ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Priority */}
          <div
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium',
              pConfig.cls
            )}
          >
            <span className={clsx('w-1.5 h-1.5 rounded-full', pConfig.dot)} />
            <span>{pConfig.label} Priority</span>
          </div>

          {/* Due date */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs font-medium text-zinc-700 dark:text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'No due date'}
            </span>
          </div>

          {/* Category */}
          {task.category && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Folder className="w-3.5 h-3.5 text-zinc-400" />
              <span>{task.category.name}</span>
            </div>
          )}
        </div>

        {/* Labels section */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Labels
            </span>
            <div className="relative">
              <button
                onClick={() => setShowLabelMenu(!showLabelMenu)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Manage labels</span>
              </button>

              {showLabelMenu && availableLabels.length > 0 && (
                <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 min-w-[180px] p-1 space-y-0.5">
                  {availableLabels.map((label) => {
                    const attached = task.labels.some(
                      (l) => l.label.name === label.name
                    )
                    return (
                      <button
                        key={label.id}
                        onClick={() => toggleLabel(label.id)}
                        className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700/60 text-xs transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {label.name}
                          </span>
                        </div>
                        {attached && (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {task.labels.length === 0 ? (
              <span className="text-xs text-zinc-400">No labels assigned</span>
            ) : (
              task.labels.map(({ label }) => (
                <span
                  key={label.name}
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: label.color + '22',
                    color: label.color,
                  }}
                >
                  {label.name}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Checklist & Subtasks
              </span>
              {totalSubtasks > 0 && (
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {completedCount}/{totalSubtasks}
                </span>
              )}
            </div>
            {totalSubtasks > 0 && (
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {progress}%
              </span>
            )}
          </div>

          {/* Progress track */}
          {totalSubtasks > 0 && (
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Subtasks List */}
          <div className="space-y-1.5">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 group transition"
              >
                <button
                  type="button"
                  onClick={() => toggleSubtask(subtask.id, subtask.completed)}
                  className={clsx(
                    'w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer',
                    subtask.completed
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 bg-white dark:bg-zinc-800'
                  )}
                >
                  {subtask.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span
                  className={clsx(
                    'flex-1 text-xs sm:text-sm transition-colors',
                    subtask.completed
                      ? 'line-through text-zinc-400 dark:text-zinc-500'
                      : 'text-zinc-800 dark:text-zinc-200'
                  )}
                >
                  {subtask.title}
                </span>
                <button
                  onClick={() => deleteSubtask(subtask.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-600 rounded transition cursor-pointer"
                  title="Remove subtask"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
              placeholder="Add a checklist item (press Enter)..."
              className="flex-1 h-9 px-3 text-xs sm:text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
            <Button
              size="sm"
              onClick={addSubtask}
              disabled={addingSubtask || !newSubtask.trim()}
              isLoading={addingSubtask}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Failure reason if applicable */}
        {task.status === 'FAILED' && task.failureReason && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
              <Flag className="w-3.5 h-3.5" />
              <span>Failure Reason Logged</span>
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-300">
              {task.failureReason}
            </p>
          </div>
        )}
      </div>

      {/* Discussion & Comments */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Activity & Comments
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {comments.length}
          </span>
        </div>

        {/* Comment list */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">
              No comments posted yet.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 group">
                <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                  {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0 bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {comment.user?.name || 'User'}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 rounded transition"
                  title="Delete comment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Post comment input */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-start gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                postComment()
              }
            }}
            placeholder="Write an update or progress note... (Enter to post)"
            rows={2}
            className="flex-1 text-xs sm:text-sm p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 resize-none"
          />
          <Button
            size="sm"
            onClick={postComment}
            disabled={postingComment || !commentText.trim()}
            isLoading={postingComment}
            className="h-10 px-3 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
