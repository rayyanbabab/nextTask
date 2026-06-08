import { prisma } from '@/lib/prisma'
import {
  Users,
  ClipboardList,
  MessageSquare,
  CheckCircle,
  ActivitySquare,
  Trophy,
} from 'lucide-react'

export default async function AdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    usersCount,
    tasksCount,
    commentsCount,
    completedToday,
    statusCounts,
    topUsers,
    logs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.comment.count(),
    prisma.task.count({ where: { status: 'SUCCESS', completedAt: { gte: today } } }),
    prisma.task.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { tasks: true } },
      },
      orderBy: { tasks: { _count: 'desc' } },
      take: 5,
    }),
    prisma.activityLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
  ])

  // Build status map
  const statusMap: Record<string, number> = { PROCESS: 0, SUCCESS: 0, FAILED: 0 }
  for (const s of statusCounts) statusMap[s.status] = s._count._all
  const total = statusMap.PROCESS + statusMap.SUCCESS + statusMap.FAILED || 1

  // Donut chart segments (SVG circle, r=15.9, circumference=100)
  const donutData = [
    { label: 'Proses', value: statusMap.PROCESS, color: '#6366f1' },
    { label: 'Selesai', value: statusMap.SUCCESS, color: '#10b981' },
    { label: 'Gagal', value: statusMap.FAILED, color: '#f43f5e' },
  ]

  // Calculate SVG stroke-dasharray/offset for donut
  let cumulativePct = 0
  const donutSegments = donutData.map(d => {
    const pct = (d.value / total) * 100
    const offset = -cumulativePct
    cumulativePct += pct
    return { ...d, pct, offset }
  })

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan aktivitas seluruh sistem</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
          label="Total User"
          value={usersCount}
        />
        <StatCard
          icon={<ClipboardList className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          label="Total Tugas"
          value={tasksCount}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Selesai Hari Ini"
          value={completedToday}
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50"
          label="Total Komentar"
          value={commentsCount}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Donut Chart — Task Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Distribusi Status Tugas</h2>
          <div className="flex items-center gap-8">
            {/* SVG Donut */}
            <div className="relative flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="3.5"
                    strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="butt"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{tasksCount}</span>
                <span className="text-xs text-gray-400">tugas</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 flex-1">
              {donutData.map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-sm text-gray-600">{d.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{d.value}</span>
                    <span className="text-xs text-gray-400 ml-1.5">
                      ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Active Users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Top 5 User Teraktif
          </h2>
          <div className="space-y-3">
            {topUsers.map((u, i) => {
              const pct = tasksCount > 0 ? Math.round((u._count.tasks / tasksCount) * 100) : 0
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center flex-shrink-0">
                    {medals[i] ?? <span className="text-gray-400 text-xs font-bold">#{i + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{u._count.tasks} tugas</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                        style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {topUsers.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada data.</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ActivitySquare className="w-4 h-4 text-indigo-500" />
          Aktivitas Terbaru
        </h2>
        <ul className="space-y-2">
          {logs.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-4">Belum ada aktivitas.</li>
          )}
          {logs.map(log => (
            <li
              key={log.id}
              className="flex items-start justify-between gap-4 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 mt-2" />
                <div>
                  <span className="text-xs font-semibold text-indigo-600 mr-1.5">{log.user.name}</span>
                  <span className="text-sm text-gray-700">{log.action}</span>
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString('id-ID', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: number
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value.toLocaleString('id-ID')}</p>
      </div>
    </div>
  )
}
