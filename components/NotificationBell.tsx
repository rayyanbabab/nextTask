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
        className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        title="Pemberitahuan"
      >
        <Bell className="w-4 h-4" />
        {tasks.length > 0 && (
          <span
            className={clsx(
              'absolute top-1.5 right-1.5 min-w-[14px] h-3.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-1 leading-none shadow-xs',
              hasNew ? 'bg-rose-500 animate-pulse' : 'bg-rose-600'
            )}
          >
            {tasks.length > 9 ? '9+' : tasks.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Pemberitahuan
              </span>
              {tasks.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {tasks.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                <CalendarClock className="w-7 h-7 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                Tidak ada tugas yang jatuh tempo hari ini
              </div>
            ) : (
              tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    router.push(`/dashboard/tasks/${task.id}`)
                    setOpen(false)
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors text-left"
                >
                  <div
                    className={clsx(
                      'mt-0.5 w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center',
                      task.isOverdue
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    )}
                  >
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {task.title}
                    </p>
                    <p
                      className={clsx(
                        'text-[11px] mt-0.5',
                        task.isOverdue
                          ? 'text-rose-600 dark:text-rose-400 font-semibold'
                          : 'text-zinc-500 dark:text-zinc-400'
                      )}
                    >
                      {task.isOverdue ? '⚠ Terlambat · ' : 'Jatuh tempo hari ini · '}
                      {new Date(task.dueDate).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {tasks.length > 0 && (
            <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/90 flex items-center justify-between">
              <button
                onClick={() => {
                  router.push('/dashboard/tasks')
                  setOpen(false)
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1"
              >
                Lihat semua tugas →
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
