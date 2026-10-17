import Link from 'next/link'
import { ArrowLeft, Home, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 select-none">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto shadow-xs text-zinc-500 dark:text-zinc-400">
          <FileQuestion className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            Error 404
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau alamat URL yang dimasukkan kurang tepat.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Halaman Masuk</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
