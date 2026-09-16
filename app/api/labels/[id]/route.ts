import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// PATCH /api/labels/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const labelId = Number(id)
  if (isNaN(labelId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const existing = await prisma.label.findUnique({
    where: { id: labelId },
  })

  if (!existing) return NextResponse.json({ error: 'Label not found' }, { status: 404 })
  if (existing.userId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, color } = await req.json()
  const label = await prisma.label.update({
    where: { id: labelId },
    data: { ...(name ? { name } : {}), ...(color ? { color } : {}) },
  })
  return NextResponse.json({ label })
}

// DELETE /api/labels/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const labelId = Number(id)
  if (isNaN(labelId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const existing = await prisma.label.findUnique({
    where: { id: labelId },
  })

  if (!existing) return NextResponse.json({ error: 'Label not found' }, { status: 404 })
  if (existing.userId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.label.delete({ where: { id: labelId } })
  return NextResponse.json({ message: 'Deleted' })
}
