import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

async function main() {
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: await hash('admin123', 10),
      role: 'ADMIN',
    },
  })
}

main()
