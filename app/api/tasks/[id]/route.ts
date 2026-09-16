import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

type Context = {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: Request, context: Context) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const taskId = Number(id)
  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this task' }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: `Deleted task "${task.title}"`,
      },
    }).catch(err => console.error('Failed to log activity:', err))

    return NextResponse.json({ message: 'Task deleted' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}

export async function GET(_req: Request, context: Context) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const taskId = Number(id)
  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      category: true,
      subtasks: { orderBy: { createdAt: 'asc' } },
      labels: { include: { label: true } },
    },
  })

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  if (task.userId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: You do not own this task' }, { status: 403 })
  }

  return NextResponse.json({ task }, { status: 200 })
}

export async function PATCH(req: Request, context: Context) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const taskId = Number(id)
  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (existingTask.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this task' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, priority, dueDate, categoryId, recurrence, recurrenceEnd } = body

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        categoryId: categoryId || null,
        recurrence: recurrence !== undefined ? recurrence : undefined,
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : recurrenceEnd === null ? null : undefined,
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: `Updated task "${updatedTask.title}"`,
      },
    }).catch(err => console.error('Failed to log activity:', err))

    return NextResponse.json({ task: updatedTask }, { status: 200 })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
