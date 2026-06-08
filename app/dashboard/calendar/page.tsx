'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react'
import clsx from 'clsx'

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

const STATUS_OPACITY: Record<string, string> = {
  PROCESS: 'opacity-100',
  SUCCESS: 'opacity-50 line-through',
  FAILED: 'opacity-40',
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}

export default function CalendarPage() {
  const router = useRouter()
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
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

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Build calendar grid
  const firstDay = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
  const prevMonthDays = new Date(current.year, current.month, 0).getDate()

  const cells: { date: Date | null; isCurrentMonth: boolean }[] = []
  // Pad previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(current.year, current.month - 1, prevMonthDays - i), isCurrentMonth: false })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(current.year, current.month, d), isCurrentMonth: true })
  }
  // Pad next month to fill 6 rows
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(current.year, current.month + 1, d), isCurrentMonth: false })
  }

  // Map tasks by date key
  const tasksByDate: Record<string, Task[]> = {}
  tasks.forEach(task => {
    if (!task.dueDate) return
    const key = toKey(new Date(task.dueDate))
    if (!tasksByDate[key]) tasksByDate[key] = []
    tasksByDate[key].push(task)
  })

  const todayKey = toKey(today)

  const prevMonth = () => setCurrent(c => {
    const d = new Date(c.year, c.month - 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const nextMonth = () => setCurrent(c => {
    const d = new Date(c.year, c.month + 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const selectedTasks = selectedDay ? (tasksByDate[selectedDay] || []) : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-500" />
            Calendar
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage tasks by due date</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/tasks/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">{MONTHS[current.month]} {current.year}</h2>
              <button onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium mt-0.5">
                Back to today
              </button>
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          {loading ? (
            <div className="h-96 flex items-center justify-center text-gray-400 text-sm animate-pulse">
              Loading calendar…
            </div>
          ) : (
            <div className="grid grid-cols-7">
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
                    onClick={() => setSelectedDay(key === selectedDay ? null : key)}
                    className={clsx(
                      'min-h-[80px] p-1.5 border-b border-r border-gray-100 cursor-pointer transition-colors',
                      isOtherMonth ? 'bg-gray-50' : 'hover:bg-blue-50',
                      isSelected && 'bg-blue-50 ring-2 ring-inset ring-blue-400',
                      (i + 1) % 7 === 0 && 'border-r-0'
                    )}
                  >
                    {/* Day number */}
                    <div className={clsx(
                      'w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-full mb-1',
                      isToday ? 'bg-blue-600 text-white' : isOtherMonth ? 'text-gray-300' : 'text-gray-700'
                    )}>
                      {cell.date.getDate()}
                    </div>

                    {/* Task chips */}
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/tasks/${task.id}`) }}
                          title={task.title}
                          className={clsx(
                            'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:opacity-80 transition-opacity',
                            STATUS_OPACITY[task.status],
                            task.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                              task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', PRIORITY_DOT[task.priority])} />
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[10px] text-gray-400 font-medium px-1">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right panel — selected day detail */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {selectedDay ? (
            <>
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-base">
                  {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric'
                  })}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</p>
              </div>

              {selectedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 mb-3">No tasks on this day</p>
                  <button
                    onClick={() => router.push(`/dashboard/tasks/create`)}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700"
                  >
                    + Create a task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTasks.map(task => (
                    <div key={task.id}
                      onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors group">
                      <span className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', PRIORITY_DOT[task.priority])} />
                      <div className="flex-1 min-w-0">
                        <p className={clsx('text-sm font-medium text-gray-900 truncate group-hover:text-blue-700',
                          task.status === 'SUCCESS' && 'line-through text-gray-400')}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium',
                            task.status === 'PROCESS' ? 'bg-amber-100 text-amber-700' :
                            task.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-rose-100 text-rose-700')}>
                            {task.status === 'PROCESS' ? 'In Progress' : task.status === 'SUCCESS' ? 'Done' : 'Failed'}
                          </span>
                          {task.category && (
                            <span className="text-xs text-gray-400">{task.category.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <CalendarDays className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">Click a date to see tasks</p>
              <p className="text-xs text-gray-400 mt-1">Tasks are shown by their due date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
