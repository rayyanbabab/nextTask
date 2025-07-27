'use client'

import { History, ClipboardList, SquarePlus, ScrollText } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'

export default function Header() {
  const { user } = useUser()
  const router = useRouter()

  return (
    <header className="px-4 md:px-6 py-[18px] fixed top-0 left-0 md:left-64 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="text-sm md:text-base font-medium text-gray-800">
        <span className="text-sm md:text-lg">Welcome, </span>
        <span className="text-sky-700 font-semibold">{user?.name ?? 'Guest'}</span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push('/dashboard/categories')}
        >
          <ScrollText strokeWidth={1.5} size={18} />
          <span className="hidden md:inline ml-1">Categories</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push('/dashboard/histories')}
        >
          <History strokeWidth={1.5} size={18} />
          <span className="hidden md:inline ml-1">Histories</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push('/dashboard/tasks')}
        >
          <ClipboardList strokeWidth={1.5} size={18} />
          <span className="hidden md:inline ml-1">Tasks</span>
        </Button>

        <Button
          size="sm"
          onClick={() => router.push('/dashboard/tasks/create')}
        >
          <SquarePlus strokeWidth={1.5} size={18} />
          <span className="hidden md:inline ml-1">New Task</span>
        </Button>
      </div>
    </header>
  )
}
