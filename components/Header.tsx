'use client'

import { useMemo } from 'react'
import { Plus, Sun, Moon, ShieldCheck, ChevronRight } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useTheme } from '@/context/ThemeContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from './ui/Button'
import NotificationBell from './NotificationBell'

export default function Header() {
  const { user } = useUser()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  // Derive human-readable breadcrumb from current route
  const currentTitle = useMemo(() => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname.includes('/kanban')) return 'Kanban Board'
    if (pathname.includes('/analytics')) return 'Analytics'
    if (pathname.includes('/calendar')) return 'Calendar'
    if (pathname.includes('/tasks/create')) return 'Create Task'
    if (pathname.includes('/tasks/edit')) return 'Edit Task'
    if (pathname.includes('/tasks/')) return 'Task Details'
    if (pathname.includes('/tasks')) return 'My Tasks'
    if (pathname.includes('/recurring')) return 'Recurring Tasks'
    if (pathname.includes('/histories')) return 'Task History'
    if (pathname.includes('/categories')) return 'Categories'
    if (pathname.includes('/labels')) return 'Labels'
    if (pathname.includes('/settings')) return 'Settings'
    return 'Workspace'
  }, [pathname])

  return (
    <header className="h-16 px-4 sm:px-6 fixed top-0 left-0 lg:left-64 right-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between transition-colors">
      {/* Left: Breadcrumbs — indented on mobile to avoid hamburger overlap */}
      <div className="pl-11 lg:pl-0 flex items-center gap-1.5 text-xs sm:text-sm">
        <span className="text-zinc-400 dark:text-zinc-500 hidden sm:inline">Workspace</span>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 hidden sm:inline" />
        <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {currentTitle}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Admin Quick Switch (if role is ADMIN) */}
        {user?.role === 'ADMIN' && (
          <Link
            href="/admin/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100/70 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        )}

        {/* Notifications */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>

        {/* Create Task primary action */}
        <Button
          size="sm"
          variant="default"
          onClick={() => router.push('/dashboard/tasks/create')}
          className="font-medium cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Task</span>
        </Button>
      </div>
    </header>
  )
}
