import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import NotificationProvider from '@/components/NotificationProvider'
import DueNotificationBanner from '@/components/DueNotificationBanner'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex bg-gray-100 dark:bg-slate-950 min-h-screen text-gray-900 dark:text-slate-100 transition-colors">
      <Sidebar />
      {/* Desktop: offset by sidebar width. Mobile: no offset (sidebar is overlay) */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <Header />
        <main className="pt-24 px-4 md:px-6 pb-8">
          <NotificationProvider />
          <DueNotificationBanner />
          {children}
        </main>
      </div>
    </div>
  )
}

