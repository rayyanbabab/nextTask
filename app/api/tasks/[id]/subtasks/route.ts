import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET /api/tasks/[id]/subtasks
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const taskId = Number(id)

    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { userId: true } })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (task.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ subtasks })
  } catch (err: any) {
    console.error('GET subtasks error:', err?.message || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/tasks/[id]/subtasks
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const taskId = Number(id)

    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { userId: true } })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (task.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title } = await req.json()
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const subtask = await prisma.subtask.create({
      data: { title: title.trim(), taskId },
    })
    return NextResponse.json({ subtask }, { status: 201 })
  } catch (err: any) {
    console.error('POST subtasks error:', err?.message || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

