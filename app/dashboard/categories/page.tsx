'use client'

import { SquarePen, Pencil, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormCard } from '@/components/ui/FormCard'
import { Button } from '@/components/ui/Button'

type Task = {
  id: number
  title: string
  description?: string
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  dueDate?: string
}

type Category = {
  id: number
  name: string
  tasks: Task[]
}

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([])
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('/api/categories/categories-with-task')
      const data = await res.json()
      setCategories(data)
    }
    fetchCategories()
  }, [])

  const toggleCategory = (id: number) => {
    setOpenCategoryId(openCategoryId === id ? null : id)
  }

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('Are you sure you want to delete this category?')
    if (!confirm) return

    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setCategories(prev => prev.filter(cat => cat.id !== id))
  }

  return (
    <FormCard title="Your Task Categories" subtitle="Click a category to see its tasks">
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 border border-gray-200 rounded-md p-3 shadow-sm">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCategory(category.id)}>
              <div className='flex items-center space-x-2'>
                <SquarePen className='text-gray-700' />
                <h3 className="font-medium text-md text-gray-600">
                  {category.name} <span className="ml-1 text-xs px-2 py-1 border border-green-200 bg-green-100 text-green-700 rounded-full">{category.tasks.length} Tasks</span>
                </h3>
              </div>
              {openCategoryId === category.id ? <ChevronUp /> : <ChevronDown />}
            </div>

            {openCategoryId === category.id && (
              <div className="mt-2 space-y-2">
                {category.tasks.length > 0 ? (
                  category.tasks.map((task) => (
                    <div key={task.id} className="w-1/2 bg-white border border-gray-200 dark:bg-gray-700 p-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className='bg-sky-100 p-2 rounded-md'>
                          <FileText strokeWidth={1.5} className="text-sky-700" />
                        </div>
                        <div className="flex flex-col">
                          <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">{task.title}</div>
                          {task.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="w-1/2 p-2 bg-gray-100 text-gray-500 font-semibold rounded-lg text-sm">No tasks in this category.</p>
                )}

                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/categories/${category.id}/edit`)}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button variant="default" onClick={() => router.push('/dashboard/categories/create')}>
          Add New Category
        </Button>
      </div>
    </FormCard>
  )
}
