'use client'

import { Download, CheckCircle2, XCircle, Layers, Trash2 } from 'lucide-react'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { exportTasksToCsv } from '@/utils/exportCsv'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'
import { MemoizedTaskCard } from '@/components/contents/MemoizedTaskCard'
import clsx from 'clsx'

type TaskStatus = 'PROCESS' | 'SUCCESS' | 'FAILED'
type FilterStatus = 'ALL' | 'SUCCESS' | 'FAILED'

type Task = {
  id: number
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  dueDate: string
  failureReason: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  category: { name: string }
}

export default function HistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks')
        const data = await res.json()
        setTasks(data.tasks || [])
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const historyTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === 'SUCCESS' || task.status === 'FAILED'
      ),
    [tasks]
  )

  const isSelected = useCallback(
    (id: number) => selectedIds.includes(id),
    [selectedIds]
  )

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }, [])

  const filteredByStatus = useMemo(() => {
    return filter === 'ALL'
      ? historyTasks
      : historyTasks.filter((task) => task.status === filter)
  }, [filter, historyTasks])

  const filteredTasks = useMemo(() => {
    return filteredByStatus.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, filteredByStatus])

  const selectAll = useCallback(() => {
    setSelectedIds(filteredTasks.map((task) => task.id))
  }, [filteredTasks])

  const deselectAll = useCallback(() => {
    setSelectedIds([])
  }, [])

  const deleteSelected = useCallback(async () => {
    if (!confirm(`Delete ${selectedIds.length} historical tasks?`)) return

    await Promise.all(
      selectedIds.map((id) => fetch(`/api/tasks/${id}`, { method: 'DELETE' }))
    )

    setTasks((prev) => prev.filter((task) => !selectedIds.includes(task.id)))
    setSelectedIds([])
  }, [selectedIds])

  const handleDeleteOne = useCallback(async (id: number) => {
    if (!confirm('Delete this task record?')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Task Archive & History
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Historical record of completed deliverables and failed iterations.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          {[
            { key: 'ALL' as const, label: 'All Archived', icon: Layers },
            { key: 'SUCCESS' as const, label: 'Completed', icon: CheckCircle2 },
            { key: 'FAILED' as const, label: 'Failed', icon: XCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer select-none',
                filter === key
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <div className="w-full sm:w-64">
            <Search
              onSearch={setSearchTerm}
              placeholder="Filter archives..."
            />
          </div>

          {filteredTasks.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  exportTasksToCsv(filteredTasks, 'task-history-export.csv')
                }
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>

              {selectedIds.length === 0 ? (
                <Button size="sm" variant="outline" onClick={selectAll}>
                  Select All
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={deselectAll}>
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={deleteSelected}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Delete ({selectedIds.length})</span>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-36 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-8">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No archived tasks found
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Tasks moved to 'Completed' or 'Failed' will appear here for audit history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <MemoizedTaskCard
              key={task.id}
              task={task}
              isSelected={isSelected(task.id)}
              onToggleSelect={() => toggleSelect(task.id)}
              onDelete={() => handleDeleteOne(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
