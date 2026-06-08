'use client'

import { useState, useMemo } from 'react'
import {
  LayoutGrid, Table as TableIcon, SquarePen, Trash2, MoreHorizontal,
  Calendar, Folder, Clock, CheckCircle2, XCircle, Eye, Search,
  ChevronDown, X, Filter, ArrowUpDown, AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import TaskCard from './TaskCard'

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
  PROCESS: { label: 'In Progress', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  SUCCESS: { label: 'Completed', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  FAILED: { label: 'Failed', icon: XCircle, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' },
}

function isOverdue(dueDate: string, status: string) {
  return status === 'PROCESS' && new Date(dueDate) < new Date()
}

function getDateFilter(task: Task, filter: string) {
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
    await Promise.all(selectedTasks.map(id => fetch(`/api/tasks/${id}`, { method: 'DELETE' })))
    setSelectedTasks([])
    router.refresh()
  }

  const toggleSelectAll = () => {
    setSelectedTasks(selectedTasks.length === tasks.length ? [] : tasks.map(t => t.id))
  }

  const toggleSelectTask = (id: number) => {
    setSelectedTasks(prev => prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id])
  }

  const handleSort = (field: keyof Task) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDirection('asc') }
  }

  const activeFiltersCount = [
    filterPriority !== 'ALL',
    filterDate !== 'ALL',
    searchTerm !== '',
  ].filter(Boolean).length

  const filteredSorted = useMemo(() => {
    let result = tasks.filter(task => {
      const matchSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchPriority = filterPriority === 'ALL' || task.priority === filterPriority
      const matchDate = filterDate === 'ALL' || getDateFilter(task, filterDate)
      return matchSearch && matchPriority && matchDate
    })
    return [...result].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      return 0
    })
  }, [tasks, searchTerm, filterPriority, filterDate, sortField, sortDirection])

  const clearFilters = () => { setFilterPriority('ALL'); setFilterDate('ALL'); setSearchTerm('') }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedTasks.length > 0 && (
            <>
              <span className="text-sm text-gray-500">{selectedTasks.length} selected</span>
              <button onClick={handleBulkDelete} className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <div className="w-px h-5 bg-gray-200" />
            </>
          )}

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors',
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setMode('grid')}
              className={clsx('p-1.5 rounded-lg transition-all', mode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('table')}
              className={clsx('p-1.5 rounded-lg transition-all', mode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Filters</span>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {/* Priority filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Priority</label>
              <div className="flex gap-1.5">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={clsx(
                      'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors',
                      filterPriority === p
                        ? p === 'HIGH' ? 'bg-rose-500 text-white border-rose-500'
                          : p === 'MEDIUM' ? 'bg-amber-500 text-white border-amber-500'
                          : p === 'LOW' ? 'bg-green-500 text-white border-green-500'
                          : 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Due Date</label>
              <div className="flex gap-1.5">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'This Week' },
                  { key: 'overdue', label: '⚠ Overdue' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setFilterDate(opt.key)}
                    className={clsx(
                      'px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors',
                      filterDate === opt.key
                        ? opt.key === 'overdue' ? 'bg-rose-500 text-white border-rose-500' : 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
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

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filterPriority !== 'ALL' && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Priority: {filterPriority}
              <button onClick={() => setFilterPriority('ALL')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filterDate !== 'ALL' && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Due: {filterDate}
              <button onClick={() => setFilterDate('ALL')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {searchTerm && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Showing <span className="font-semibold text-gray-700">{filteredSorted.length}</span> of <span className="font-semibold text-gray-700">{tasks.length}</span> tasks</span>
      </div>

      {/* GRID MODE */}
      {mode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSorted.map(task => (
            <TaskCard
              key={task.id}
              {...task}
              category={task.category ?? undefined}
              isSelected={selectedTasks.includes(task.id)}
              onToggleSelect={() => toggleSelectTask(task.id)}
            />
          ))}
          {filteredSorted.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No tasks found</h3>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TABLE MODE */}
      {mode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedTasks.length === tasks.length && tasks.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 text-blue-600" />
                  </th>
                  {[
                    { key: 'title', label: 'Title' },
                    { key: 'category', label: 'Category' },
                    { key: 'status', label: 'Status' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'dueDate', label: 'Due Date' },
                  ].map(col => (
                    <th key={col.key} className="px-4 py-3 text-left">
                      <button onClick={() => handleSort(col.key as keyof Task)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700">
                        {col.label} <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSorted.map(task => {
                  const status = statusConfig[task.status]
                  const StatusIcon = status.icon
                  const overdue = isOverdue(task.dueDate, task.status)
                  const completedSubs = task.subtasks?.filter(s => s.completed).length ?? 0
                  const totalSubs = task.subtasks?.length ?? 0
                  return (
                    <tr key={task.id} className={clsx('hover:bg-gray-50 transition-colors group', selectedTasks.includes(task.id) && 'bg-blue-50/40')}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedTasks.includes(task.id)} onChange={() => toggleSelectTask(task.id)} className="rounded border-gray-300 text-blue-600" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{task.title}</div>
                        {totalSubs > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(completedSubs / totalSubs) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-400">{completedSubs}/{totalSubs}</span>
                          </div>
                        )}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {task.labels.slice(0, 2).map(({ label }) => (
                              <span key={label.name} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: label.color + '22', color: label.color }}>
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {task.category ? (
                          <div className="flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-gray-400" />
                            <span>{task.category.name}</span>
                          </div>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', status.badge)}>
                          <StatusIcon className="w-3 h-3" /> {status.label}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          task.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                          task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        )}>{task.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={clsx('flex items-center gap-1.5 text-xs', overdue ? 'text-rose-600 font-medium' : 'text-gray-500')}>
                          {overdue && <AlertTriangle className="w-3 h-3" />}
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => router.push(`/dashboard/tasks/${task.id}`)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => router.push(`/dashboard/tasks/edit/${task.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><SquarePen className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(task.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredSorted.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Folder className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">No tasks found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
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
