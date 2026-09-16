'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Clock, X, ChevronRight, CheckCircle2 } from 'lucide-react'
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
        'relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-300 mb-6',
        hasOverdue
          ? 'bg-rose-50/90 border-rose-200 text-rose-950 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-200'
          : 'bg-amber-50/90 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-200'
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side: Icon & Content */}
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs',
              hasOverdue
                ? 'bg-rose-500 text-white dark:bg-rose-600'
                : 'bg-amber-500 text-white dark:bg-amber-600'
            )}
          >
            {hasOverdue ? <AlertCircle className="w-5 h-5 animate-pulse" /> : <Clock className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base">
                {hasOverdue ? 'Perhatian: Ada Tugas Terlambat!' : 'Pengingat Batas Waktu Hari Ini'}
              </span>
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase',
                  hasOverdue
                    ? 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                    : 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                )}
              >
                {hasOverdue ? `${overdueTasks.length} Overdue` : `${todayTasks.length} Hari Ini`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-opacity-90 leading-relaxed opacity-90">
              {hasOverdue ? (
                <>
                  Anda memiliki{' '}
                  <strong className="font-semibold underline underline-offset-2">
                    {overdueTasks.length} tugas yang telah melewati batas waktu
                  </strong>
                  {todayTasks.length > 0 && ` dan ${todayTasks.length} tugas yang harus diselesaikan hari ini`}
                  . Segera selesaikan atau perbarui jadwalnya.
                </>
              ) : (
                <>
                  Ada <strong>{todayTasks.length} tugas</strong> yang jatuh tempo hari ini. Jangan lupa untuk
                  memeriksanya agar tidak terlewat!
                </>
              )}
            </p>

            {/* Quick Preview Chips */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {(hasOverdue ? overdueTasks : todayTasks).slice(0, 3).map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/tasks/${task.id}`}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border',
                    hasOverdue
                      ? 'bg-white/80 hover:bg-white text-rose-900 border-rose-200/70 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 dark:text-rose-100 dark:border-rose-800/80'
                      : 'bg-white/80 hover:bg-white text-amber-900 border-amber-200/70 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 dark:text-amber-100 dark:border-amber-800/80'
                  )}
                >
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{task.title}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </Link>
              ))}
              {(hasOverdue ? overdueTasks : todayTasks).length > 3 && (
                <span className="text-xs opacity-75 font-medium">
                  +{ (hasOverdue ? overdueTasks : todayTasks).length - 3 } lainnya
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
          <Link
            href="/dashboard/tasks"
            className={clsx(
              'px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-1.5',
              hasOverdue
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            )}
          >
            <span>Buka Tugas</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleDismiss}
            aria-label="Tutup pemberitahuan"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-black/5 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Sembunyikan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
