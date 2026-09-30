'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
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

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats)
        setChartData(data.chartData || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const maxCount = Math.max(...chartData.map((d) => d.count), 1)
  const totalWeek = chartData.reduce((s, d) => s + d.count, 0)

  const donutData = stats
    ? [
        { label: 'Completed', value: stats.completed, color: '#10b981' },
        { label: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
        { label: 'Failed', value: stats.failed, color: '#ef4444' },
      ]
    : []

  const total = donutData.reduce((s, d) => s + d.value, 0)
  let cumAngle = 0
  const paths =
    total === 0
      ? []
      : donutData.map((seg) => {
          const pct = seg.value / total
          const startAngle = cumAngle
          cumAngle += pct * 360
          const endAngle = cumAngle
          const r = 60,
            cx = 80,
            cy = 80
          const toRad = (a: number) => ((a - 90) * Math.PI) / 180
          const x1 = cx + r * Math.cos(toRad(startAngle))
          const y1 = cy + r * Math.sin(toRad(startAngle))
          const x2 = cx + r * Math.cos(toRad(endAngle - 0.01))
          const y2 = cy + r * Math.sin(toRad(endAngle - 0.01))
          const large = pct > 0.5 ? 1 : 0
          return {
            ...seg,
            d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
            pct: Math.round(pct * 100),
          }
        })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Quantitative tracking of task throughput, delivery velocity, and completion health.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            label: 'Total Tasks',
            value: stats?.total,
            icon: BarChart3,
            color: 'text-zinc-900 dark:text-zinc-100',
            badge: 'All time',
          },
          {
            label: 'Success Rate',
            value: stats ? `${stats.successRate}%` : '—',
            icon: Award,
            color: 'text-emerald-600 dark:text-emerald-400',
            badge: 'Efficiency',
          },
          {
            label: 'Overdue Tasks',
            value: stats?.overdue,
            icon: AlertTriangle,
            color: stats?.overdue ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400',
            badge: stats?.overdue ? 'Urgent' : 'Clear',
          },
          {
            label: 'Completed 7d',
            value: totalWeek,
            icon: TrendingUp,
            color: 'text-blue-600 dark:text-blue-400',
            badge: 'Weekly throughput',
          },
        ].map((card) => {
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
                    card.value ?? 0
                  )}
                </div>
                <Icon className={clsx('w-4 h-4', card.color)} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart: 7 days */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900/90 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tasks Completed
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Last 7 days · {totalWeek} completed
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/60">
              <TrendingUp className="w-3 h-3" />
              <span>Velocity</span>
            </div>
          </div>

          {loading ? (
            <div className="h-48 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-end gap-3 h-48 pt-4 border-b border-zinc-100 dark:border-zinc-800">
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
                      height: `${Math.max((d.count / maxCount) * 130, d.count > 0 ? 8 : 3)}px`,
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

        {/* Donut Chart: Status breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/90 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Status Breakdown
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              Proportion of current task statuses
            </p>
          </div>

          {loading ? (
            <div className="h-44 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg animate-pulse" />
          ) : total === 0 ? (
            <div className="flex flex-col items-center justify-center h-44 text-zinc-400 text-xs">
              No task data recorded
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative">
                <svg viewBox="0 0 160 160" className="w-36 h-36">
                  {paths.map((p, i) => (
                    <path
                      key={i}
                      d={p.d}
                      fill={p.color}
                      className="hover:opacity-85 transition-opacity cursor-pointer"
                    >
                      <title>
                        {p.label}: {p.value} ({p.pct}%)
                      </title>
                    </path>
                  ))}
                  <circle
                    cx="80"
                    cy="80"
                    r="36"
                    className="fill-white dark:fill-zinc-900"
                  />
                  <text
                    x="80"
                    y="76"
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="bold"
                    className="fill-zinc-900 dark:fill-zinc-100"
                  >
                    {stats?.successRate}%
                  </text>
                  <text
                    x="80"
                    y="92"
                    textAnchor="middle"
                    fontSize="9"
                    className="fill-zinc-400"
                  >
                    Success
                  </text>
                </svg>
              </div>

              <div className="w-full space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                {donutData.map((seg) => (
                  <div
                    key={seg.label}
                    className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span>{seg.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="text-zinc-900 dark:text-zinc-100">
                        {seg.value}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-normal">
                        ({total > 0 ? Math.round((seg.value / total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Outcome Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          {
            label: 'Completed Tasks',
            value: stats?.completed,
            icon: CheckCircle2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bar: 'bg-emerald-500',
          },
          {
            label: 'In Progress Tasks',
            value: stats?.inProgress,
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bar: 'bg-amber-500',
          },
          {
            label: 'Failed Tasks',
            value: stats?.failed,
            icon: XCircle,
            color: 'text-rose-600 dark:text-rose-400',
            bar: 'bg-rose-500',
          },
        ].map((item) => {
          const Icon = item.icon
          const pct = stats?.total
            ? Math.round(((item.value ?? 0) / stats.total) * 100)
            : 0

          return (
            <div
              key={item.label}
              className="bg-white dark:bg-zinc-900/90 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-5 space-y-3 shadow-xs transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {item.label}
                </span>
                <Icon className={clsx('w-4 h-4', item.color)} />
              </div>

              <div>
                <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {loading ? '—' : item.value ?? 0}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>of {stats?.total ?? 0} total</span>
                  <span className={clsx('font-semibold', item.color)}>
                    {pct}%
                  </span>
                </div>
                <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-700', item.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
