'use client'

import React, { useEffect, useState } from 'react'
import TaskTable from '@/components/contents/TaskTable'
import { FormCard } from '@/components/ui/FormCard'

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
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data.tasks || [])
    }

    fetchTasks()
  }, [])

  // Jika ingin filter hanya PROCESS, bisa di sini:
  const processTasks = tasks.filter(task => task.status === 'PROCESS')

  return (
    <FormCard title='Tasks' subtitle='Manage your Tasks here' actionHref="/dashboard/tasks/create" actionLabel="Create Task">
      <TaskTable tasks={processTasks} />
    </FormCard>
  )
}
