'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Shield, Key, CheckCircle, AlertCircle, Calendar, Palette, Sun, Moon } from 'lucide-react'
import clsx from 'clsx'

export default function SettingsPage() {
  const { user, setUser } = useUser()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Extra user details (e.g. joined date)
  const [userDetails, setUserDetails] = useState<{ createdAt?: string; role?: string } | null>(null)

  useEffect(() => {
    if (user?.name) {
      setName(user.name)
    }

    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserDetails(data.user)
          if (data.user.name) setName(data.user.name)
        }
      })
      .catch(() => {})
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage(null)

    try {
      const res = await fetch('/api/me/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()
      if (!res.ok) {
        setProfileMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      } else {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' })
        if (data.user) {
          setUser({
            ...user!,
            name: data.user.name,
          })
        }
      }
    } catch {
      setProfileMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setPasswordSaving(true)

    try {
      const res = await fetch('/api/me/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' })
      } else {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPasswordMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage your profile details, theme appearance, and security.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-colors">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-blue-100 dark:shadow-none">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{user?.name}</h2>
            <span className="inline-flex items-center gap-1 self-center sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
              <Shield className="w-3 h-3" />
              {userDetails?.role ?? 'USER'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
          {userDetails?.createdAt && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-gray-400 dark:text-slate-500 pt-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {new Date(userDetails.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Appearance & Theme Setting */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-5 transition-colors">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600 dark:text-purple-400">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">Appearance & Theme</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500">Pilih tema antarmuka yang nyaman untuk mata Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={clsx(
              'flex items-center gap-3.5 p-4 rounded-xl border-2 text-left transition-all',
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
            )}
          >
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Mode Terang (Light)</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Tampilan bersih dengan kontras tinggi</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={clsx(
              'flex items-center gap-3.5 p-4 rounded-xl border-2 text-left transition-all',
              theme === 'dark'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
            )}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">Mode Gelap (Dark)</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Lebih redup dan nyaman untuk malam hari</div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-5 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-slate-800">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">Profile Information</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500">Update your account name</p>
            </div>
          </div>

          {profileMessage && (
            <div
              className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-slate-300 block mb-1">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-slate-300 block mb-1">Email Address</label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 cursor-not-allowed dark:border-slate-700"
              />
              <span className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 block">Email address cannot be modified.</span>
            </div>

            <Button
              type="submit"
              disabled={profileSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5"
            >
              {profileSaving ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 space-y-5 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-slate-800">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">Security & Password</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500">Update your login password</p>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {passwordMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-slate-300 block mb-1">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-slate-300 block mb-1">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-slate-300 block mb-1">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            <Button
              type="submit"
              disabled={passwordSaving}
              className="w-full bg-gray-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl py-2.5"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

