'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { FormCard } from '@/components/ui/FormCard'

export default function CreateTaskPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    categoryId: '',
  })

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const now = new Date().toISOString().slice(0, 16) // "YYYY-MM-DDTHH:mm"
    setForm((prev) => ({ ...prev, dueDate: now }))

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        if (res.ok) {
          setCategories(data.categories || [])
        } else {
          console.error('Failed to fetch categories:', data.error)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...form,
      dueDate: form.dueDate || undefined,
      categoryId: form.categoryId || undefined,
    }

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to create task')
    } else {
      router.push('/dashboard/tasks')
    }

    setLoading(false)
  }

  return (
    <FormCard title="Create New Task" subtitle="Fill in the details to create a new task.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" name="title"
          value={form.title} onChange={handleChange} placeholder="Enter task title"
          required
        />

        <Textarea label="Description" name="description"
          value={form.description} onChange={handleChange} placeholder="Enter task description"
        />

        <Input label="Due Date" name="dueDate" type="datetime-local"
          value={form.dueDate} onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push('/dashboard/tasks')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </FormCard>
  )
}
