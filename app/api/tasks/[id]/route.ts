import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Context = {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: Request, context: Context) {
  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
  }

  try {
    await prisma.task.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ message: 'Task deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}

export async function GET(req: Request, context: Context) {
  const { id } = await context.params
  const task = await prisma.task.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      subtasks: { orderBy: { createdAt: 'asc' } },
      labels: { include: { label: true } },
    },
  })

  if (!task) {
    return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 })
  }

  return new Response(JSON.stringify({ task }), { status: 200 })
}

export async function PATCH(req: Request, context: Context) {
  const { id } = await context.params
  const taskId = Number(id)
  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
  }

  try {
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

    return NextResponse.json({ task: updatedTask }, { status: 200 })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
