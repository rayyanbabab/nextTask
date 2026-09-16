import { NextRequest, NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, currentPassword, newPassword } = body

    // Handle password change
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Password saat ini dan password baru harus diisi' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password baru minimal 6 karakter' },
          { status: 400 }
        )
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Password saat ini salah' },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'User changed password',
        },
      }).catch(err => console.error('Failed to log activity:', err))
    }

    // Handle name update
    let updatedUser = user
    if (name && name.trim() !== '' && name !== user.name) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      })

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: `User updated name to "${name.trim()}"`,
        },
      }).catch(err => console.error('Failed to log activity:', err))
    }

    // Re-sign JWT token with updated info
    const token = jwt.sign(
      { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal memperbarui profil' },
      { status: 500 }
    )
  }
}
