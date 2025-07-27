'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

import { useUser } from '@/context/UserContext'
import { navItems } from '@/constants/navItems'
import { Button } from './ui/Button'

export default function Sidebar() {
  const { logout } = useUser()

  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col justify-between">

      <div>
        <div className="px-6 py-5 text-xl font-bold text-gray-900 tracking-tight border-b border-gray-200">
          Nexttask
        </div>

        <nav className="flex flex-col gap-y-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-sky-100 text-sky-800 font-semibold'
                    : 'text-gray-700 hover:bg-sky-50 hover:text-sky-900'}
                  `}>
                <span className="text-sky-600">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <Button onClick={handleLogout} variant="ghost" size="sm" className="group w-full justify-start text-gray-600 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4 text-red-600" />
          <span className='group-hover:text-red-800'>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
