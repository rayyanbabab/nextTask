'use client'

import { useState, useCallback } from 'react'
import { Dialog } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { ClipboardList, ChevronDown, ChevronUp, SquarePen, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { Textarea } from '../ui/TextArea'
import { Button } from '../ui/Button'
import Checkbox from '../ui/Checkbox'


type TaskCardProps = {
  id: number
  title: string
  description?: string
  category?: { name: string }
  status: 'PROCESS' | 'SUCCESS' | 'FAILED'
  createdAt?: string
  dueDate?: string
  failureReason?: string
  updatedAt?: string

  hideEdit?: boolean
  showCheckbox?: boolean
  isSelected?: boolean

  onToggleSelect?: () => void
  onDelete?: () => void
}

const statusStyle = {
  PROCESS: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700',
  SUCCESS: 'bg-green-50 hover:bg-green-100 text-green-700',
  FAILED: 'bg-red-50 hover:bg-red-100 text-red-700',
}

export default function TaskCard({ id, title, description, category, status, createdAt, dueDate, updatedAt, failureReason, hideEdit, showCheckbox, isSelected, onToggleSelect, onDelete }: TaskCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [reasonInput, setReasonInput] = useState('')
  const [showFailureModal, setShowFailureModal] = useState(false)
  const [showReason, setShowReason] = useState(false)

  const router = useRouter()

  const handleStatusChange = useCallback(
    async (newStatus: typeof status) => {
      if (newStatus === 'FAILED') {
        setShowFailureModal(true)
        return
      }

      await updateStatus(newStatus)
    },
    [id]
  )

  const updateStatus = async (newStatus: typeof status, reason?: string) => {
    try {
      await fetch(`/api/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, failureReason: reason }),
      })
      setCurrentStatus(newStatus)
      setDropdownOpen(false)
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const submitFailureReason = async () => {
    if (!reasonInput.trim()) return alert('Failure reason required.')
    await updateStatus('FAILED', reasonInput)
    setShowFailureModal(false)
  }

  const handleDelete = useCallback(async () => {
    if (confirm('Delete this task?')) {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      onDelete?.()
      router.refresh()
    }
  }, [id, onDelete, router])

  return (
    <>
      <article className="relative p-5 bg-white rounded-2xl shadow-md border border-gray-200 space-y-3">
        <header className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={clsx('p-2 rounded-md', statusStyle[currentStatus])}>
              <ClipboardList strokeWidth={2} size={20} />
            </span>
            <div className="flex flex-col leading-tight">
              <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
              <span className="text-xs font-light text-gray-500">
                {category?.name ?? 'Uncategorized'}
              </span>
            </div>
          </div>

          <div className="relative">
            <button onClick={() => setDropdownOpen((prev) => !prev)}
              className={clsx(
                'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer',
                statusStyle[currentStatus]
              )}
            >
              {currentStatus}
              {dropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {dropdownOpen && (
              <ul className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-xl shadow-lg z-20">
                {(['PROCESS', 'SUCCESS', 'FAILED'] as const).map((statusOption) => (
                  <li key={statusOption}>
                    <button onClick={() => handleStatusChange(statusOption)} className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50">
                      {statusOption}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        {description && (
          <section className="text-sm text-gray-600">
            <p>{description}</p>
          </section>
        )}

        <footer className="text-xs text-gray-400 space-y-1">
          {currentStatus === 'FAILED' && failureReason && (
            <div className="text-red-500 space-y-1">
              {showReason ? (
                <>
                  <button className="text-sm text-blue-500 flex items-center gap-1"
                    onClick={() => setShowReason(false)}
                  >
                    <span>Hide Reason</span>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <p>Reason: {failureReason}</p>
                </>
              ) : (
                <button className="text-sm text-blue-500 flex items-center gap-1"
                  onClick={() => setShowReason(true)}
                >
                  <span>Show Reason</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div>Created at: {createdAt ? new Date(createdAt).toLocaleString() : '-'}</div>

          {(currentStatus === 'SUCCESS' || currentStatus === 'FAILED') && (
            <div>Updated at: {updatedAt ? new Date(updatedAt).toLocaleString() : '-'}</div>
          )}

          <div>Due date: {dueDate ? new Date(dueDate).toLocaleString() : '-'}</div>
        </footer>

        <div className="pt-2 mt-2 flex justify-between items-center">
          <div className="flex gap-4">
            {!hideEdit && (
              <button onClick={() => router.push(`/dashboard/tasks/edit/${id}`)} className="flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-700">
                <SquarePen className="w-4 h-4" />
                Edit
              </button>
            )}

            <button onClick={handleDelete} className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          {showCheckbox && (
            <Checkbox checked={isSelected} onChange={onToggleSelect} />
          )}
        </div>


      </article>

      <Dialog open={showFailureModal} onClose={() => setShowFailureModal(false)} className="relative z-50 rounded-lg">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded bg-white p-6 space-y-4 shadow-lg">
            <Dialog.Title className="text-lg font-bold">Type Reason</Dialog.Title>

            <Textarea rows={3} value={reasonInput} onChange={(e) => setReasonInput(e.target.value)}
              name="Failure Reason" label="Failure Reason" placeholder="Type your Reason Here"
            />

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowFailureModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="default" onClick={submitFailureReason} className="bg-red-500 hover:bg-red-600">
                Submit
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

    </>
  )
}
