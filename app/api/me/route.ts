import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
}
