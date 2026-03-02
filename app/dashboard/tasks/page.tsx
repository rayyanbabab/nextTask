'use client'

import React, { useEffect, useState } from 'react'
import TaskCard from '@/components/contents/TaskCard'
import { FormCard } from '@/components/ui/FormCard'
import TaskTable from '@/components/contents/TaskTable'

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

  return (
    <FormCard title='Tasks' subtitle='Manage your Tasks here' actionHref="/dashboard/tasks/create" actionLabel="Create Task">
      {tasks
        .filter((task) => task.status == 'PROCESS')
        .map((task) => (
          <>
            <TaskTable tasks={tasks} />
          </>
        ))}
    </FormCard>
  )
}
