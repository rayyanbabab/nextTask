'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, X, AlertTriangle, CalendarClock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

type DueTask = {
  id: number
  title: string
  dueDate: string
  status: string
  isOverdue: boolean
}

export default function NotificationBell() {
  const [tasks, setTasks] = useState<DueTask[]>([])
  const [open, setOpen] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchDueTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) return
      const data = await res.json()
      const now = new Date()
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      const due: DueTask[] = (data.tasks || [])
        .filter((t: any) => t.status === 'PROCESS' && t.dueDate)
        .filter((t: any) => new Date(t.dueDate) <= today)
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate,
          status: t.status,
          isOverdue: new Date(t.dueDate) < now,
        }))
        .sort((a: DueTask, b: DueTask) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

      setTasks(due)
      if (due.length > 0) setHasNew(true)
    } catch {}
  }

  useEffect(() => {
    fetchDueTasks()
    const interval = setInterval(fetchDueTasks, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(v => !v)
    setHasNew(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {tasks.length > 0 && (
          <span className={clsx(
            'absolute top-1 right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1',
            hasNew ? 'bg-rose-500 animate-pulse' : 'bg-rose-400'
          )}>
            {tasks.length > 9 ? '9+' : tasks.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">Notifications</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Task list */}
          <div className="max-h-80 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                <CalendarClock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No tasks due today
              </div>
            ) : (
              tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => { router.push(`/dashboard/tasks/${task.id}`); setOpen(false) }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  <div className={clsx(
                    'mt-0.5 w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center',
                    task.isOverdue ? 'bg-rose-100' : 'bg-amber-100'
                  )}>
                    <AlertTriangle className={clsx('w-3.5 h-3.5', task.isOverdue ? 'text-rose-500' : 'text-amber-500')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className={clsx('text-xs mt-0.5', task.isOverdue ? 'text-rose-500 font-semibold' : 'text-gray-400')}>
                      {task.isOverdue ? '⚠ Overdue · ' : 'Due today · '}
                      {new Date(task.dueDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {tasks.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { router.push('/dashboard/tasks'); setOpen(false) }}
                className="text-xs text-blue-600 font-semibold hover:text-blue-700"
              >
                View all tasks →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
