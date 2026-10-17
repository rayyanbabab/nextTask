'use client'

import { LayoutDashboard, Users, ClipboardList, Menu, X, ArrowLeft, Shield, LogOut } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import { useState, useEffect } from 'react'

const adminLinks = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'User Directory' },
  { href: '/admin/tasks', icon: ClipboardList, label: 'All Workspace Tasks' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useUser()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 transition-colors select-none">
      {/* Brand */}
      <div className="h-16 px-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
            <Shield size={16} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <span>Admin Center</span>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
              System Console
            </div>
          </div>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="px-2.5 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Management
        </div>
        {adminLinks.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href}>
              <div
                className={clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-zinc-100'
                )}
              >
                <Icon size={16} />
                <span>{label}</span>
              </div>
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Footer profile + logout */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2.5 p-2 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {user?.name || 'Administrator'}
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
              {user?.email || 'admin@example.com'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3.5 left-3.5 z-50 p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
        aria-label="Open admin menu"
      >
        <Menu size={18} />
      </button>

      <aside className="hidden lg:flex w-64 h-screen fixed top-0 left-0 z-40 flex-col">
        {sidebarContent}
      </aside>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'lg:hidden fixed top-0 left-0 z-50 h-screen w-72 shadow-2xl transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
