'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Folder,
} from 'lucide-react'
import clsx from 'clsx'
import { Button } from '@/components/ui/Button'

type Task = {
  id: number
  title: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string
  category?: { name: string }
}

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-rose-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-emerald-400',
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function CalendarPage() {
  const router = useRouter()
  const today = new Date()
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks?limit=1000')
      const data = await res.json()
      setTasks(data.tasks || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Build calendar grid
  const firstDay = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
  const prevMonthDays = new Date(current.year, current.month, 0).getDate()

  const cells: { date: Date | null; isCurrentMonth: boolean }[] = []
  // Pad previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(current.year, current.month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: new Date(current.year, current.month, d),
      isCurrentMonth: true,
    })
  }
  // Pad next month
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: new Date(current.year, current.month + 1, d),
      isCurrentMonth: false,
    })
  }

  // Map tasks by date
  const tasksByDate: Record<string, Task[]> = {}
  tasks.forEach((task) => {
    if (!task.dueDate) return
    const key = toKey(new Date(task.dueDate))
    if (!tasksByDate[key]) tasksByDate[key] = []
    tasksByDate[key].push(task)
  })

  const todayKey = toKey(today)

  const prevMonth = () =>
    setCurrent((c) => {
      const d = new Date(c.year, c.month - 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  const nextMonth = () =>
    setCurrent((c) => {
      const d = new Date(c.year, c.month + 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const selectedTasks = selectedDay ? tasksByDate[selectedDay] || [] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Schedule & Calendar</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Map out deadlines and view scheduling commitments across days.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => router.push('/dashboard/tasks/create')}
          className="self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Month Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
          {/* Controls */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {MONTHS[current.month]} {current.year}
              </h2>
              <button
                onClick={() =>
                  setCurrent({ year: today.getFullYear(), month: today.getMonth() })
                }
                className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer mt-0.5"
              >
                Today
              </button>
            </div>

            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-center">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          {loading ? (
            <div className="h-96 flex items-center justify-center text-zinc-400 text-xs">
              Loading calendar data...
            </div>
          ) : (
            <div className="grid grid-cols-7 divide-x divide-y divide-zinc-100 dark:divide-zinc-800/70 border-b border-zinc-100 dark:border-zinc-800">
              {cells.map((cell, i) => {
                if (!cell.date) return <div key={i} />
                const key = toKey(cell.date)
                const dayTasks = tasksByDate[key] || []
                const isToday = key === todayKey
                const isSelected = key === selectedDay
                const isOtherMonth = !cell.isCurrentMonth

                return (
                  <div
                    key={i}
                    onClick={() =>
                      setSelectedDay(key === selectedDay ? null : key)
                    }
                    className={clsx(
                      'min-h-[82px] p-1.5 transition-colors cursor-pointer flex flex-col justify-between',
                      isOtherMonth
                        ? 'bg-zinc-50/40 dark:bg-zinc-950/40 text-zinc-300 dark:text-zinc-700'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                      isSelected &&
                        'bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-inset ring-blue-500/40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={clsx(
                          'w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full',
                          isToday
                            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                            : isOtherMonth
                            ? 'text-zinc-400 dark:text-zinc-600'
                            : 'text-zinc-700 dark:text-zinc-300'
                        )}
                      >
                        {cell.date.getDate()}
                      </span>

                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 pr-1">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Task dots or micro-chips */}
                    <div className="space-y-1 mt-1">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className="text-[10px] font-medium truncate px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[9px] text-zinc-400 pl-1 block">
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Date Inspector Sidebar */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-5 space-y-4 transition-colors">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {selectedDay
                ? new Date(selectedDay).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Select a Date'}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {selectedDay
                ? `${selectedTasks.length} tasks scheduled`
                : 'Click any calendar square to view scheduled objectives.'}
            </p>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
            {selectedTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                No tasks due on this date.
              </div>
            ) : (
              selectedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                  className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {task.title}
                    </span>
                    <span
                      className={clsx(
                        'w-2 h-2 rounded-full mt-1 shrink-0',
                        PRIORITY_DOT[task.priority] || 'bg-zinc-400'
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    {task.category && (
                      <span className="flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        <span>{task.category.name}</span>
                      </span>
                    )}
                    <span className="capitalize">{task.status.toLowerCase()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
