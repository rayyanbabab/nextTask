'use client'

import React, { useEffect, useState } from 'react'
import TaskTable from '@/components/contents/TaskTable'
import Link from 'next/link'
import { Plus, CheckCircle2, Clock, XCircle, Layers } from 'lucide-react'
import clsx from 'clsx'

type Task = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
  updatedAt: string
  dueDate: string
  category?: {
    id: number
    name: string
  }
  failureReason?: string
  subtasks?: { id: number; completed: boolean }[]
  labels?: { label: { name: string; color: string } }[]
}

type TabType = 'PROCESS' | 'SUCCESS' | 'FAILED' | 'ALL'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('PROCESS')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks')
        const data = await res.json()
        setTasks(data.tasks || [])
      } catch (e) {
        console.error('Failed to fetch tasks', e)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const countByStatus = {
    PROCESS: tasks.filter((t) => t.status === 'PROCESS').length,
    SUCCESS: tasks.filter((t) => t.status === 'SUCCESS').length,
    FAILED: tasks.filter((t) => t.status === 'FAILED').length,
    ALL: tasks.length,
  }

  const displayedTasks =
    activeTab === 'ALL'
      ? tasks
      : tasks.filter((t) => t.status === activeTab)

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: 'PROCESS', label: 'In Progress', icon: Clock },
    { key: 'SUCCESS', label: 'Completed', icon: CheckCircle2 },
    { key: 'FAILED', label: 'Failed', icon: XCircle },
    { key: 'ALL', label: 'All Tasks', icon: Layers },
  ]

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Task Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Organize, filter, and track progress on all your active objectives.
          </p>
        </div>

        <Link
          href="/dashboard/tasks/create"
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs sm:text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Link>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key
          const count = countByStatus[key]

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 shrink-0 cursor-pointer',
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                    : 'bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-500'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Task Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-36 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <TaskTable tasks={displayedTasks} />
      )}
    </div>
  )
}
