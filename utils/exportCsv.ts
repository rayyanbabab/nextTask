export type ExportableTask = {
  id: number
  title: string
  description?: string | null
  status: string
  priority?: string | null
  dueDate?: string | null
  createdAt?: string | null
  category?: { name?: string } | null
  failureReason?: string | null
}

export function exportTasksToCsv(tasks: ExportableTask[], filename = 'tasks-export.csv') {
  if (!tasks || tasks.length === 0) {
    alert('Tidak ada data task untuk diekspor.')
    return
  }

  const headers = [
    'ID',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Due Date',
    'Category',
    'Failure Reason',
    'Created At',
  ]

  const formatField = (value: any) => {
    if (value === null || value === undefined) return '""'
    const stringValue = String(value).replace(/"/g, '""')
    return `"${stringValue}"`
  }

  const rows = tasks.map((task) => [
    formatField(task.id),
    formatField(task.title),
    formatField(task.description || ''),
    formatField(task.status),
    formatField(task.priority),
    formatField(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''),
    formatField(task.category?.name || ''),
    formatField(task.failureReason || ''),
    formatField(task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : ''),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\r\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
