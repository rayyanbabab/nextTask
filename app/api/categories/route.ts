import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, userId } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    if (!userId || typeof userId !== 'number') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const category = await prisma.taskCategory.create({
      data: {
        name,
        userId,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('CATEGORY POST ERROR:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const categories = await prisma.taskCategory.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ categories })
}

