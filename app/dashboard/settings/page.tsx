'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  User,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Calendar,
  Palette,
  Sun,
  Moon,
} from 'lucide-react'
import clsx from 'clsx'

export default function SettingsPage() {
  const { user, setUser } = useUser()
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Extra user details
  const [userDetails, setUserDetails] = useState<{
    createdAt?: string
    role?: string
  } | null>(null)

  useEffect(() => {
    if (user?.name) {
      setName(user.name)
    }

    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => {
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
        setProfileMessage({
          type: 'error',
          text: data.error || 'Failed to update profile',
        })
      } else {
        setProfileMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        })
        if (data.user) {
          setUser({
            ...user!,
            name: data.user.name,
          })
        }
      }
    } catch {
      setProfileMessage({
        type: 'error',
        text: 'An unexpected network error occurred',
      })
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
      setPasswordMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long',
      })
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
        setPasswordMessage({
          type: 'error',
          text: data.error || 'Failed to change password',
        })
      } else {
        setPasswordMessage({
          type: 'success',
          text: 'Password updated successfully!',
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPasswordMessage({
        type: 'error',
        text: 'An unexpected network error occurred',
      })
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your personal profile, security credentials, and interface preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-colors">
        <div className="w-16 h-16 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-2xl font-bold flex items-center justify-center shadow-xs shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {user?.name}
            </h2>
            <span
              className={clsx(
                'inline-flex items-center gap-1 self-center sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                user?.role === 'ADMIN'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/60'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              )}
            >
              <Shield className="w-3 h-3" />
              <span>{userDetails?.role ?? user?.role ?? 'USER'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {user?.email}
          </p>
          {userDetails?.createdAt && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-400 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Joined{' '}
                {new Date(userDetails.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Appearance & Theme Setting */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 space-y-4 transition-colors">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Palette className="w-4 h-4 text-zinc-500" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Interface Theme
            </h3>
            <p className="text-xs text-zinc-400">
              Select your preferred visual style across all workspace views
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={clsx(
              'flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer',
              theme === 'light'
                ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-zinc-50 dark:bg-zinc-800/40'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
            )}
          >
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Light Mode
              </div>
              <div className="text-[11px] text-zinc-400">
                Crisp contrast on light backgrounds
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={clsx(
              'flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer',
              theme === 'dark'
                ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/10 dark:ring-zinc-100/10 bg-zinc-50 dark:bg-zinc-800/40'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
            )}
          >
            <div className="p-2.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Dark Mode
              </div>
              <div className="text-[11px] text-zinc-400">
                Deep blacks and low fatigue palette
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 space-y-4 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-zinc-500" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Profile Details
              </h3>
              <p className="text-xs text-zinc-400">Update your public display name</p>
            </div>
          </div>

          {profileMessage && (
            <div
              className={clsx(
                'p-3 rounded-lg text-xs flex items-center gap-2 border',
                profileMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              )}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Email address is permanent and cannot be changed."
            />

            <Button
              type="submit"
              size="sm"
              isLoading={profileSaving}
              className="w-full"
            >
              Save Profile Changes
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-6 space-y-4 transition-colors">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Key className="w-4 h-4 text-zinc-500" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Security & Password
              </h3>
              <p className="text-xs text-zinc-400">Update your account authentication credentials</p>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={clsx(
                'p-3 rounded-lg text-xs flex items-center gap-2 border',
                passwordMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              )}
            >
              {passwordMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
            />

            <Button
              type="submit"
              size="sm"
              isLoading={passwordSaving}
              className="w-full mt-1"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
