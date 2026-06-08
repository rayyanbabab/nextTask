'use client'

import { Home, Users, LogOut, ClipboardList, Menu, X } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import { Button } from './ui/Button'
import { useState, useEffect } from 'react'

const adminLinks = [
  { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/tasks', icon: ClipboardList, label: 'Semua Tugas' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useUser()
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
    <div className="flex flex-col h-full">
      <div className="p-[17.5px] border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-indigo-600">Admin Panel</h2>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {adminLinks.map(({ href, icon: Icon, label }) => (
          <SidebarLink
            key={href}
            href={href}
            icon={Icon}
            label={label}
            active={pathname === href}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start flex items-center gap-2 text-gray-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 text-red-500" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        aria-label="Open admin menu"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-white border-r border-gray-200 fixed top-0 left-0 z-10 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={clsx(
          'lg:hidden fixed top-0 left-0 z-50 h-screen w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

type LinkProps = {
  href: string
  icon: React.ElementType
  label: string
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
