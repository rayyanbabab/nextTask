'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormCard } from '@/components/ui/FormCard'
import { useUser } from '@/context/UserContext'

export default function CreateCategoryPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!name.trim()) {
      setError('Category name is required')
      setLoading(false)
      return
    }

    if (!user) {
      console.error('User is not logged in')
      return
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          userId: user.id
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create category')
      } else {
        router.push('/dashboard/categories')
      }
    } catch (err) {
      setError('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <FormCard title="Create New Category" subtitle="Add a new task category to organize your tasks.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Category Name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Personal, Work, Learning"
          required
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Category'}
        </Button>
      </form>
    </FormCard>
  )
}
