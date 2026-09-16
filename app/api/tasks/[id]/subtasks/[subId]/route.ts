import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// PATCH /api/tasks/[id]/subtasks/[subId] — toggle completed
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; subId: string }> }) {
  try {
    const user = await getUserFromToken()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, subId } = await params
    const taskId = Number(id)
    const subtaskId = Number(subId)

    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true },
    })

    if (!subtask || subtask.taskId !== taskId) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }

    if (subtask.task.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { completed, title } = await req.json()
    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        ...(typeof completed === 'boolean' ? { completed } : {}),
        ...(title ? { title } : {}),
      },
    })
    return NextResponse.json({ subtask: updated })
  } catch (err: any) {
    console.error('PATCH subtask error:', err?.message || err)
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id]/subtasks/[subId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; subId: string }> }) {
  try {
    const user = await getUserFromToken()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, subId } = await params
    const taskId = Number(id)
    const subtaskId = Number(subId)

    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true },
    })

    if (!subtask || subtask.taskId !== taskId) {
      return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
    }

    if (subtask.task.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.subtask.delete({ where: { id: subtaskId } })
    return NextResponse.json({ message: 'Deleted' })
  } catch (err: any) {
    console.error('DELETE subtask error:', err?.message || err)
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 })
  }
}

