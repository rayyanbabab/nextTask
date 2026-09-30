'use client'

import { useState, useMemo } from 'react'
import {
  LayoutGrid,
  Table as TableIcon,
  SquarePen,
  Trash2,
  Calendar,
  Folder,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search as SearchIcon,
  X,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Download,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import TaskCard from './TaskCard'
import { exportTasksToCsv } from '@/utils/exportCsv'

type Task = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
  updatedAt: string
  dueDate: string
  category?: { id?: number; name?: string }
  failureReason?: string
  subtasks?: { id: number; completed: boolean }[]
  labels?: { label: { name: string; color: string } }[]
}

type Props = { tasks: Task[] }

const statusConfig = {
  PROCESS: {
    label: 'In Progress',
    icon: Clock,
    cls: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
  },
  SUCCESS: {
    label: 'Completed',
    icon: CheckCircle2,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    cls: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60',
  },
}

function isOverdue(dueDate: string, status: string) {
  return status === 'PROCESS' && dueDate ? new Date(dueDate) < new Date() : false
}

function getDateFilter(task: Task, filter: string) {
  if (!task.dueDate) return filter === 'ALL'
  const due = new Date(task.dueDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 86400000)
  const nextWeek = new Date(today.getTime() + 7 * 86400000)
  if (filter === 'today') return due >= today && due < tomorrow
  if (filter === 'week') return due >= today && due < nextWeek
  if (filter === 'overdue') return due < today && task.status === 'PROCESS'
  return true
}

export default function TaskTable({ tasks }: Props) {
  const [mode, setMode] = useState<'grid' | 'table'>('grid')
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Task>('dueDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterPriority, setFilterPriority] = useState<string>('ALL')
  const [filterDate, setFilterDate] = useState<string>('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return
    if (!confirm(`Delete ${selectedTasks.length} selected tasks?`)) return
    await Promise.all(
      selectedTasks.map((id) => fetch(`/api/tasks/${id}`, { method: 'DELETE' }))
    )
    setSelectedTasks([])
    router.refresh()
  }

  const toggleSelectAll = () => {
    setSelectedTasks(
      selectedTasks.length === filteredSorted.length ? [] : filteredSorted.map((t) => t.id)
    )
  }

  const toggleSelectTask = (id: number) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
    )
  }

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const activeFiltersCount = [
    filterPriority !== 'ALL',
    filterDate !== 'ALL',
    searchTerm !== '',
  ].filter(Boolean).length

  const filteredSorted = useMemo(() => {
    const result = tasks.filter((task) => {
      const matchSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchPriority =
        filterPriority === 'ALL' || task.priority === filterPriority
      const matchDate = filterDate === 'ALL' || getDateFilter(task, filterDate)
      return matchSearch && matchPriority && matchDate
    })

    return [...result].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      return 0
    })
  }, [tasks, searchTerm, filterPriority, filterDate, sortField, sortDirection])

  const clearFilters = () => {
    setFilterPriority('ALL')
    setFilterDate('ALL')
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      {/* Primary Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 max-w-md relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks by title, category, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-zinc-950/5 dark:focus:ring-zinc-100/10 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Bulk Selection Actions */}
          {selectedTasks.length > 0 && (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                {selectedTasks.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-300 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer select-none',
              showFilters || activeFiltersCount > 0
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
            <button
              onClick={() => setMode('grid')}
              title="Grid view"
              className={clsx(
                'p-1.5 rounded-md transition-all cursor-pointer',
                mode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('table')}
              title="Table view"
              className={clsx(
                'p-1.5 rounded-md transition-all cursor-pointer',
                mode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              )}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Export to CSV */}
          <button
            onClick={() => exportTasksToCsv(filteredSorted, 'nexttask-export.csv')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium transition cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Filter Drawer / Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3.5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Filter By
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-6">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Priority
              </label>
              <div className="flex items-center gap-1">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={clsx(
                      'px-2.5 py-1 text-xs font-medium rounded-md border transition cursor-pointer',
                      filterPriority === p
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Due Date
              </label>
              <div className="flex items-center gap-1">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'today', label: 'Due Today' },
                  { key: 'week', label: 'This Week' },
                  { key: 'overdue', label: 'Overdue' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setFilterDate(opt.key)}
                    className={clsx(
                      'px-2.5 py-1 text-xs font-medium rounded-md border transition cursor-pointer',
                      filterDate === opt.key
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-transparent shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count Line */}
      <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 px-1">
        <span>
          Showing{' '}
          <strong className="text-zinc-700 dark:text-zinc-300">
            {filteredSorted.length}
          </strong>{' '}
          of{' '}
          <strong className="text-zinc-700 dark:text-zinc-300">
            {tasks.length}
          </strong>{' '}
          tasks
        </span>
      </div>

      {/* Grid Mode */}
      {mode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredSorted.map((task) => (
            <TaskCard
              key={task.id}
              {...task}
              category={task.category ?? undefined}
              isSelected={selectedTasks.includes(task.id)}
              onToggleSelect={() => toggleSelectTask(task.id)}
            />
          ))}

          {filteredSorted.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-8">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Folder className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                No tasks found
              </h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Try clearing your search query or adjusting active filters.
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table Mode */}
      {mode === 'table' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedTasks.length === filteredSorted.length &&
                        filteredSorted.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  {[
                    { key: 'title', label: 'Title' },
                    { key: 'category', label: 'Category' },
                    { key: 'status', label: 'Status' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'dueDate', label: 'Due Date' },
                  ].map((col) => (
                    <th key={col.key} className="px-4 py-3">
                      <button
                        onClick={() => handleSort(col.key as keyof Task)}
                        className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                      >
                        <span>{col.label}</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {filteredSorted.map((task) => {
                  const s = statusConfig[task.status] || statusConfig.PROCESS
                  const StatusIcon = s.icon
                  const overdue = isOverdue(task.dueDate, task.status)
                  const completedSubs =
                    task.subtasks?.filter((sub) => sub.completed).length ?? 0
                  const totalSubs = task.subtasks?.length ?? 0

                  return (
                    <tr
                      key={task.id}
                      className={clsx(
                        'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group',
                        selectedTasks.includes(task.id) &&
                          'bg-blue-50/50 dark:bg-blue-950/20'
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => toggleSelectTask(task.id)}
                          className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3 max-w-xs sm:max-w-md">
                        <div
                          className="font-medium text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                          onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                        >
                          {task.title}
                        </div>
                        {totalSubs > 0 && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
                            <div className="h-1 w-14 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${(completedSubs / totalSubs) * 100}%`,
                                }}
                              />
                            </div>
                            <span>
                              {completedSubs}/{totalSubs}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {task.category ? (
                          <span className="inline-flex items-center gap-1">
                            <Folder className="w-3 h-3 text-zinc-400" />
                            <span>{task.category.name}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border',
                            s.cls
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{s.label}</span>
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border',
                            task.priority === 'HIGH' &&
                              'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60',
                            task.priority === 'MEDIUM' &&
                              'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
                            task.priority === 'LOW' &&
                              'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                          )}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3">
                        <div
                          className={clsx(
                            'inline-flex items-center gap-1 text-[11px]',
                            overdue
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : 'text-zinc-500 dark:text-zinc-400'
                          )}
                        >
                          {overdue && <AlertCircle className="w-3 h-3" />}
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              router.push(`/dashboard/tasks/${task.id}`)
                            }
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/dashboard/tasks/edit/${task.id}`)
                            }
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
                            title="Edit"
                          >
                            <SquarePen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredSorted.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                      No tasks found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
