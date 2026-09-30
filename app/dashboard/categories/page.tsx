'use client'

import { Pencil, Trash2, ChevronDown, ChevronUp, FileText, Plus, Folder } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories/categories-with-task')
        const data = await res.json()
        setCategories(data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const toggleCategory = (id: number) => {
    setOpenCategoryId(openCategoryId === id ? null : id)
  }

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this category?')
    if (!confirmDelete) return

    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Task Categories
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Group your workflows by client, project, or operational department.
          </p>
        </div>

        <Link
          href="/dashboard/categories/create"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </Link>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 p-8">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <Folder className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No categories defined yet
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Create categories to neatly organize your daily tasks.
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => router.push('/dashboard/categories/create')}
          >
            Create your first category
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const isOpen = openCategoryId === category.id

            return (
              <div
                key={category.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs transition-colors overflow-hidden"
              >
                {/* Accordion header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition select-none"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {category.name}
                      </h2>
                      <span className="text-[11px] text-zinc-400">
                        {category.tasks.length} {category.tasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                      {category.tasks.length}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Collapsible Content */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-100 dark:border-zinc-800/70 space-y-4">
                    {/* Task Cards in this category */}
                    {category.tasks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                        {category.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                            className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer space-y-1.5"
                          >
                            <div className="flex items-start gap-2">
                              <FileText className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-[11px] text-zinc-400 line-clamp-1">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-zinc-400">
                        No tasks assigned to this category yet.
                      </div>
                    )}

                    {/* Category Management Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/categories/${category.id}/edit`)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                        <span>Edit Category</span>
                      </Button>

                      <Button
                        variant="subtleDestructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
