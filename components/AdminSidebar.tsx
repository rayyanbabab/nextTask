'use client'

import { Home, Users, LogOut } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import { Button } from './ui/Button'

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  
  const { logout } = useUser()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 fixed top-0 left-0 z-10 flex flex-col">
      <div className="p-[17.5px] border-b border-gray-200">
        <h2 className="text-lg font-bold text-indigo-600">Admin Panel</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <SidebarLink href="/admin/dashboard" icon={Home} label="Dashboard"
          active={pathname === '/admin/dashboard'}
        />

        <SidebarLink href="/admin/users" icon={Users} label="Users"
          active={pathname === '/admin/users'}
        />
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start flex items-center gap-2 text-gray-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-5 w-5 text-red-500" />
          Logout
        </Button>
      </div>
    </aside>
  )
}

type LinkProps = {
  href: string,
  icon: React.ElementType,
  label: string,
  active: boolean 
}

function SidebarLink({ href, icon: Icon, label, active }: LinkProps) {
  return (
    <Link href={href}>
      <div
        className={clsx(
          'flex items-center my-2 gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all',
          active
            ? 'bg-indigo-100 text-indigo-600 font-semibold'
            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
        )}
      >
        <Icon size={18} />
        {label}
      </div>
    </Link>
  )
}
