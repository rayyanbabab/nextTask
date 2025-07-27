'use client'

import { Funnel } from 'lucide-react'
import React, { useEffect, useState, useMemo, useCallback } from 'react'

import { callCapitalize } from '@/function/callCapitalize'

import { FormCard } from '@/components/ui/FormCard'
import { Button } from '@/components/ui/Button'
import { Search } from '@/components/ui/Search'

import { MemoizedTaskCard } from '@/components/contents/MemoizedTaskCard'

type TaskStatus = 'PROCESS' | 'SUCCESS' | 'FAILED'
type FilterStatus = 'ALL' | 'SUCCESS' | 'FAILED'

type Task = {
  id: number
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  dueDate: string;
  failureReason: string
  category: { name: string };
}

export default function HistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [filter, setFilter] = useState<FilterStatus>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks')
        const data = await res.json()
        setTasks(data.tasks || [])
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    }

    fetchTasks()
  }, [])

  const historyTasks = useMemo(
    () => tasks.filter((task) => task.status === 'SUCCESS' || task.status === 'FAILED'),
    [tasks]
  )

  // const filteredTasks = useMemo(() => {
  //   return filter === 'ALL' ? historyTasks : historyTasks.filter((task) => task.status === filter)
  // }, [filter, historyTasks])

  const isSelected = useCallback((id: number) => selectedIds.includes(id), [selectedIds])

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }, [])

  const filteredByStatus = useMemo(() => {
    return filter === 'ALL' ? historyTasks : historyTasks.filter(task => task.status === filter)
  }, [filter, historyTasks])

  const filteredTasks = useMemo(() => {
    return filteredByStatus.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, filteredByStatus])

  const selectAll = useCallback(() => {
    setSelectedIds(filteredTasks.map((task) => task.id))
  }, [filteredTasks])

  const deselectAll = useCallback(() => {
    setSelectedIds([])
  }, [])

  const deleteSelected = useCallback(async () => {
    if (!confirm('Delete selected tasks?')) return

    await Promise.all(
      selectedIds.map((id) => fetch(`/api/tasks/${id}`, { method: 'DELETE' }))
    )

    setTasks((prev) => prev.filter((task) => !selectedIds.includes(task.id)))
    setSelectedIds([])
  }, [selectedIds])

  const handleDeleteOne = useCallback(async (id: number) => {
    if (!confirm('Delete this task?')) return

    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  return (
    <FormCard title="Task History" subtitle="View completed and failed tasks">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">

        {/* KIRI: Filter + Search */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          <div className="flex items-center space-x-2">
            {(['ALL', 'SUCCESS', 'FAILED'] as FilterStatus[]).map((type) => (
              <Button key={type} variant={filter === type ? 'default' : 'outline'} onClick={() => setFilter(type)} size="sm" className="flex items-center gap-1">
                {type === 'ALL' && <Funnel strokeWidth={1.5} className="w-4 h-4" />}
                {callCapitalize(type)}
              </Button>
            ))}
          <Search onSearch={setSearchTerm} placeholder="Search..." />
          </div>

        </div>

        {/* KANAN: Select/Deselect/Delete */}
        {filteredTasks.length > 0 && (
          <div className="flex items-center space-x-2">
            {selectedIds.length === 0 ? (
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select All
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={deselectAll}>
                  Deselect All
                </Button>
                <Button size="sm" variant="destructive" onClick={deleteSelected}>
                  Delete Selected ({selectedIds.length})
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Task List */}
      <div>
      {filteredTasks.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center w-full py-10">
          No tasks found for this filter.
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
    </FormCard>

  )
}
