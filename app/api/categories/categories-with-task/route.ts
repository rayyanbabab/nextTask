import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const categories = await prisma.taskCategory.findMany({
    include: {
      tasks: true,
    },
  })

  return NextResponse.json(categories)
}
