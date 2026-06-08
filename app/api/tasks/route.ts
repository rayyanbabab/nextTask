import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {

  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('Received Body:', body)

    const { title, description, dueDate, categoryId, createdAt, recurrence, recurrenceEnd, reminder } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const parsedCreatedAt = createdAt
      ? new Date(createdAt)
      : new Date()

    if (isNaN(parsedCreatedAt.getTime())) {
      return NextResponse.json({ error: 'Invalid createdAt date format' }, { status: 400 })
    }

    const parsedDueDate = dueDate ? new Date(dueDate) : undefined
    if (!parsedDueDate || isNaN(parsedDueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid dueDate format' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: parsedDueDate,
        createdAt: parsedCreatedAt,
        status: 'PROCESS',
        priority: 'MEDIUM',
        userId: user.id,
        categoryId: categoryId ? Number(categoryId) : undefined,
        recurrence: recurrence || 'NONE',
        recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd) : undefined,
        reminder: reminder ? new Date(reminder) : undefined,
      },
    })

    return NextResponse.json({ message: 'Task created successfully', task }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/tasks error:', err?.message || err)
    return NextResponse.json({ error: 'Something went wrong on the server' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subtasks: { orderBy: { createdAt: 'asc' } },
        labels: { include: { label: true } },
      },
    })

    return NextResponse.json({ tasks })
  } catch (err: any) {
    console.error('POST /api/tasks error:', err?.message || err)

    return NextResponse.json({
      error: err?.message || 'Something went wrong on the server',
      stack: err?.stack,
    }, { status: 500 })
  }
}


