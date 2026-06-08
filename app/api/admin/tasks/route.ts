// app/api/admin/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return false
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return payload.role === 'ADMIN'
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdmin(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  // Build filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (userId) where.userId = parseInt(userId)
  if (status) where.status = status
  if (priority) where.priority = priority

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ])

  return NextResponse.json({ tasks, total, page, limit })
}
