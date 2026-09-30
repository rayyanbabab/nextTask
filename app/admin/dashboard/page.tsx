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

  // Donut chart segments
  const donutData = [
    { label: 'In Progress', value: statusMap.PROCESS, color: '#f59e0b' },
    { label: 'Completed', value: statusMap.SUCCESS, color: '#10b981' },
    { label: 'Failed', value: statusMap.FAILED, color: '#ef4444' },
  ]

  let cumulativePct = 0
  const donutSegments = donutData.map((d) => {
    const pct = (d.value / total) * 100
    const offset = -cumulativePct
    cumulativePct += pct
    return { ...d, pct, offset }
  })

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin Overview
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          System telemetry, organization-wide metrics, and global audit logs.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          icon={<Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          iconBg="bg-indigo-50 dark:bg-indigo-950/50"
          label="Total Users"
          value={usersCount}
        />
        <StatCard
          icon={<ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/50"
          label="Total Tasks"
          value={tasksCount}
        />
        <StatCard
          icon={<CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          label="Completed Today"
          value={completedToday}
        />
        <StatCard
          icon={<MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
          iconBg="bg-violet-50 dark:bg-violet-950/50"
          label="Total Comments"
          value={commentsCount}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 flex flex-col justify-between transition-colors">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Global Task Status Distribution
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
            <div className="relative flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  strokeWidth="3.2"
                />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="3.2"
                    strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="butt"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {tasksCount}
                </span>
                <span className="text-[10px] uppercase font-semibold text-zinc-400">
                  Tasks
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 w-full text-xs">
              {donutData.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between text-zinc-600 dark:text-zinc-400"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: d.color }}
                    />
                    <span>{d.label}</span>
                  </div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    <span>{d.value}</span>
                    <span className="text-zinc-400 font-normal ml-1.5">
                      ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 space-y-4 transition-colors">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Most Active Contributors</span>
          </h2>
          <div className="space-y-3">
            {topUsers.map((u, i) => {
              const pct =
                tasksCount > 0 ? Math.round((u._count.tasks / tasksCount) * 100) : 0
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 w-5 text-center">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {u.name}
                      </p>
                      <span className="text-zinc-400 font-mono">
                        {u._count.tasks} tasks
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            {topUsers.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-6">
                No user records available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 space-y-4 transition-colors">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ActivitySquare className="w-4 h-4 text-indigo-500" />
          <span>System Activity Log</span>
        </h2>
        <ul className="space-y-2">
          {logs.length === 0 && (
            <li className="text-xs text-zinc-400 text-center py-6">
              No activity logs recorded.
            </li>
          )}
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex items-start justify-between gap-4 px-4 py-2.5 rounded-lg bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                <div>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1.5">
                    {log.user.name}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {log.action}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-zinc-400 shrink-0 font-mono">
                {new Date(log.createdAt).toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
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
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-5 flex items-center gap-3.5 transition-colors">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {label}
        </p>
        <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
