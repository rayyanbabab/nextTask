import { PrismaClient } from '@prisma/client'
import path from 'path'

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (url && url.startsWith('file:')) {
    const dbPath = url.replace('file:', '')
    if (!path.isAbsolute(dbPath)) {
      // Remove leading './' if present
      let cleanPath = dbPath.startsWith('./') ? dbPath.substring(2) : dbPath
      // If path doesn't target prisma/ folder, prefix it with prisma/
      if (!cleanPath.startsWith('prisma/')) {
        cleanPath = path.join('prisma', cleanPath)
      }
      return `file:${path.resolve(process.cwd(), cleanPath)}`
    }
  }
  return url
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl = getDatabaseUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

