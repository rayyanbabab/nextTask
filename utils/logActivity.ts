import { prisma } from '@/lib/prisma'

export async function logActivity(userId: number, action: string) {
  await prisma.activityLog.create({
    data: { userId, action },
  })
}
