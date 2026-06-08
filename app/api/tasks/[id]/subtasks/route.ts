import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET /api/tasks/[id]/subtasks
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const subtasks = await prisma.subtask.findMany({
    where: { taskId: Number(params.id) },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ subtasks })
}

// POST /api/tasks/[id]/subtasks
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title } = await req.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const subtask = await prisma.subtask.create({
      data: { title, taskId: Number(params.id) },
    })
    return NextResponse.json({ subtask }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
