'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

import { Input } from './ui/Input'
import { Button } from './ui/Button'

interface User {
  name: string
  email: string
  role: string
}

export default function AuthForm() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isLogin = pathname.includes('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  const handleSubmit = async () => {
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
        setError('Server error: Invalid response')
        setLoading(false)
        return
      }

      if (res.ok) {
        setUser(data.user)

        if (data.user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(data.error || 'Gagal')
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="w-full max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        {isLogin ? 'Hi, Welcome Back!' : 'Hi, Welcome'}
      </h1>

      {!isLogin && (
        <Input label="Username" name="name" value={form.name} onChange={handleChange}
          placeholder="Enter name here"
        />
      )}

      <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange}
        placeholder="Enter email here"
      />

      <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange}
        placeholder="Enter password here"
      />

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
      </Button>

      <p className="text-sm tracking-tight text-center text-gray-500">
        {isLogin ? (
          <>
            Don't have an account ?{' '}
            <Link href="/register" className="text-sky-600 hover:text-sky-800 font-semibold transition">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account ?{' '}
            <Link href="/login" className="text-sky-600 hover:text-sky-800 font-semibold transition">
              Login
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
