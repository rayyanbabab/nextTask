import { LayoutDashboard, SquarePlus, ClipboardList, History, ScrollText, LayoutGrid, BarChart3, Tag, RefreshCw, CalendarDays } from 'lucide-react'
import { ReactNode } from 'react'

export type NavItem = {
  name: string
  href: string
  icon: ReactNode
  section?: string
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, section: 'Overview' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 size={18} />, section: 'Overview' },
  { name: 'Calendar', href: '/dashboard/calendar', icon: <CalendarDays size={18} />, section: 'Overview' },
  { name: 'Create Task', href: '/dashboard/tasks/create', icon: <SquarePlus size={18} />, section: 'Tasks' },
  { name: 'My Tasks', href: '/dashboard/tasks', icon: <ClipboardList size={18} />, section: 'Tasks' },
  { name: 'Kanban Board', href: '/dashboard/kanban', icon: <LayoutGrid size={18} />, section: 'Tasks' },
  { name: 'Recurring', href: '/dashboard/recurring', icon: <RefreshCw size={18} />, section: 'Tasks' },
  { name: 'Task History', href: '/dashboard/histories', icon: <History size={18} />, section: 'Tasks' },
  { name: 'Categories', href: '/dashboard/categories', icon: <ScrollText size={18} />, section: 'Organize' },
  { name: 'Labels', href: '/dashboard/labels', icon: <Tag size={18} />, section: 'Organize' },
]