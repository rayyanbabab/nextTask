'use client'

import React, { useEffect, useState } from 'react'
import TaskCard from '@/components/contents/TaskCard'
import { FormCard } from '@/components/ui/FormCard'

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
    <FormCard title='Tasks' subtitle='Manage your Tasks here'>
      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks
          .filter((task) => task.status == 'PROCESS')
          .map((task) => (
            <TaskCard
              id={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
              createdAt={task.createdAt}
              updatedAt={task.updatedAt}
              dueDate={task.dueDate}
              failureReason={task.failureReason}
              category={task.category ?? undefined}
            />
          ))}
      </main>
    </FormCard>
  )
}
