'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Calendar, XCircle, SquarePen, Repeat, Plus, Folder } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type RecurringTask = {
  id: number
  title: string
  description?: string
  dueDate?: string
  recurrence: string
  recurrenceEnd?: string
  priority: string
  status: string
  category?: { name: string }
}

const RECURRENCE_LABEL: Record<string, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
  WEEKDAYS: 'Mon–Fri',
}

export default function RecurringPage() {
  const [tasks, setTasks] = useState<RecurringTask[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/recurring-tasks')
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (err) {
      console.error('Failed to fetch recurring tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleStopRecurring = async (taskId: number) => {
    if (!confirm('Stop this task from repeating? It will remain as a one-time task.')) return
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recurrence: 'NONE', recurrenceEnd: null }),
      })
      fetchTasks()
    } catch (err) {
      console.error('Failed to stop recurring:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Recurring Schedules</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Automated tasks that regenerate on completion according to your recurrence rules.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => router.push('/dashboard/tasks/create')}
          className="self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Recurring Task</span>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(RECURRENCE_LABEL).map(([key, label]) => {
          const count = tasks.filter((t) => t.recurrence === key).length
          return (
            <div
              key={key}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-xs transition-colors"
            >
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {count}
              </div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                {label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task List Table */}
      {loading ? (
        <div className="h-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 animate-pulse" />
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-8">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <Repeat className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            No recurring tasks configured
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
            Tasks can be scheduled to recur daily, on weekdays, weekly, or monthly.
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/tasks/create')}
          >
            Create first recurring task
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Repeat Cycle</th>
                  <th className="px-5 py-3">Next Due</th>
                  <th className="px-5 py-3">End Date</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-5 py-3.5 max-w-xs sm:max-w-md">
                      <div
                        className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate transition"
                        onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </td>

                    {/* Recurrence Badge */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                        <RefreshCw className="w-3 h-3" />
                        <span>{RECURRENCE_LABEL[task.recurrence] || task.recurrence}</span>
                      </span>
                    </td>

                    {/* Next Due */}
                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-300">
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>

                    {/* Ends */}
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {task.recurrenceEnd ? (
                        new Date(task.recurrenceEnd).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      ) : (
                        <span className="text-zinc-400">Never</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {task.category ? (
                        <span className="inline-flex items-center gap-1">
                          <Folder className="w-3 h-3 text-zinc-400" />
                          <span>{task.category.name}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/tasks/edit/${task.id}`)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
                          title="Edit"
                        >
                          <SquarePen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStopRecurring(task.id)}
                          className="p-1.5 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-md transition"
                          title="Stop repeat"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
