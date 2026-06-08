import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// POST /api/tasks/[id]/labels — attach label; POST with same labelId to detach (toggle)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { labelId } = await req.json()
  const taskId = Number(id)

  // Toggle: if exists, remove; if not, add
  const existing = await prisma.taskLabel.findUnique({
    where: { taskId_labelId: { taskId, labelId: Number(labelId) } },
  })

  if (existing) {
    await prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId: Number(labelId) } },
    })
    return NextResponse.json({ message: 'Label removed' })
  } else {
    await prisma.taskLabel.create({ data: { taskId, labelId: Number(labelId) } })
    return NextResponse.json({ message: 'Label added' }, { status: 201 })
  }
}
