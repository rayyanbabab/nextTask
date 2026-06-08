import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

type Context = { params: Promise<{ id: string; commentId: string }> }

export async function DELETE(_req: Request, context: Context) {
  const { commentId } = await context.params
  const user = await getUserFromToken()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const comment = await prisma.comment.findUnique({ where: { id: Number(commentId) } })
  if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  if (comment.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.comment.delete({ where: { id: Number(commentId) } })
  return NextResponse.json({ message: 'Comment deleted' })
}
