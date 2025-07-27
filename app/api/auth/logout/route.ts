import { getUserFromToken } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })

  const user = await getUserFromToken()

  if (user) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'Logout',
      },
    })
  }

  response.cookies.set('token', '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  })
  return response
}


