'use client'

import { useEffect, useState } from 'react'
import { Tag, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import clsx from 'clsx'

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
    const res = await fetch('/api/labels')
    const data = await res.json()
    setLabels(data.labels || [])
    setLoading(false)
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
    if (!confirm('Delete this label? It will be removed from all tasks.')) return
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labels</h1>
          <p className="text-sm text-gray-500 mt-0.5">Organize tasks with color-coded labels</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Label
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Create New Label</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createLabel()}
              placeholder="Label name..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {/* Color Picker */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={clsx(
                      'w-7 h-7 rounded-full transition-all hover:scale-110',
                      newColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={e => setNewColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
                />
                <span className="text-xs text-gray-400 font-mono">{newColor}</span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium ml-1"
                  style={{ backgroundColor: newColor + '22', color: newColor }}
                >
                  Preview: {newName || 'Label'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createLabel}
              disabled={creating || !newName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : 'Create Label'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Labels List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : labels.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No labels yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Create your first label
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {labels.map(label => (
              <div key={label.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">
                {editId === label.id ? (
                  // Edit mode
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: editColor }} />
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-1">
                      {PRESET_COLORS.slice(0, 6).map(color => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={clsx('w-5 h-5 rounded-full', editColor === color ? 'ring-2 ring-offset-1 ring-gray-400' : '')}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer" />
                    </div>
                    <button onClick={saveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                    <div className="flex-1">
                      <span
                        className="inline-flex items-center text-sm font-medium px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: label.color + '22', color: label.color }}
                      >
                        {label.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {label._count.tasks} task{label._count.tasks !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(label)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteLabel(label.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
