'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { FormCard } from '@/components/ui/FormCard'

type Task = {
  id: number
  title: string
  description?: string
  dueDate?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  categoryId?: number
}

export default function EditTaskPage() {
  const { id } = useParams()
  const router = useRouter()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/tasks/${id}`)
      const data = await res.json()
      setTask(data.task)

      const resCat = await fetch('/api/categories')
      const cats = await resCat.json()
      setCategories(cats.categories)
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })

    let data = null
    if (res.ok) {
      data = await res.json()
      router.push('/dashboard/tasks')
    } else {
      try {
        data = await res.json()
        setError(data.error || 'Failed to update task')
      } catch (e) {
        setError('Failed to update task (invalid response)')
      }
    }

    setLoading(false)
  }

  if (!task) return <p className="p-6">Loading...</p>

  return (
    <FormCard title="Edit Task" subtitle="Update your task details and manage status or category.">

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Task Details</h2>

          <Input label="Title" name="title" value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            required
          />

          <Textarea label="Description" name="description" value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            placeholder="Enter task description..."
          />

          <Input label="Due Date" name="dueDate" value={task.dueDate ? task.dueDate.slice(0, 16) : ''}
            type="datetime-local"
            onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
            required
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Category
          </label>
          <select
            className="w-full border rounded px-3 py-2"
            value={task.categoryId || ''}
            onChange={(e) =>
              setTask({ ...task, categoryId: parseInt(e.target.value) || undefined })
            }
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </section>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Task'}
          </Button>
        </div>
      </form>
    </FormCard>
  )
}
