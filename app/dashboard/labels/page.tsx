'use client'

import { useEffect, useState } from 'react'
import { Tag, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '@/components/ui/Button'

type Label = { id: number; name: string; color: string; _count: { tasks: number } }

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#64748b', '#a16207',
]

export default function LabelsPage() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const fetchLabels = async () => {
    try {
      const res = await fetch('/api/labels')
      const data = await res.json()
      setLabels(data.labels || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLabels() }, [])

  const createLabel = async () => {
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, color: newColor }),
    })
    if (res.ok) {
      setNewName('')
      setNewColor('#6366f1')
      setShowForm(false)
      await fetchLabels()
    }
    setCreating(false)
  }

  const deleteLabel = async (id: number) => {
    if (!confirm('Delete this label? It will be removed from all associated tasks.')) return
    await fetch(`/api/labels/${id}`, { method: 'DELETE' })
    setLabels(prev => prev.filter(l => l.id !== id))
  }

  const startEdit = (label: Label) => {
    setEditId(label.id)
    setEditName(label.name)
    setEditColor(label.color)
  }

  const saveEdit = async () => {
    if (!editId) return
    await fetch(`/api/labels/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, color: editColor }),
    })
    setLabels(prev => prev.map(l => l.id === editId ? { ...l, name: editName, color: editColor } : l))
    setEditId(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tags & Labels</h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">Organize and filter tasks across projects with color-coded tags.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Label</span>
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-5 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create New Label</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createLabel()}
              placeholder="Label name (e.g. Design, Urgent, Backend)..."
              className="w-full h-10 px-3.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-zinc-950/5 dark:focus:ring-zinc-100/10"
              autoFocus
            />

            {/* Color Swatches */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Palette Selection</label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={clsx(
                      'w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer',
                      newColor === color ? 'ring-2 ring-offset-2 ring-zinc-500 dark:ring-offset-zinc-900 scale-110' : ''
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                  />
                  <span className="text-xs font-mono text-zinc-400">{newColor}</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-zinc-400">Preview:</span>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: newColor + '22', color: newColor }}
              >
                {newName || 'Label Preview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              onClick={createLabel}
              disabled={creating || !newName.trim()}
              isLoading={creating}
              size="sm"
            >
              Create Label
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Labels List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg animate-pulse" />)}
          </div>
        ) : labels.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No labels created yet</p>
            <p className="text-xs text-zinc-400 mt-1">Tags help you quickly filter and identify priorities.</p>
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="mt-4"
            >
              Add first label
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {labels.map(label => (
              <div key={label.id} className="flex items-center gap-4 px-5 py-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                {editId === label.id ? (
                  // Edit mode
                  <div className="flex items-center gap-3 flex-1 flex-wrap sm:flex-nowrap">
                    <div className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: editColor }} />
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 h-8 px-2.5 rounded border border-blue-500 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      autoFocus
                    />
                    <div className="flex items-center gap-1">
                      {PRESET_COLORS.slice(0, 6).map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={clsx('w-4 h-4 rounded-full', editColor === color ? 'ring-2 ring-offset-1 ring-zinc-400' : '')}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={saveEdit} className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditId(null)} className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                    <div className="flex-1 min-w-0">
                      <span
                        className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: label.color + '22', color: label.color }}
                      >
                        {label.name}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                      {label._count?.tasks ?? 0} {label._count?.tasks === 1 ? 'task' : 'tasks'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(label)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition"
                        title="Edit label"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLabel(label.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition"
                        title="Delete label"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
