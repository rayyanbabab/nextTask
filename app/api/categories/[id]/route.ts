import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params
  const categoryId = parseInt(id)

  try {
    const category = await prisma.taskCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params
  const categoryId = parseInt(id)
  const { name } = await req.json()

  if (!name) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
  }

  try {
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

export async function DELETE(_req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params
  const categoryId = parseInt(id)

  try {
    await prisma.taskCategory.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ message: 'Category deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
