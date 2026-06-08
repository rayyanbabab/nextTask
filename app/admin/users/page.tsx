'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Shield, ShieldOff, Trash2, Users, ChevronUp, ChevronDown } from 'lucide-react'

interface User {
  id: number
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  _count: { tasks: number }
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [sortBy, setSortBy] = useState<'createdAt' | 'tasks'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    setActionLoading(user.id)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      } else {
        const err = await res.json()
        alert(err.error || 'Gagal mengubah role')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: number) => {
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        setDeleteConfirm(null)
      } else {
        const err = await res.json()
        alert(err.error || 'Gagal menghapus user')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase()
      const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else {
        cmp = a._count.tasks - b._count.tasks
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  const toggleSort = (field: 'createdAt' | 'tasks') => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: 'createdAt' | 'tasks' }) => (
    <span className="inline-flex flex-col ml-1 opacity-60">
      <ChevronUp size={10} className={sortBy === field && sortDir === 'asc' ? 'opacity-100 text-indigo-600' : ''} />
      <ChevronDown size={10} className={sortBy === field && sortDir === 'desc' ? 'opacity-100 text-indigo-600' : ''} />
    </span>
  )

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const avatarColors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-indigo-600 w-6 h-6" />
            Manajemen User
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {users.length} user terdaftar · {users.filter(u => u.role === 'ADMIN').length} admin
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
        >
          <option value="ALL">Semua Role</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => toggleSort('tasks')}
                  >
                    Tasks <SortIcon field="tasks" />
                  </th>
                  <th
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600 select-none"
                    onClick={() => toggleSort('createdAt')}
                  >
                    Bergabung <SortIcon field="createdAt" />
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Tidak ada user ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Avatar + Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role === 'ADMIN' && <Shield size={10} />}
                          {user.role}
                        </span>
                      </td>

                      {/* Task Count */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">{user._count.tasks}</span>
                        <span className="text-gray-400 ml-1">tugas</span>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Promote/Demote Button */}
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={actionLoading === user.id}
                            title={user.role === 'ADMIN' ? 'Turunkan ke User' : 'Jadikan Admin'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                              user.role === 'ADMIN'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                            }`}
                          >
                            {actionLoading === user.id ? (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : user.role === 'ADMIN' ? (
                              <><ShieldOff size={12} /> Turunkan</>
                            ) : (
                              <><Shield size={12} /> Promosi</>
                            )}
                          </button>

                          {/* Delete Button */}
                          {deleteConfirm === user.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={actionLoading === user.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-50"
                              >
                                {actionLoading === user.id ? '...' : 'Ya, Hapus'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(user.id)}
                              title="Hapus User"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all"
                            >
                              <Trash2 size={12} />
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
