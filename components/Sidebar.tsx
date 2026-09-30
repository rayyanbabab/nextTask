'use client'

import { LogOut, Menu, X, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useState, useEffect } from 'react'

import { useUser } from '@/context/UserContext'
import { navItems } from '@/constants/navItems'

export default function Sidebar() {
  const { user, logout } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const sections = navItems.reduce((acc, item) => {
    const section = item.section || 'General'
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {} as Record<string, typeof navItems>)

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 transition-colors select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs transition-transform group-hover:scale-105">
            NT
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <span>Nexttask</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal">
              Workspace
            </div>
          </div>
        </Link>

        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Items List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="space-y-1">
            <div className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {section}
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
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
                      'group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-zinc-100'
                    )}
                  >
                    <span
                      className={clsx(
                        'flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-white dark:text-zinc-950'
                          : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Special Admin Quick Entry (for Admins) */}
        {user?.role === 'ADMIN' && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              Administration
            </div>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 dark:text-indigo-300 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User profile + Settings + Logout */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/50">
        {user && (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/80 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-semibold text-xs shrink-0 group-hover:scale-105 transition-transform">
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user.name}
                </span>
                <span
                  className={clsx(
                    'text-[9px] font-bold px-1.5 py-0.2 rounded tracking-wide shrink-0',
                    user.role === 'ADMIN'
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  {user.role}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                {user.email}
              </div>
            </div>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-500 transition-colors" />
            <span>Sign out</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">⌘Q</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3.5 left-3.5 z-50 p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex w-64 h-screen fixed top-0 left-0 z-40 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
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
