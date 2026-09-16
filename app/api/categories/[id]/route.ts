import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, context: Context) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const categoryId = parseInt(id)
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const category = await prisma.taskCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    if (category.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: Context) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const categoryId = parseInt(id)
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const { name } = await req.json()
  if (!name) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
  }

  try {
    const existing = await prisma.taskCategory.findUnique({
      where: { id: categoryId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedCategory = await prisma.taskCategory.update({
      where: { id: categoryId },
      data: { name },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, context: Context) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const categoryId = parseInt(id)
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const existing = await prisma.taskCategory.findUnique({
      where: { id: categoryId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.taskCategory.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
