// src/components/StatusBadge.tsx
interface StatusBadgeProps {
  status:
    | 'current'
    | 'active'
    | 'inactive'
    | 'published'
    | 'resit'
    | 'completed'
    | 'mandatory'
    | 'optional'
    | 'graduated'
    | string          // ← allow any string from backend
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    current: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    mandatory: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-800 border-slate-200',
    optional: 'bg-slate-100 text-slate-800 border-slate-200',
    published: 'bg-blue-100 text-blue-800 border-blue-200',
    resit: 'bg-amber-100 text-amber-800 border-amber-200',
    graduated: 'bg-purple-100 text-purple-800 border-purple-200',
  }

  const defaultLabels: Record<string, string> = {
    current: 'Current',
    active: 'Active',
    inactive: 'Inactive',
    published: 'Published',
    resit: 'Resit',
    completed: 'Completed',
    mandatory: 'Mandatory',
    optional: 'Optional',
    graduated: 'Graduated',
  }

  const styleClass = styles[status] || 'bg-slate-100 text-slate-800 border-slate-200'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClass}`}
    >
      {label || defaultLabels[status] || status}
    </span>
  )
}