'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormCard } from '@/components/ui/FormCard'

type Category = {
  id: number
  name: string
}

export default function EditCategoryPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)
  const router = useRouter()

  const params = useParams<{ id: string }>()
  const id = params.id

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        console.log(data)
        setCategory(data)
        setName(data.name)
      } catch (error) {
        console.error('Failed to fetch category:', error)
      } finally {
        setFetching(false) // ✅ Tambahkan ini di akhir
      }
    }

    fetchCategory()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!name.trim()) {
      setError('Category name is required')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update category')
      } else {
        router.push('/dashboard/categories')
      }
    } catch (err) {
      setError('Something went wrong')
    }

    setLoading(false)
  }

  return (
    <FormCard title="Edit Category" subtitle="Update the name of this task category.">
      {fetching ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Category Name" name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Personal, Work, Learning"
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Category'}
          </Button>
        </form>
      )}
    </FormCard>
  )
}
