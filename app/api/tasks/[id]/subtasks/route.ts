import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET /api/tasks/[id]/subtasks
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const subtasks = await prisma.subtask.findMany({
    where: { taskId: Number(id) },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ subtasks })
}

// POST /api/tasks/[id]/subtasks
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { title } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const subtask = await prisma.subtask.create({
      data: { title, taskId: Number(id) },
    })
    return NextResponse.json({ subtask }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
