import Image from 'next/image'
import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-white to-sky-100">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md flex overflow-hidden">

        <section className="hidden md:flex w-1/2 bg-gradient-to-br from-sky-800 to-sky-600 text-white items-center justify-center p-8">
          <div className="text-center">
            <div className='flex flex-col items-center'>
              <Image src="/logos.png" width={50} height={50} alt="Nexttask Logo" className="invert brightness-0" />
              <h2 className="text-3xl font-bold">Welcome!</h2>
            </div>
            <p className="text-sm mt-2 text-white/90 max-w-2xl">Manage your tasks more efficiently</p>
          </div>
        </section>

        <div className="w-full md:w-1/2 p-6 sm:p-10">{children}</div>
      </div>
    </main>
  )
}
