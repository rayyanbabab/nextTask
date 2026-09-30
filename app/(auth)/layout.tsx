import type { ReactNode } from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen w-full flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden transition-colors">
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, #f8fafc 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:scale-105 transition-transform">
            NT
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
            Nexttask
          </span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>v1.0 Ready</span>
        </div>
      </header>

      {/* Auth Content Container */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-500">
        <div>© {new Date().getFullYear()} Nexttask · High-performance task management</div>
        <div className="flex items-center gap-4">
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition cursor-pointer">Security</span>
          <span>·</span>
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition cursor-pointer">Terms</span>
          <span>·</span>
          <span className="hover:text-zinc-600 dark:hover:text-zinc-300 transition cursor-pointer">Privacy</span>
        </div>
      </footer>
    </main>
  )
}
