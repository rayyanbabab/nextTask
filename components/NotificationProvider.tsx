'use client'

import { useEffect, useRef } from 'react'

export default function NotificationProvider() {
  const notifiedIds = useRef<Set<number>>(new Set())

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const checkDueTasks = async () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return

      try {
        const res = await fetch('/api/tasks')
        if (!res.ok) return
        const data = await res.json()
        const tasks: any[] = data.tasks || []

        const now = new Date()
        const oneHour = 60 * 60 * 1000

        tasks.forEach((task) => {
          if (task.status !== 'PROCESS') return
          if (notifiedIds.current.has(task.id)) return

          // Check reminder field first
          if (task.reminder) {
            const reminderTime = new Date(task.reminder)
            const diff = reminderTime.getTime() - now.getTime()
            if (diff > 0 && diff <= oneHour) {
              notifiedIds.current.add(task.id)
              new Notification(`⏰ Reminder: ${task.title}`, {
                body: `Due: ${new Date(task.dueDate).toLocaleString()}`,
                icon: '/favicon.ico',
                tag: `reminder-${task.id}`,
              })
              return
            }
          }

          // Overdue tasks
          if (task.dueDate) {
            const due = new Date(task.dueDate)
            if (due < now) {
              notifiedIds.current.add(task.id)
              new Notification(`🚨 Overdue: ${task.title}`, {
                body: `Was due ${due.toLocaleDateString()}`,
                icon: '/favicon.ico',
                tag: `overdue-${task.id}`,
              })
            }
          }
        })
      } catch (e) {
        // silently fail
      }
    }

    checkDueTasks()
    const interval = setInterval(checkDueTasks, 60_000)
    return () => clearInterval(interval)
  }, [])

  return null
}
