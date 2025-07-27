// TIDAK PERLU 'use client'

import { prisma } from '@/lib/prisma'
import { ActivitySquare, Users, ClipboardList } from 'lucide-react'

export default async function AdminDashboard() {
  const [usersCount, tasksCount, logs] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.activityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<Users className="text-indigo-600 w-8 h-8" />} title="Total Users" value={usersCount} />
        <StatCard icon={<ClipboardList className="text-green-600 w-8 h-8" />} title="Total Tasks" value={tasksCount} />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-600">
          <ActivitySquare className="w-5 h-5" />
          Activity Logs
        </h2>
        <ul className="space-y-3">
          {logs.map(log => (
            <li key={log.id}
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 shadow-sm hover:shadow transition duration-200"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-800">{log.user.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{log.action}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow border border-gray-200 flex items-center gap-4">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}
