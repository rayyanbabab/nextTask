import { cookies as getCookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function getUserFromToken() {
  const cookieStore = await getCookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    return user
  } catch (err) {
    return null
  }
}
