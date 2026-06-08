'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, CalendarClock, XCircle, SquarePen, Repeat } from 'lucide-react'
import { FormCard } from '@/components/ui/FormCard'
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
  BIWEEKLY: 'Every 2 Weeks',
  MONTHLY: 'Monthly',
  WEEKDAYS: 'Weekdays (Mon–Fri)',
}

const RECURRENCE_COLOR: Record<string, string> = {
  DAILY: 'bg-orange-100 text-orange-700 border-orange-200',
  WEEKLY: 'bg-blue-100 text-blue-700 border-blue-200',
  BIWEEKLY: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  MONTHLY: 'bg-purple-100 text-purple-700 border-purple-200',
  WEEKDAYS: 'bg-teal-100 text-teal-700 border-teal-200',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-500" />
            Recurring Tasks
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tasks that repeat automatically when completed
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/tasks/create')}>
          + New Recurring Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(RECURRENCE_LABEL).map(([key, label]) => {
          const count = tasks.filter(t => t.recurrence === key).length
          return (
            <div key={key} className={`rounded-xl border p-4 ${RECURRENCE_COLOR[key] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs font-medium mt-0.5">{label}</div>
            </div>
          )
        })}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Repeat className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">No recurring tasks</h3>
          <p className="text-sm text-gray-400 mb-4">
            Create a task and set a repeat schedule to get started
          </p>
          <Button onClick={() => router.push('/dashboard/tasks/create')}>
            Create Recurring Task
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-5 py-3 font-semibold text-gray-600">Task</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Repeat</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Next Due</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Ends</th>
                  <th className="px-5 py-3 font-semibold text-gray-600">Category</th>
                  <th className="px-5 py-3 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div
                        className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer max-w-xs truncate"
                        onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{task.description}</div>
                      )}
                    </td>

                    {/* Recurrence Badge */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${RECURRENCE_COLOR[task.recurrence] || 'bg-gray-100 text-gray-600'}`}>
                        <RefreshCw className="w-3 h-3" />
                        {RECURRENCE_LABEL[task.recurrence] || task.recurrence}
                      </span>
                    </td>

                    {/* Next Due */}
                    <td className="px-5 py-4">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <CalendarClock className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Recurrence End */}
                    <td className="px-5 py-4">
                      {task.recurrenceEnd ? (
                        <span className="text-gray-600">
                          {new Date(task.recurrenceEnd).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No end date</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      {task.category ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {task.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/tasks/edit/${task.id}`)}
                          title="Edit task"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStopRecurring(task.id)}
                          title="Stop recurring"
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
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
