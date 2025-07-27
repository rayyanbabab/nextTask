import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()
  if (!email || !password || !name) 
    return NextResponse.json({ error: 'Lengkapi semua field' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) 
    return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}
