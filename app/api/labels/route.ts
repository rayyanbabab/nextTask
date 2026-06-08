import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

// GET /api/labels
export async function GET() {
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const labels = await prisma.label.findMany({
    where: { userId: user.id },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ labels })
}

// POST /api/labels
export async function POST(req: Request) {
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, color } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const label = await prisma.label.create({
    data: { name, color: color || '#6366f1', userId: user.id },
  })
  return NextResponse.json({ label }, { status: 201 })
}
