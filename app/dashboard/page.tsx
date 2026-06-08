'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Clock, XCircle, AlertTriangle,
  TrendingUp, Plus, LayoutGrid, BarChart3,
  Calendar, Tag, ChevronRight, Flame
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
  HIGH: 'text-rose-600 bg-rose-50 border-rose-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
  LOW: 'text-green-600 bg-green-50 border-green-200',
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [todayDue, setTodayDue] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setChartData(data.chartData)
        setTodayDue(data.todayDue)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  const statCards = [
    {
      label: 'Total Tasks', value: stats?.total ?? '—', icon: LayoutGrid,
      color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-700'
    },
    {
      label: 'In Progress', value: stats?.inProgress ?? '—', icon: Clock,
      color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700'
    },
    {
      label: 'Completed', value: stats?.completed ?? '—', icon: CheckCircle2,
      color: 'from-emerald-400 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700'
    },
    {
      label: 'Overdue', value: stats?.overdue ?? '—', icon: AlertTriangle,
      color: 'from-rose-500 to-red-600', bg: 'bg-rose-50', text: 'text-rose-700'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's your productivity overview.</p>
        </div>
        <Link
          href="/dashboard/tasks/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className={clsx('p-2.5 rounded-xl', card.bg)}>
                  <Icon className={clsx('w-5 h-5', card.text)} />
                </div>
                {card.label === 'Completed' && stats && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {stats.successRate}%
                  </span>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? <div className="h-7 w-10 bg-gray-100 rounded animate-pulse" /> : card.value}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Tasks Completed</h2>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          {loading ? (
            <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-end gap-2 h-40">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '120px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500"
                      style={{ height: `${Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 2)}%` }}
                      title={`${d.count} tasks`}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{d.label}</span>
                  {d.count > 0 && (
                    <span className="text-xs font-bold text-blue-600">{d.count}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Rate Ring */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Success Rate</h2>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* SVG Ring */}
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="url(#grad)" strokeWidth="3"
                  strokeDasharray={`${stats?.successRate ?? 0} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{stats?.successRate ?? 0}%</span>
                <span className="text-xs text-gray-400">Success</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              {[
                { label: 'Completed', count: stats?.completed ?? 0, color: 'bg-emerald-500' },
                { label: 'Failed', count: stats?.failed ?? 0, color: 'bg-rose-500' },
                { label: 'In Progress', count: stats?.inProgress ?? 0, color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <div className={clsx('w-2.5 h-2.5 rounded-full', item.color)} />
                  <span className="text-gray-600 flex-1">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Due Today</h2>
              <p className="text-xs text-gray-500">{todayDue.length} task{todayDue.length !== 1 ? 's' : ''} due today</p>
            </div>
          </div>
          <Link href="/dashboard/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayDue.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tasks due today — great job!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayDue.map(task => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors group"
              >
                <div className={clsx(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  task.priority === 'HIGH' ? 'bg-rose-500' :
                  task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.category && (
                      <span className="text-xs text-gray-400">{task.category.name}</span>
                    )}
                    {task.labels.slice(0, 2).map(({ label }) => (
                      <span
                        key={label.name}
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: label.color + '20', color: label.color }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={clsx(
                  'text-xs font-medium px-2 py-1 rounded-lg border',
                  priorityColors[task.priority]
                )}>
                  {task.priority}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Create Task', href: '/dashboard/tasks/create', icon: Plus, color: 'bg-blue-600 text-white hover:bg-blue-700' },
          { label: 'Kanban Board', href: '/dashboard/kanban', icon: LayoutGrid, color: 'bg-purple-600 text-white hover:bg-purple-700' },
          { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
          { label: 'Manage Labels', href: '/dashboard/labels', icon: Tag, color: 'bg-orange-500 text-white hover:bg-orange-600' },
        ].map(action => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className={clsx(
                'flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm',
                action.color
              )}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
