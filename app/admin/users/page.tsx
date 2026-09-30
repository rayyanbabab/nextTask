'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Users,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'

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
      setUsers(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        )
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to update user role')
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
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setDeleteConfirm(null)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to delete user')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase()
      const matchesSearch =
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === 'createdAt') {
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else {
        cmp = (a._count?.tasks ?? 0) - (b._count?.tasks ?? 0)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  const toggleSort = (field: 'createdAt' | 'tasks') => {
    if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: 'createdAt' | 'tasks' }) => (
    <span className="inline-flex flex-col ml-1 opacity-60">
      <ChevronUp
        size={10}
        className={
          sortBy === field && sortDir === 'asc'
            ? 'opacity-100 text-indigo-600'
            : ''
        }
      />
      <ChevronDown
        size={10}
        className={
          sortBy === field && sortDir === 'desc'
            ? 'opacity-100 text-indigo-600'
            : ''
        }
      />
    </span>
  )

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Users className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
          <span>User Directory</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {users.length} registered accounts ·{' '}
          {users.filter((u) => u.role === 'ADMIN').length} administrator privileges
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')
          }
          className="h-10 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Standard Users</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            Loading user records...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                  <th className="px-6 py-3.5 text-left">User</th>
                  <th className="px-6 py-3.5 text-left">Role</th>
                  <th
                    className="px-6 py-3.5 text-left cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none"
                    onClick={() => toggleSort('tasks')}
                  >
                    Tasks <SortIcon field="tasks" />
                  </th>
                  <th
                    className="px-6 py-3.5 text-left cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none"
                    onClick={() => toggleSort('createdAt')}
                  >
                    Joined <SortIcon field="createdAt" />
                  </th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-zinc-400"
                    >
                      No user accounts match the search query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Avatar + Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border',
                            user.role === 'ADMIN'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/60'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                          )}
                        >
                          {user.role === 'ADMIN' && <Shield size={10} />}
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Task Count */}
                      <td className="px-6 py-4 font-mono text-zinc-700 dark:text-zinc-300">
                        {user._count?.tasks ?? 0}
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={actionLoading === user.id}
                            className={clsx(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition cursor-pointer disabled:opacity-50',
                              user.role === 'ADMIN'
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100'
                            )}
                          >
                            {user.role === 'ADMIN' ? (
                              <>
                                <ShieldOff size={12} />
                                <span>Demote</span>
                              </>
                            ) : (
                              <>
                                <Shield size={12} />
                                <span>Promote</span>
                              </>
                            )}
                          </button>

                          {deleteConfirm === user.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={actionLoading === user.id}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(user.id)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 size={13} />
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
