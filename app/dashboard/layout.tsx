import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import NotificationProvider from '@/components/NotificationProvider'
import DueNotificationBanner from '@/components/DueNotificationBanner'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Sidebar />
      {/* Desktop: offset by sidebar width (64 / 16rem). Mobile: full width */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl w-full mx-auto space-y-6">
          <NotificationProvider />
          <DueNotificationBanner />
          {children}
        </main>
      </div>
    </div>
  )
}
