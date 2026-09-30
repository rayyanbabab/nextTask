'use client'

import Link from 'next/link'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function AdminHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-16 px-4 sm:px-6 fixed top-0 left-0 lg:left-64 right-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between transition-colors">
      {/* Title */}
      <div className="pl-11 lg:pl-0 flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Admin Console
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Workspace</span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>
      </div>
    </header>
  )
}
