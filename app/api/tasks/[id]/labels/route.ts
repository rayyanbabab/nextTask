import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// POST /api/tasks/[id]/labels — attach label; POST with same labelId to detach (toggle)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { labelId } = await req.json()
    const taskId = Number(id)
    const lId = Number(labelId)

    const [task, label] = await Promise.all([
      prisma.task.findUnique({ where: { id: taskId }, select: { userId: true } }),
      prisma.label.findUnique({ where: { id: lId }, select: { userId: true } }),
    ])

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (!label) return NextResponse.json({ error: 'Label not found' }, { status: 404 })

    if (task.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (label.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Toggle: if exists, remove; if not, add
    const existing = await prisma.taskLabel.findUnique({
      where: { taskId_labelId: { taskId, labelId: lId } },
    })

    if (existing) {
      await prisma.taskLabel.delete({
        where: { taskId_labelId: { taskId, labelId: lId } },
      })
      return NextResponse.json({ message: 'Label removed' })
    } else {
      await prisma.taskLabel.create({ data: { taskId, labelId: lId } })
      return NextResponse.json({ message: 'Label added' }, { status: 201 })
    }
  } catch (err: any) {
    console.error('POST task label error:', err?.message || err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

