import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Gunakan struktur default handler sesuai Next.js
// @ts-ignore
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const categoryId = parseInt(params.id)

  try {
    const category = await prisma.taskCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const categoryId = parseInt(params.id)
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const categoryId = parseInt(params.id)

  try {
    await prisma.taskCategory.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
