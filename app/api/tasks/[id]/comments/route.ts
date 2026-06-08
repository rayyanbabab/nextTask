import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

type Context = { params: Promise<{ id: string }> }

export async function GET(_req: Request, context: Context) {
  const { id } = await context.params
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const comments = await prisma.comment.findMany({
    where: { taskId: Number(id) },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ comments })
}

export async function POST(req: Request, context: Context) {
  const { id } = await context.params
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { content: content.trim(), taskId: Number(id), userId: user.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json({ comment }, { status: 201 })
}
