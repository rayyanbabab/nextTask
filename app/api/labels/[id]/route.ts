import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// PATCH /api/labels/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { name, color } = await req.json()
  const label = await prisma.label.update({
    where: { id: Number(id) },
    data: { ...(name ? { name } : {}), ...(color ? { color } : {}) },
  })
  return NextResponse.json({ label })
}

// DELETE /api/labels/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.label.delete({ where: { id: Number(id) } })
  return NextResponse.json({ message: 'Deleted' })
}
