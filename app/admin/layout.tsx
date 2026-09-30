import UserSidebar from '@/components/AdminSidebar'
import UserHeader from '@/components/AdminHeader'
import React, { ReactNode } from 'react'

interface AdminPageProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminPageProps) {
  return (
    <div className="min-h-screen flex bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <UserSidebar />
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <UserHeader />
        <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
