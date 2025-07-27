import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint Delete
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!params?.id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
  }

  try {
    await prisma.task.delete({
      where: { id: Number(params.id) },
    })

    return NextResponse.json({ message: 'Task deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({
    where: { id: Number(params.id) },
  })

  if (!task) {
    return new Response(JSON.stringify({ error: 'Task not found' }), { status: 404 })
  }

  return new Response(JSON.stringify({ task }), { status: 200 })
}

// Endpoint Edit
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const taskId = Number(params.id)
  if (isNaN(taskId)) {
    return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { title, description, dueDate, categoryId } = body

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        categoryId: categoryId || null,
      },
    })

    return NextResponse.json({ task: updatedTask }, { status: 200 })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}


