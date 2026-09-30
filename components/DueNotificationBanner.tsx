'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Clock, X, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

type TaskItem = {
  id: number
  title: string
  dueDate: string
  status: string
}

export default function DueNotificationBanner() {
  const [overdueTasks, setOverdueTasks] = useState<TaskItem[]>([])
  const [todayTasks, setTodayTasks] = useState<TaskItem[]>([])
  const [dismissed, setDismissed] = useState(true) // default to true until client check
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('nexttask-dismiss-due-banner') === 'true'
    if (isDismissed) {
      setLoading(false)
      return
    }

    const checkTasks = async () => {
      try {
        const res = await fetch('/api/tasks')
        if (!res.ok) return
        const data = await res.json()
        const allTasks: any[] = data.tasks || []

        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfToday = new Date(startOfToday.getTime() + 86400000)

        const active = allTasks.filter((t) => t.status === 'PROCESS' && t.dueDate)

        const overdue: TaskItem[] = []
        const today: TaskItem[] = []

        active.forEach((t) => {
          const due = new Date(t.dueDate)
          if (due < startOfToday) {
            overdue.push({ id: t.id, title: t.title, dueDate: t.dueDate, status: t.status })
          } else if (due >= startOfToday && due <= endOfToday) {
            today.push({ id: t.id, title: t.title, dueDate: t.dueDate, status: t.status })
          }
        })

        setOverdueTasks(overdue)
        setTodayTasks(today)
        setDismissed(false)
      } catch (err) {
        console.error('Failed to load due tasks for banner:', err)
      } finally {
        setLoading(false)
      }
    }

    checkTasks()
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('nexttask-dismiss-due-banner', 'true')
  }

  if (loading || dismissed) return null
  if (overdueTasks.length === 0 && todayTasks.length === 0) return null

  const hasOverdue = overdueTasks.length > 0

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl border p-4 sm:p-4.5 transition-all duration-200 mb-6 shadow-xs',
        hasOverdue
          ? 'bg-rose-50/60 border-rose-200/80 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-200'
          : 'bg-amber-50/60 border-amber-200/80 text-amber-950 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-200'
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Icon & Content */}
        <div className="flex items-start gap-3 max-w-3xl">
          <div
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
              hasOverdue
                ? 'bg-rose-500 text-white dark:bg-rose-600'
                : 'bg-amber-500 text-white dark:bg-amber-600'
            )}
          >
            {hasOverdue ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs sm:text-sm">
                {hasOverdue ? 'Perhatian: Ada Tugas Terlambat' : 'Pengingat Batas Waktu Hari Ini'}
              </span>
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase',
                  hasOverdue
                    ? 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    : 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                )}
              >
                {hasOverdue ? `${overdueTasks.length} Overdue` : `${todayTasks.length} Hari Ini`}
              </span>
            </div>

            <p className="text-xs text-opacity-90 leading-relaxed opacity-85">
              {hasOverdue ? (
                <>
                  Anda memiliki{' '}
                  <strong className="font-semibold">
                    {overdueTasks.length} tugas yang telah melewati batas waktu
                  </strong>
                  {todayTasks.length > 0 && ` dan ${todayTasks.length} tugas yang jatuh tempo hari ini`}
                  . Segera selesaikan atau jadwalkan ulang.
                </>
              ) : (
                <>
                  Ada <strong>{todayTasks.length} tugas</strong> yang jatuh tempo hari ini. Segera periksa daftar tugas Anda.
                </>
              )}
            </p>

            {/* Quick Preview Chips */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              {(hasOverdue ? overdueTasks : todayTasks).slice(0, 3).map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/tasks/${task.id}`}
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors border shadow-2xs',
                    hasOverdue
                      ? 'bg-white/90 hover:bg-white text-rose-900 border-rose-200/80 dark:bg-zinc-900/80 dark:hover:bg-zinc-900 dark:text-rose-200 dark:border-rose-900/50'
                      : 'bg-white/90 hover:bg-white text-amber-900 border-amber-200/80 dark:bg-zinc-900/80 dark:hover:bg-zinc-900 dark:text-amber-200 dark:border-amber-900/50'
                  )}
                >
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{task.title}</span>
                  <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                </Link>
              ))}
              {(hasOverdue ? overdueTasks : todayTasks).length > 3 && (
                <span className="text-[11px] opacity-75 font-medium">
                  +{ (hasOverdue ? overdueTasks : todayTasks).length - 3 } lainnya
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
          <Link
            href="/dashboard/tasks"
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1',
              hasOverdue
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            )}
          >
            <span>Buka Tugas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleDismiss}
            aria-label="Tutup pemberitahuan"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-black/5 dark:hover:bg-white/10 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
            title="Sembunyikan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
