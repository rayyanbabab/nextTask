'use client'

import { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Search, ChevronLeft, ChevronRight, User } from 'lucide-react'

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
  PROCESS: 'bg-blue-50 text-blue-700 border-blue-200',
  SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED:  'bg-red-50 text-red-700 border-red-200',
}
const STATUS_LABELS: Record<string, string> = {
  PROCESS: 'Proses',
  SUCCESS: 'Selesai',
  FAILED:  'Gagal',
}
const PRIORITY_STYLES: Record<string, string> = {
  LOW:    'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH:   'bg-red-100 text-red-700',
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

  // Fetch user list for filter dropdown
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then((users: SimpleUser[]) => setUserList(users))
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

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [statusFilter, priorityFilter, userFilter, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const tasks = data?.tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.user.name.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="text-indigo-600 w-6 h-6" />
          Global Task Explorer
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {data ? `${data.total} tugas dari seluruh user` : 'Memuat...'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul atau nama user..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
          />
        </form>

        {/* User Filter */}
        <select
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
        >
          <option value="">Semua User</option>
          {userList.map(u => (
            <option key={u.id} value={String(u.id)}>{u.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
        >
          <option value="">Semua Status</option>
          <option value="PROCESS">Proses</option>
          <option value="SUCCESS">Selesai</option>
          <option value="FAILED">Gagal</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
        >
          <option value="">Semua Prioritas</option>
          <option value="HIGH">Tinggi</option>
          <option value="MEDIUM">Sedang</option>
          <option value="LOW">Rendah</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Tugas</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5"><User size={12} /> User</div>
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prioritas</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Batas Waktu</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        Tidak ada tugas ditemukan.
                      </td>
                    </tr>
                  ) : (
                    tasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Title */}
                        <td className="px-6 py-4 max-w-[220px]">
                          <p className="font-medium text-gray-900 truncate">{task.title}</p>
                        </td>

                        {/* User */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800 text-xs">{task.user.name}</p>
                            <p className="text-gray-400 text-xs">{task.user.email}</p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[task.status]}`}>
                            {STATUS_LABELS[task.status]}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_STYLES[task.priority]}`}>
                            {task.priority === 'HIGH' ? 'Tinggi' : task.priority === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {task.category?.name ?? <span className="text-gray-300">—</span>}
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4 text-xs">
                          {task.dueDate ? (
                            <span className={new Date(task.dueDate) < new Date() && task.status === 'PROCESS'
                              ? 'text-red-500 font-medium'
                              : 'text-gray-500'
                            }>
                              {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(task.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Halaman {page} dari {totalPages} · Total {data?.total} tugas
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          p === page
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
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
