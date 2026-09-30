'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, ArrowLeft, Calendar, Bell, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

const RECURRENCE_OPTIONS = [
  { value: 'NONE', label: 'Does not repeat' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKDAYS', label: 'Every weekday (Mon–Fri)' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Monthly' },
]

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' },
  { value: 'HIGH', label: 'High', color: 'border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400' },
]

export default function CreateTaskPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    categoryId: '',
    priority: 'MEDIUM',
    recurrence: 'NONE',
    recurrenceEnd: '',
    reminder: '',
  })

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16)
    setForm((prev) => ({ ...prev, dueDate: now }))

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (res.ok) {
          setCategories(data.categories || [])
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...form,
      dueDate: form.dueDate || undefined,
      categoryId: form.categoryId || undefined,
      recurrence: form.recurrence || 'NONE',
      recurrenceEnd:
        form.recurrence !== 'NONE' && form.recurrenceEnd
          ? form.recurrenceEnd
          : undefined,
      reminder: form.reminder || undefined,
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create task')
      } else {
        router.push('/dashboard/tasks')
      }
    } catch {
      setError('A network error occurred while creating task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top back navigation */}
      <div>
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tasks</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-2">
          Create New Task
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Specify task parameters, schedule deadlines, and configure repeat rules.
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
          {/* Title */}
          <Input
            label="Task Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Audit database indexing & query times"
            required
            autoFocus
          />

          {/* Description */}
          <Textarea
            label="Description & Context (Optional)"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            placeholder="Provide context, acceptance criteria, or relevant links..."
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
                  onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                  className={clsx(
                    'py-2 px-3 text-xs font-semibold rounded-lg border transition cursor-pointer text-center',
                    form.priority === p.value
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Due Date"
              name="dueDate"
              type="datetime-local"
              value={form.dueDate}
              onChange={handleChange}
              required
              startIcon={<Calendar className="w-4 h-4" />}
            />

            <Input
              label="Reminder Notification (Optional)"
              name="reminder"
              type="datetime-local"
              value={form.reminder}
              onChange={handleChange}
              startIcon={<Bell className="w-4 h-4" />}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 tracking-tight">
              Category
            </label>
            <div className="relative">
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full h-10 px-3.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-zinc-950/5 cursor-pointer"
              >
                <option value="">No Category Assigned</option>
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
              <span>Recurrence & Repetition</span>
            </div>

            <div className="space-y-2">
              <select
                name="recurrence"
                value={form.recurrence}
                onChange={handleChange}
                className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
              >
                {RECURRENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {form.recurrence !== 'NONE' && (
                <div className="pt-2">
                  <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    End Repeat Cycle On (Optional)
                  </label>
                  <input
                    type="date"
                    name="recurrenceEnd"
                    value={form.recurrenceEnd}
                    onChange={handleChange}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    Leave blank for an indefinite repeating task cycle.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/tasks')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={loading}
              disabled={loading}
            >
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
