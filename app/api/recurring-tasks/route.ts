import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
        recurrence: { not: 'NONE' },
        status: 'PROCESS',
      },
      orderBy: { dueDate: 'asc' },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ tasks })
  } catch (err: any) {
    console.error('GET /api/recurring-tasks error:', err?.message || err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
