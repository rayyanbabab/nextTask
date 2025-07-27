import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen bg-gray-100">
        <Header />
        <main className="pt-[72px] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
