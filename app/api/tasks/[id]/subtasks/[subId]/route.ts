import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/tasks/[id]/subtasks/[subId] — toggle completed
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; subId: string }> }) {
  try {
    const { subId } = await params
    const { completed, title } = await req.json()
    const subtask = await prisma.subtask.update({
      where: { id: Number(subId) },
      data: {
        ...(typeof completed === 'boolean' ? { completed } : {}),
        ...(title ? { title } : {}),
      },
    })
    return NextResponse.json({ subtask })
  } catch {
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id]/subtasks/[subId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; subId: string }> }) {
  try {
    const { subId } = await params
    await prisma.subtask.delete({ where: { id: Number(subId) } })
    return NextResponse.json({ message: 'Deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 })
  }
}
