import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Context = {
  params: Promise<{ id: string }>
}

// Helper: calculate the next due date based on recurrence pattern
function getNextDueDate(currentDueDate: Date, recurrence: string): Date {
  const next = new Date(currentDueDate)
  switch (recurrence) {
    case 'DAILY':
      next.setDate(next.getDate() + 1)
      break
    case 'WEEKLY':
      next.setDate(next.getDate() + 7)
      break
    case 'BIWEEKLY':
      next.setDate(next.getDate() + 14)
      break
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1)
      break
    case 'WEEKDAYS': {
      // skip to the next weekday (Mon-Fri)
      next.setDate(next.getDate() + 1)
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1)
      }
      break
    }
    default:
      break
  }
  return next
}

export async function PUT(req: Request, context: Context) {
  const { id } = await context.params
  const { status, failureReason } = await req.json()

  if (!['PROCESS', 'SUCCESS', 'FAILED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Fetch current task to check recurrence
  const currentTask = await prisma.task.findUnique({
    where: { id: Number(id) },
  })
  if (!currentTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Update current task status
  const task = await prisma.task.update({
    where: { id: Number(id) },
    data: {
      status,
      failureReason: status === 'FAILED' ? failureReason : null,
      completedAt: status === 'SUCCESS' ? new Date() : null,
    },
  })

  // If task is completed and has an active recurrence pattern, create next task
  let nextTask = null
  if (
    status === 'SUCCESS' &&
    currentTask.recurrence !== 'NONE' &&
    currentTask.dueDate
  ) {
    const nextDueDate = getNextDueDate(currentTask.dueDate, currentTask.recurrence)

    // Check if recurrenceEnd has passed
    const isExpired =
      currentTask.recurrenceEnd && nextDueDate > currentTask.recurrenceEnd

    if (!isExpired) {
      nextTask = await prisma.task.create({
        data: {
          title: currentTask.title,
          description: currentTask.description,
          priority: currentTask.priority,
          dueDate: nextDueDate,
          categoryId: currentTask.categoryId,
          userId: currentTask.userId,
          recurrence: currentTask.recurrence,
          recurrenceEnd: currentTask.recurrenceEnd,
          parentTaskId: currentTask.id,
          status: 'PROCESS',
        },
      })
    }
  }

  return NextResponse.json({ task, nextTask })
}
