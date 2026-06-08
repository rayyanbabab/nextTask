// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

async function getAdminFromToken(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'ADMIN') return null
    return payload
  } catch {
    return null
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = parseInt(id)
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const body = await req.json()
  const { role } = body

  if (!['USER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 })
  }

  // Prevent admin from demoting themselves
  if (typeof admin.id === 'number' && admin.id === userId) {
    return NextResponse.json({ error: 'Tidak bisa mengubah role diri sendiri' }, { status: 400 })
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = parseInt(id)
  if (isNaN(userId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  // Prevent admin from deleting themselves
  if (typeof admin.id === 'number' && admin.id === userId) {
    return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 })
  }

  try {
    // Cascade manual untuk SQLite (Prisma tidak mendukung onDelete: Cascade di semua relasi)
    await prisma.$transaction(async (tx) => {
      // Hapus TaskLabel milik task user
      const userTasks = await tx.task.findMany({ where: { userId }, select: { id: true } })
      const taskIds = userTasks.map(t => t.id)

      if (taskIds.length > 0) {
        await tx.taskLabel.deleteMany({ where: { taskId: { in: taskIds } } })
        await tx.subtask.deleteMany({ where: { taskId: { in: taskIds } } })
        await tx.comment.deleteMany({ where: { taskId: { in: taskIds } } })
        await tx.task.deleteMany({ where: { userId } })
      }

      await tx.comment.deleteMany({ where: { userId } })
      await tx.activityLog.deleteMany({ where: { userId } })
      await tx.label.deleteMany({ where: { userId } })
      await tx.taskCategory.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 })
  }
}
