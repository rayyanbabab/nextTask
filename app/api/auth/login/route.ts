import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })

    // Check user & password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    await prisma.activityLog.create({
      data: {
        action: 'User logged in',
        userId: user.id,
      },
    })

    // Buat token dari data user
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Simpan token ke cookie
    const response = NextResponse.json({ message: 'Login berhasil', user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 200 })
    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

