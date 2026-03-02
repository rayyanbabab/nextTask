'use client'

import { useState } from 'react'
import {
  LayoutGrid,
  Table as TableIcon,
  SquarePen,
  Trash2,
  MoreHorizontal,
  Calendar,
  Folder,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Filter,
  ArrowUpDown,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import TaskCard from './TaskCard'

type Task = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  createdAt: string
  updatedAt: string
  dueDate: string
  category?: {
    id: number
    name: string
  }
  failureReason?: string
}

type Props = {
  tasks: Task[]
}

const statusConfig = {
  PROCESS: {
    label: 'In Progress',
    icon: Clock,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700'
  },
  SUCCESS: {
    label: 'Completed',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700'
  },
}

export default function TaskTable({ tasks }: Props) {
  const [mode, setMode] = useState<'grid' | 'table'>('grid')
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Task>('dueDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const router = useRouter()

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return
    if (!confirm(`Delete ${selectedTasks.length} selected tasks?`)) return

    await Promise.all(selectedTasks.map(id =>
      fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    ))
    setSelectedTasks([])
    router.refresh()
  }

  const toggleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(tasks.map(t => t.id))
    }
  }

  const toggleSelectTask = (id: number) => {
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(taskId => taskId !== id) : [...prev, id]
    )
  }

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    return 0
  })

  return (
    <div className="space-y-6">
      {/* Header dengan Search dan Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {selectedTasks.length > 0 && (
            <>
              <span className="text-sm text-gray-600">
                {selectedTasks.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-200" />
            </>
          )}

          {/* Filter Button */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setMode('grid')}
              className={clsx(
                'p-2 rounded-md transition-all',
                mode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('table')}
              className={clsx(
                'p-2 rounded-md transition-all',
                mode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              )}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GRID MODE */}
      {mode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTasks.map(task => (
            <TaskCard
              key={task.id}
              {...task}
              category={task.category ?? undefined}
              isSelected={selectedTasks.includes(task.id)}
              onSelect={() => toggleSelectTask(task.id)}
            />
          ))}

          {sortedTasks.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          )}
        </div>
      )}

      {/* TABLE MODE */}
      {mode === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === tasks.length && tasks.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Title
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Category
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('dueDate')}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Due Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTasks.map(task => {
                  const status = statusConfig[task.status]
                  const StatusIcon = status.icon

                  return (
                    <tr
                      key={task.id}
                      className={clsx(
                        'hover:bg-gray-50 transition-colors group',
                        selectedTasks.includes(task.id) && 'bg-blue-50/50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => toggleSelectTask(task.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {task.category ? (
                          <div className="flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">{task.category.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={clsx('p-1 rounded-full', status.bg)}>
                            <StatusIcon className={clsx('w-3.5 h-3.5', status.text)} />
                          </div>
                          <span className={clsx('text-sm font-medium', status.text)}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/tasks/edit/${task.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <SquarePen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {sortedTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Folder className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-base font-medium text-gray-900 mb-1">No tasks found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{sortedTasks.length}</span> of{' '}
              <span className="font-medium">{tasks.length}</span> tasks
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 font-medium">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                2
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                3
              </button>
              <span className="text-sm text-gray-400">...</span>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                10
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
