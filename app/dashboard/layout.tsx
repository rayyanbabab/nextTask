import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import NotificationProvider from '@/components/NotificationProvider'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      {/* Desktop: offset by sidebar width. Mobile: no offset (sidebar is overlay) */}
      <div className="flex-1 lg:ml-64 min-h-screen bg-gray-100">
        <Header />
        <main className="pt-[72px] p-4 md:p-6">
          <NotificationProvider />
          {children}
        </main>
      </div>
    </div>
  )
}
