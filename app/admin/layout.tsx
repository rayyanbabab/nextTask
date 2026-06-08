import UserSidebar from '@/components/AdminSidebar'
import UserHeader from '@/components/AdminHeader'
import React, { ReactNode } from 'react'

interface AdminPageProps {
  children: ReactNode
}

export default function AdminPage({ children }: AdminPageProps) {
  return (
    <div className="flex bg-white">
      <UserSidebar />
      <div className="flex-1 lg:ml-64 w-full">
        <UserHeader />
        <main className="pt-20 px-4 md:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
