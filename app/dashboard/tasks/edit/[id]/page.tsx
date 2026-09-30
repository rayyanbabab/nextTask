'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, ArrowLeft, Calendar, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

type Task = {
  id: number
  title: string
  description?: string
  dueDate?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  categoryId?: number
  recurrence?: string
  recurrenceEnd?: string
}

const RECURRENCE_OPTIONS = [
  { value: 'NONE', label: 'Does not repeat' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKDAYS', label: 'Every weekday (Mon–Fri)' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Monthly' },
]

const PRIORITIES: { label: string; value: Task['priority'] }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
]

export default function EditTaskPage() {
  const { id } = useParams()
  const router = useRouter()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`)
        const data = await res.json()
        setTask(data.task)

        const resCat = await fetch('/api/categories')
        const cats = await resCat.json()
        setCategories(cats.categories || [])
      } catch (err) {
        console.error('Failed to load task details', err)
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...task,
      recurrenceEnd:
        task?.recurrence !== 'NONE' && task?.recurrenceEnd
          ? task.recurrenceEnd
          : null,
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/dashboard/tasks')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update task')
      }
    } catch {
      setError('A network error occurred while updating task')
    } finally {
      setLoading(false)
    }
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-zinc-400 text-xs">
        Loading task properties...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top back navigation */}
      <div>
        <Link
          href={`/dashboard/tasks/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Task Details</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-2">
          Edit Task
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Modify title, deadlines, category assignment, or recurring parameters.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 sm:p-7 space-y-5 transition-colors">
        {error && (
          <div className="p-3 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            required
          />

          <Textarea
            label="Description"
            name="description"
            rows={3}
            value={task.description || ''}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            placeholder="Enter task description..."
          />

          {/* Priority selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 tracking-tight">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setTask({ ...task, priority: p.value })}
                  className={clsx(
                    'py-2 px-3 text-xs font-semibold rounded-lg border transition cursor-pointer text-center',
                    task.priority === p.value
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <Input
            label="Due Date"
            name="dueDate"
            type="datetime-local"
            value={task.dueDate ? task.dueDate.slice(0, 16) : ''}
            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
            required
            startIcon={<Calendar className="w-4 h-4" />}
          />

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 tracking-tight">
              Category
            </label>
            <div className="relative">
              <select
                className="w-full h-10 px-3.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-zinc-950/5 cursor-pointer"
                value={task.categoryId || ''}
                onChange={(e) =>
                  setTask({
                    ...task,
                    categoryId: parseInt(e.target.value) || undefined,
                  })
                }
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurrence Block */}
          <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/30 p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>Repeat Cycle</span>
            </div>

            <div className="space-y-2">
              <select
                className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                value={task.recurrence || 'NONE'}
                onChange={(e) =>
                  setTask({
                    ...task,
                    recurrence: e.target.value,
                    recurrenceEnd: '',
                  })
                }
              >
                {RECURRENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {task.recurrence && task.recurrence !== 'NONE' && (
                <div className="pt-2">
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Repeat Until (optional)
                  </label>
                  <input
                    type="date"
                    value={
                      task.recurrenceEnd ? task.recurrenceEnd.slice(0, 10) : ''
                    }
                    onChange={(e) =>
                      setTask({ ...task, recurrenceEnd: e.target.value })
                    }
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    Leave blank to repeat indefinitely
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/tasks/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={loading}
              disabled={loading}
            >
              Update Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
