'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, Folder, Clock, CheckCircle2, XCircle,
  Trash2, SquarePen, Plus, X, Tag, Flag,
  AlertTriangle, ChevronDown, MessageSquare, Send
} from 'lucide-react'
import clsx from 'clsx'

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
  PROCESS: { label: 'In Progress', icon: Clock, cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  SUCCESS: { label: 'Completed', icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  FAILED: { label: 'Failed', icon: XCircle, cls: 'bg-rose-100 text-rose-700 border-rose-200' },
}
const priorityConfig = {
  HIGH: { label: 'High', cls: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  MEDIUM: { label: 'Medium', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  LOW: { label: 'Low', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
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
    const res = await fetch(`/api/tasks/${id}`)
    const data = await res.json()
    setTask(data.task)
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchTask()
    fetch('/api/labels').then(r => r.json()).then(d => setAvailableLabels(d.labels || []))
    // fetch comments
    fetch(`/api/tasks/${id}/comments`).then(r => r.json()).then(d => setComments(d.comments || []))
  }, [fetchTask, id])

  const toggleSubtask = async (subtaskId: number, completed: boolean) => {
    await fetch(`/api/tasks/${id}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
    setTask(prev => prev ? {
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !completed } : s)
    } : prev)
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
    setTask(prev => prev ? { ...prev, subtasks: [...prev.subtasks, data.subtask] } : prev)
    setNewSubtask('')
    setAddingSubtask(false)
  }

  const deleteSubtask = async (subtaskId: number) => {
    await fetch(`/api/tasks/${id}/subtasks/${subtaskId}`, { method: 'DELETE' })
    setTask(prev => prev ? { ...prev, subtasks: prev.subtasks.filter(s => s.id !== subtaskId) } : prev)
  }

  const changeStatus = async (status: 'PROCESS' | 'SUCCESS' | 'FAILED') => {
    await fetch(`/api/tasks/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setTask(prev => prev ? { ...prev, status } : prev)
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
    if (!confirm('Delete this task?')) return
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
      setComments(prev => [...prev, data.comment])
      setCommentText('')
    }
    setPostingComment(false)
  }

  const deleteComment = async (commentId: number) => {
    await fetch(`/api/tasks/${id}/comments/${commentId}`, { method: 'DELETE' })
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  )

  if (!task) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Task not found</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 text-sm">Go back</button>
    </div>
  )

  const completedCount = task.subtasks.filter(s => s.completed).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? Math.round((completedCount / totalSubtasks) * 100) : 0
  const isOverdue = task.status === 'PROCESS' && new Date(task.dueDate) < new Date()
  const sConfig = statusConfig[task.status]
  const SIcon = sConfig.icon
  const pConfig = priorityConfig[task.priority]
  const attachedLabelIds = task.labels.map(l => availableLabels.find(al => al.name === l.label.name)?.id)

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/dashboard/tasks/edit/${id}`)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <SquarePen className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={deleteTask}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {/* Title + Status */}
        <div className="space-y-3">
          {isOverdue && (
            <div className="flex items-center gap-2 text-rose-600 text-sm font-medium bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
              <AlertTriangle className="w-4 h-4" /> This task is overdue!
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          {task.description && (
            <p className="text-gray-500 text-sm leading-relaxed">{task.description}</p>
          )}
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap gap-3">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors', sConfig.cls)}
            >
              <SIcon className="w-3.5 h-3.5" />
              {sConfig.label}
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>
            {showStatusMenu && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[160px]">
                {Object.entries(statusConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <button
                      key={key}
                      onClick={() => changeStatus(key as 'PROCESS' | 'SUCCESS' | 'FAILED')}
                      className={clsx(
                        'flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium transition-colors hover:bg-gray-50',
                        task.status === key ? 'text-blue-600' : 'text-gray-700'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" /> {cfg.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold', pConfig.cls, 'border-transparent')}>
            <div className={clsx('w-2 h-2 rounded-full', pConfig.dot)} />
            {pConfig.label} Priority
          </div>

          {/* Due Date */}
          <div className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium',
            isOverdue ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-gray-50 text-gray-600 border-gray-200'
          )}>
            <Calendar className="w-3.5 h-3.5" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          {/* Category */}
          {task.category && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-medium">
              <Folder className="w-3.5 h-3.5" />
              {task.category.name}
            </div>
          )}
        </div>

        {/* Labels */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" /> Labels
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLabelMenu(!showLabelMenu)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add label
              </button>
              {showLabelMenu && availableLabels.length > 0 && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[180px] p-2 space-y-1">
                  {availableLabels.map(label => {
                    const attached = task.labels.some(l => l.label.name === label.name)
                    return (
                      <button
                        key={label.id}
                        onClick={() => toggleLabel(label.id)}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-50 text-xs"
                      >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                        <span className="flex-1 text-left text-gray-700">{label.name}</span>
                        {attached && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      </button>
                    )
                  })}
                  {availableLabels.length === 0 && (
                    <p className="text-xs text-gray-400 px-3 py-2">No labels yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {task.labels.length === 0 ? (
              <p className="text-xs text-gray-400">No labels attached</p>
            ) : task.labels.map(({ label }) => (
              <span
                key={label.name}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: label.color + '22', color: label.color, border: `1px solid ${label.color}44` }}
              >
                {label.name}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Subtasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">Subtasks</span>
              {totalSubtasks > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {completedCount}/{totalSubtasks}
                </span>
              )}
            </div>
            {totalSubtasks > 0 && (
              <span className="text-xs font-bold text-blue-600">{progress}%</span>
            )}
          </div>

          {/* Progress Bar */}
          {totalSubtasks > 0 && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Subtask List */}
          <div className="space-y-2">
            {task.subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 group transition-colors">
                <button
                  onClick={() => toggleSubtask(subtask.id, subtask.completed)}
                  className={clsx(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    subtask.completed
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-gray-300 hover:border-blue-400'
                  )}
                >
                  {subtask.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <span className={clsx(
                  'flex-1 text-sm transition-colors',
                  subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'
                )}>
                  {subtask.title}
                </span>
                <button
                  onClick={() => deleteSubtask(subtask.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-rose-500 rounded transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSubtask()}
              placeholder="Add a subtask... (press Enter)"
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              onClick={addSubtask}
              disabled={addingSubtask || !newSubtask.trim()}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Failure Reason */}
        {task.status === 'FAILED' && task.failureReason && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm mb-1">
              <Flag className="w-4 h-4" /> Failure Reason
            </div>
            <p className="text-rose-600 text-sm">{task.failureReason}</p>
          </div>
        )}

        {/* Created date */}
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-50">
          Created on {new Date(task.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* ── Comments Section ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          Comments
          <span className="text-xs text-gray-400 font-normal bg-gray-100 px-2 py-0.5 rounded-full ml-1">{comments.length}</span>
        </div>

        {/* Comment list */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3 group">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {comment.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{comment.user.name}</span>
                    <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
                </div>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-rose-500 rounded transition-all flex-shrink-0"
                  title="Delete comment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* New comment input */}
        <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
            Me
          </div>
          <div className="flex-1 flex items-end gap-2">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment() } }}
              placeholder="Write a comment... (Enter to post)"
              rows={2}
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              onClick={postComment}
              disabled={postingComment || !commentText.trim()}
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
