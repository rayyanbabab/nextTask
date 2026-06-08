'use client'

import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import clsx from 'clsx'

import { useUser } from '@/context/UserContext'
import { navItems } from '@/constants/navItems'
import { Button } from './ui/Button'

export default function Sidebar() {
  const { user, logout } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Group nav items by section
  const sections = navItems.reduce((acc, item) => {
    const section = item.section || 'Other'
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {} as Record<string, typeof navItems>)

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xs">NT</span>
          </div>
          <div>
            <div className="text-base font-bold text-gray-900 tracking-tight">Nexttask</div>
            <div className="text-[10px] text-gray-400">Task Manager</div>
          </div>
        </div>
      </div>

      {/* Nav Items grouped by section */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {section}
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    pathname.startsWith(item.href + '/') &&
                    !navItems.some(
                      (other) =>
                        other.href !== item.href &&
                        other.href.startsWith(item.href) &&
                        pathname.startsWith(other.href)
                    ))

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <span className={clsx('flex-shrink-0', isActive ? 'text-white' : 'text-gray-400')}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase() ?? 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{user.name}</div>
              <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors group"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
