import React from 'react'
import TaskCard from './TaskCard'

type Props = {
  task: {
    id: number
    title: string
    description?: string
    status: 'PROCESS' | 'SUCCESS' | 'FAILED'
    createdAt?: string
    updatedAt?: string
    dueDate?: string
    failureReason?: string
    category?: {
      name: string
    }
  }
  isSelected: boolean

  onToggleSelect: () => void
  onDelete: () => void
}


function TaskCardWithSelect({ task, isSelected, onToggleSelect }: Props) {
  return (
    <div className="relative">
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
        showCheckbox={true}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        hideEdit={true}
      />
    </div>
  )
}


export const MemoizedTaskCard = React.memo(TaskCardWithSelect)
