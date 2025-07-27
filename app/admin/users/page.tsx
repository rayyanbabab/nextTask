'use client'

import { FormCard } from '@/components/ui/FormCard'
import { useEffect, useState } from 'react'

interface User {
  email: string
  name: string
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
  }, [])

  return (
    <FormCard title='List Users' subtitle='Manage Users here'>
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Memuat data...</div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-300">Email</th>
                  <th className="px-6 py-4 border-b  border-gray-300">Username</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data user.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 border-b border-gray-300">{user.email}</td>
                      <td className="px-6 py-4 border-b border-gray-300">{user.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </FormCard>
  )
}
