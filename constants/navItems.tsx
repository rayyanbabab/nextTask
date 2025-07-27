import { LayoutDashboard, SquarePlus, ClipboardList, History, ScrollText } from 'lucide-react'
import { ReactNode } from 'react'

export type NavItem = {
  name: string
  href: string
  icon: ReactNode
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { name: 'Create Tasks', href: '/dashboard/tasks/create', icon: <SquarePlus size={18} /> },
  { name: 'My Tasks', href: '/dashboard/tasks', icon: <ClipboardList size={18} /> },
  { name: 'Tasks History', href: '/dashboard/histories', icon: <History size={18} /> },
  { name: 'Tasks Category', href: '/dashboard/categories', icon: <ScrollText size={18} />  },
]