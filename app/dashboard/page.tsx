'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  Kanban,
  BarChart3,
  ChevronRight,
  CalendarClock,
  ArrowUpRight,
  ListTodo,
} from 'lucide-react'
import clsx from 'clsx'

type Stats = {
  total: number
  inProgress: number
  completed: number
  failed: number
  overdue: number
  successRate: number
}

type ChartPoint = { label: string; count: number }

type Task = {
  id: number
  title: string
  dueDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: string
  category?: { name: string }
  labels: { label: { name: string; color: string } }[]
}

const priorityColors = {
  HIGH: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60',
  MEDIUM: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60',
  LOW: 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [todayDue, setTodayDue] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats)
        setChartData(data.chartData || [])
        setTodayDue(data.todayDue || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const maxCount = Math.max(...chartData.map((d) => d.count), 1)

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.total ?? 0,
      icon: ListTodo,
      badge: 'All time',
      color: 'text-zinc-900 dark:text-zinc-100',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Clock,
      badge: 'Active',
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      badge: `${stats?.successRate ?? 0}% Rate`,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Overdue',
      value: stats?.overdue ?? 0,
      icon: AlertTriangle,
      badge: stats?.overdue ? 'Attention' : 'On Track',
      color: stats?.overdue ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Workspace Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time execution metrics and upcoming milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/kanban"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium transition shadow-xs"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </Link>

          <Link
            href="/dashboard/tasks/create"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-zinc-900/90 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-xs transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {card.label}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {card.badge}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {loading ? (
                    <div className="h-8 w-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                  ) : (
                    card.value
                  )}
                </div>
                <Icon className={clsx('w-4 h-4', card.color)} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Grid: Completion Activity + Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/90 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tasks Completed
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Activity across the last 7 days
              </p>
            </div>
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          {loading ? (
            <div className="h-44 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-end gap-2 sm:gap-3 h-44 pt-4 border-b border-zinc-100 dark:border-zinc-800">
              {chartData.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-2 group"
                >
                  <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {d.count > 0 ? d.count : ''}
                  </span>
                  <div
                    className="w-full max-w-[42px] rounded-t-md transition-all duration-300"
                    style={{
                      height: `${Math.max((d.count / maxCount) * 110, d.count > 0 ? 8 : 3)}px`,
                      background:
                        d.count > 0
                          ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)'
                          : 'var(--border, #e2e8f0)',
                    }}
                    title={`${d.count} tasks on ${d.label}`}
                  />
                  <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 pb-1">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Rate Donut */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Completion Rate
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Total task outcome ratio
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="flex flex-col items-center justify-center py-2 gap-4">
            {/* SVG Ring */}
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  className="text-zinc-100 dark:text-zinc-800"
                  strokeWidth="3.2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.2"
                  strokeDasharray={`${stats?.successRate ?? 0} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {stats?.successRate ?? 0}%
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400">
                  Success
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="w-full space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Completed</span>
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats?.completed ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>In Progress</span>
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats?.inProgress ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Failed</span>
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats?.failed ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Due Today Tasks */}
      <div className="bg-white dark:bg-zinc-900/90 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs transition-colors overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Due Today
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {todayDue.length} {todayDue.length === 1 ? 'task' : 'tasks'} scheduled for today
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/tasks"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayDue.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              No tasks due today. All caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {todayDue.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="flex items-center gap-3.5 px-5 py-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors group text-xs"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                    {task.category && <span>{task.category.name}</span>}
                    {task.labels?.slice(0, 2).map(({ label }) => (
                      <span
                        key={label.name}
                        className="px-1.5 py-0.2 rounded-full font-medium"
                        style={{
                          backgroundColor: label.color + '20',
                          color: label.color,
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>

                <span
                  className={clsx(
                    'text-[10px] font-semibold px-2 py-0.5 rounded border',
                    priorityColors[task.priority]
                  )}
                >
                  {task.priority}
                </span>

                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
