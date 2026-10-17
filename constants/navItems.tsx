import {
  LayoutDashboard,
  PlusCircle,
  CheckSquare,
  History,
  FolderTree,
  Kanban,
  BarChart3,
  Tag,
  RefreshCw,
  CalendarDays,
  Settings,
} from 'lucide-react'
import { ReactNode } from 'react'

export type NavItem = {
  name: string
  href: string
  icon: ReactNode
  section?: string
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} strokeWidth={2} />, section: 'Overview' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 size={18} strokeWidth={2} />, section: 'Overview' },
  { name: 'Calendar', href: '/dashboard/calendar', icon: <CalendarDays size={18} strokeWidth={2} />, section: 'Overview' },
  { name: 'Create Task', href: '/dashboard/tasks/create', icon: <PlusCircle size={18} strokeWidth={2} />, section: 'Tasks' },
  { name: 'My Tasks', href: '/dashboard/tasks', icon: <CheckSquare size={18} strokeWidth={2} />, section: 'Tasks' },
  { name: 'Kanban Board', href: '/dashboard/kanban', icon: <Kanban size={18} strokeWidth={2} />, section: 'Tasks' },
  { name: 'Recurring', href: '/dashboard/recurring', icon: <RefreshCw size={18} strokeWidth={2} />, section: 'Tasks' },
  { name: 'Task History', href: '/dashboard/histories', icon: <History size={18} strokeWidth={2} />, section: 'Tasks' },
  { name: 'Categories', href: '/dashboard/categories', icon: <FolderTree size={18} strokeWidth={2} />, section: 'Organize' },
  { name: 'Labels', href: '/dashboard/labels', icon: <Tag size={18} strokeWidth={2} />, section: 'Organize' },
  { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} strokeWidth={2} />, section: 'Account' },
]