import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

async function main() {
  // Delete existing users
  await prisma.user.deleteMany()

  // Create admin account
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: await hash('admin123', 10),
      role: 'ADMIN',
    },
  })

  // Create regular user accounts
  await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: await hash('user123', 10),
      role: 'USER',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await hash('user123', 10),
      role: 'USER',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Admin Manager',
      email: 'manager@example.com',
      password: await hash('admin123', 10),
      role: 'ADMIN',
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log('\nAvailable accounts:')
  console.log('-------------------')
  console.log('ADMIN #1: admin@example.com / admin123')
  console.log('ADMIN #2: manager@example.com / admin123')
  console.log('USER #1:  john@example.com / user123')
  console.log('USER #2:  jane@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
