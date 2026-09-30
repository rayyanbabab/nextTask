'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

export default function AuthForm() {
  const router = useRouter()
  const pathname = usePathname()
  const isLogin = pathname.includes('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const fillQuickAccount = (email: string, pass: string) => {
    setForm(prev => ({ ...prev, email, password: pass }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
        credentials: 'include',
      })

      let data
      try {
        data = await res.json()
      } catch {
        setError('Server response was not in JSON format')
        setLoading(false)
        return
      }

      if (res.ok) {
        if (data.user?.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Authentication failed. Please verify your credentials.')
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Please check your connection'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-7 sm:p-9 shadow-sm transition-all space-y-6">
      {/* Title & Description */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          {isLogin
            ? 'Sign in to access your dashboard and organize your tasks'
            : 'Enter your details below to get started with Nexttask'}
        </p>
      </div>

      {/* Quick Demo Credentials Pill (Login mode only) */}
      {isLogin && (
        <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>Quick Demo Accounts</span>
            <span className="text-[10px] lowercase text-zinc-400 font-normal">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@example.com', 'admin123')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold">Admin</span>
                <span className="text-[10px] text-zinc-400 block truncate">admin@example.com</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillQuickAccount('john@example.com', 'user123')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="font-semibold">User (John)</span>
                <span className="text-[10px] text-zinc-400 block truncate">john@example.com</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 leading-relaxed">{error}</div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <Input
            label="Full Name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            startIcon={<UserIcon className="w-4 h-4" />}
          />
        )}

        <Input
          label="Email Address"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="name@example.com"
          startIcon={<Mail className="w-4 h-4" />}
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            startIcon={<Lock className="w-4 h-4" />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-zinc-700 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          isLoading={loading}
          className="w-full font-medium mt-2"
        >
          <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
          {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
        </Button>
      </form>

      {/* Mode Switcher */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {isLogin ? "Don't have an account yet?" : 'Already have an account?'}{' '}
          <Link
            href={isLogin ? '/register' : '/login'}
            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 transition"
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  )
}
