'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Calendar,
  Folder,
} from 'lucide-react'
import clsx from 'clsx'

interface TaskUser {
  id: number
  name: string
  email: string
}

interface Task {
  id: number
  title: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string | null
  createdAt: string
  user: TaskUser
  category: { name: string } | null
}

interface FetchResult {
  tasks: Task[]
  total: number
  page: number
  limit: number
}

interface SimpleUser {
  id: number
  name: string
  email: string
}

const STATUS_STYLES: Record<string, string> = {
  PROCESS:
    'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
  SUCCESS:
    'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
  FAILED:
    'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60',
}

const STATUS_LABELS: Record<string, string> = {
  PROCESS: 'In Progress',
  SUCCESS: 'Completed',
  FAILED: 'Failed',
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  MEDIUM:
    'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
  HIGH: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
}

export default function AdminTaskExplorer() {
  const [data, setData] = useState<FetchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [userList, setUserList] = useState<SimpleUser[]>([])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((users: SimpleUser[]) => setUserList(users || []))
      .catch(console.error)
  }, [])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      if (statusFilter) params.set('status', statusFilter)
      if (priorityFilter) params.set('priority', priorityFilter)
      if (userFilter) params.set('userId', userFilter)

      const res = await fetch(`/api/admin/tasks?${params.toString()}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, priorityFilter, userFilter])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, priorityFilter, userFilter, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const tasks =
    data?.tasks.filter(
      (t) =>
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.user.name.toLowerCase().includes(search.toLowerCase())
    ) ?? []

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <ClipboardList className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
          <span>Global Task Explorer</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {data ? `${data.total} tasks registered across all users` : 'Loading system tasks...'}
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap gap-2.5">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search task or user name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
          />
        </form>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="h-10 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none cursor-pointer"
        >
          <option value="">All Users</option>
          {userList.map((u) => (
            <option key={u.id} value={String(u.id)}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="PROCESS">In Progress</option>
          <option value="SUCCESS">Completed</option>
          <option value="FAILED">Failed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-10 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs focus:outline-none cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            Loading tasks...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                    <th className="px-6 py-3.5">Task Title</th>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Priority</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Due Date</th>
                    <th className="px-6 py-3.5">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {tasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-zinc-400"
                      >
                        No tasks found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        {/* Title */}
                        <td className="px-6 py-4 max-w-xs truncate font-medium text-zinc-900 dark:text-zinc-100">
                          {task.title}
                        </td>

                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                            <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{task.user.name}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
                              STATUS_STYLES[task.status]
                            )}
                          >
                            {STATUS_LABELS[task.status] || task.status}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4">
                          <span
                            className={clsx(
                              'inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium',
                              PRIORITY_STYLES[task.priority]
                            )}
                          >
                            {task.priority}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {task.category ? (
                            <span className="inline-flex items-center gap-1">
                              <Folder className="w-3 h-3 text-zinc-400" />
                              <span>{task.category.name}</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {task.dueDate ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              <span>
                                {new Date(task.dueDate).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )}
                              </span>
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>

                        {/* Created */}
                        <td className="px-6 py-4 text-zinc-400 font-mono text-[11px]">
                          {new Date(task.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
