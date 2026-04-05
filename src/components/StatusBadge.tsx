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
  label?: string
}
export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    current: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    mandatory: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-800 border-slate-200',
    optional: 'bg-slate-100 text-slate-800 border-slate-200',
    published: 'bg-blue-100 text-blue-800 border-blue-200',
    resit: 'bg-amber-100 text-amber-800 border-amber-200',
  }
  const defaultLabels = {
    current: 'Current',
    active: 'Active',
    inactive: 'Inactive',
    published: 'Published',
    resit: 'Resit',
    completed: 'Completed',
    mandatory: 'Mandatory',
    optional: 'Optional',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {label || defaultLabels[status]}
    </span>
  )
}
