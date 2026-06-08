import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET /api/dashboard/stats
export async function GET() {
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = user.id
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(startOfToday.getTime() + 86400000)

  const [total, inProgress, completed, failed, todayDue, overdue, recentActivity] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: 'PROCESS' } }),
    prisma.task.count({ where: { userId, status: 'SUCCESS' } }),
    prisma.task.count({ where: { userId, status: 'FAILED' } }),
    prisma.task.findMany({
      where: { userId, dueDate: { gte: startOfToday, lt: endOfToday } },
      include: { category: true, labels: { include: { label: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    prisma.task.count({
      where: { userId, status: 'PROCESS', dueDate: { lt: startOfToday } },
    }),
    // Tasks completed in last 7 days grouped by day
    prisma.task.findMany({
      where: {
        userId,
        status: 'SUCCESS',
        updatedAt: { gte: new Date(now.getTime() - 7 * 86400000) },
      },
      select: { updatedAt: true },
    }),
  ])

  // Build chart data: last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now.getTime() - (6 - i) * 86400000)
    const label = day.toLocaleDateString('en-US', { weekday: 'short' })
    const count = recentActivity.filter((t) => {
      const d = new Date(t.updatedAt)
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate()
      )
    }).length
    return { label, count }
  })

  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return NextResponse.json({
    stats: { total, inProgress, completed, failed, overdue, successRate },
    todayDue,
    chartData,
  })
}
