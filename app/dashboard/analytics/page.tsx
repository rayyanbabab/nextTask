'use client'

import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, CheckCircle2, XCircle, Clock, AlertTriangle, Award } from 'lucide-react'
import clsx from 'clsx'

type Stats = {
  total: number; inProgress: number; completed: number
  failed: number; overdue: number; successRate: number
}
type ChartPoint = { label: string; count: number }

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setChartData(data.chartData)
        setLoading(false)
      })
  }, [])

  const maxCount = Math.max(...chartData.map(d => d.count), 1)
  const totalWeek = chartData.reduce((s, d) => s + d.count, 0)

  const donutData = stats ? [
    { label: 'Completed', value: stats.completed, color: '#10b981', lightColor: '#d1fae5' },
    { label: 'In Progress', value: stats.inProgress, color: '#f59e0b', lightColor: '#fef3c7' },
    { label: 'Failed', value: stats.failed, color: '#ef4444', lightColor: '#fee2e2' },
  ] : []

  // SVG Donut
  const total = donutData.reduce((s, d) => s + d.value, 0)
  let cumAngle = 0
  const paths = total === 0 ? [] : donutData.map(seg => {
    const pct = seg.value / total
    const startAngle = cumAngle
    cumAngle += pct * 360
    const endAngle = cumAngle
    const r = 60, cx = 80, cy = 80
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your productivity and task completion trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats?.total, icon: BarChart3, bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Success Rate', value: stats ? `${stats.successRate}%` : '—', icon: Award, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Overdue', value: stats?.overdue, icon: AlertTriangle, bg: 'bg-rose-50', text: 'text-rose-600' },
          { label: 'This Week', value: totalWeek, icon: TrendingUp, bg: 'bg-purple-50', text: 'text-purple-600' },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.bg)}>
                <Icon className={clsx('w-5 h-5', card.text)} />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {loading ? <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" /> : (card.value ?? '—')}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart: 7 days */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Tasks Completed</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days — {totalWeek} total</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> This week
            </div>
          </div>
          {loading ? (
            <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-end gap-3 h-48">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-600 h-4">{d.count > 0 ? d.count : ''}</span>
                  <div className="w-full flex justify-center" style={{ height: '150px', alignItems: 'flex-end' }}>
                    <div
                      className="w-full max-w-[40px] rounded-t-lg transition-all duration-700 hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${Math.max((d.count / maxCount) * 140, d.count > 0 ? 10 : 2)}px`,
                        background: d.count > 0
                          ? 'linear-gradient(to top, #2563eb, #60a5fa)'
                          : '#f1f5f9'
                      }}
                      title={`${d.count} completed`}
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Donut Chart: Status breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Status Breakdown</h2>
          {loading ? (
            <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
          ) : total === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
              No task data
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <svg viewBox="0 0 160 160" className="w-36 h-36">
                {paths.map((p, i) => (
                  <path key={i} d={p.d} fill={p.color} className="hover:opacity-80 transition-opacity cursor-pointer">
                    <title>{p.label}: {p.value} ({p.pct}%)</title>
                  </path>
                ))}
                <circle cx="80" cy="80" r="36" fill="white" />
                <text x="80" y="76" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#111827">{stats?.successRate}%</text>
                <text x="80" y="92" textAnchor="middle" fontSize="9" fill="#9ca3af">Success</text>
              </svg>
              <div className="w-full space-y-2">
                {donutData.map(seg => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-sm text-gray-600 flex-1">{seg.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{seg.value}</span>
                    <span className="text-xs text-gray-400">{total > 0 ? Math.round((seg.value / total) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status breakdown detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Completed Tasks', value: stats?.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
          { label: 'In Progress Tasks', value: stats?.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' },
          { label: 'Failed Tasks', value: stats?.failed, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500' },
        ].map(item => {
          const Icon = item.icon
          const pct = stats?.total ? Math.round(((item.value ?? 0) / stats.total) * 100) : 0
          return (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className={clsx('p-2 rounded-xl', item.bg)}>
                  <Icon className={clsx('w-4 h-4', item.color)} />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{loading ? '—' : (item.value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>of {stats?.total ?? 0} total</span>
                  <span className={clsx('font-semibold', item.color)}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
