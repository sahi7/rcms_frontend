// src/features/admissions/pages/AdmissionCyclesPage.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  StarIcon,
  LockIcon,
  UserCheckIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from 'lucide-react'
import {
  useCyclesList,
  useCreateCycle,
  useUpdateCycle,
  useDeleteCycle,
  useSetCurrentCycle,
  useClosureStatus,
  useCloseCycle,
  useMigrateCycle,
  useMigrationStatus,
} from '../hooks/useCycles'
import { AdmissionCycle, AdmissionCyclePayload } from '@/types/admissions'
import { StatusBadge } from '@/components/StatusBadge'
import { Can } from '@/hooks/shared/useHasPermission'
import { formatDate } from '@/lib/utils'
import { Modal } from '@/components/AdModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'

const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'

export function AdmissionCyclesPage() {
  const { data, isLoading } = useCyclesList()
  const createMut = useCreateCycle()
  const updateMut = useUpdateCycle()
  const deleteMut = useDeleteCycle()
  const setCurrentMut = useSetCurrentCycle()

  // Safely handle backend responses where `items: null` when empty (instead of `items: []`)
  // This fixes the exact error: "can't access property 'length', data.items is null"
  const items = data?.items ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdmissionCycle | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdmissionCycle | null>(null)
  const [closeTarget, setCloseTarget] = useState<AdmissionCycle | null>(null)
  const [migrateTarget, setMigrateTarget] = useState<AdmissionCycle | null>(
    null,
  )

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (c: AdmissionCycle) => {
    setEditing(c)
    setFormOpen(true)
  }

  const handleSave = async (payload: AdmissionCyclePayload) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          payload,
        })
        toast.success('Cycle updated')
      } else {
        await createMut.mutateAsync(payload)
        toast.success('Cycle created')
      }
      setFormOpen(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to save cycle')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMut.mutateAsync(deleteTarget.id)
      toast.success('Cycle deleted')
      setDeleteTarget(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to delete cycle')
    }
  }

  const handleSetCurrent = async (c: AdmissionCycle) => {
    try {
      await setCurrentMut.mutateAsync(c.id)
      toast.success(`"${c.name}" is now the current cycle`)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to set current cycle')
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Admission cycles
          </h1>
          <p className="text-sm text-slate-500">
            Manage academic intake periods and closure.
          </p>
        </div>
        <Can permission="add_admissioncycle">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
          >
            <PlusIcon className="w-4 h-4" /> New cycle
          </button>
        </Can>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <LoaderIcon className="w-5 h-5 animate-spin mr-2" /> Loading cycles...
        </div>
      ) : !items.length ? (
        <EmptyState onCreate={openCreate} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((c) => (
            <CycleCard
              key={c.id}
              cycle={c}
              onEdit={() => openEdit(c)}
              onDelete={() => setDeleteTarget(c)}
              onSetCurrent={() => handleSetCurrent(c)}
              onClose={() => setCloseTarget(c)}
              onMigrate={() => setMigrateTarget(c)}
              settingCurrent={
                setCurrentMut.isPending && setCurrentMut.variables === c.id
              }
            />
          ))}
        </div>
      )}

      <CycleFormModal
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        submitting={createMut.isPending || updateMut.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete cycle?"
        message={
          <>
            This will permanently delete <strong>{deleteTarget?.name}</strong>.
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {closeTarget && (
        <CloseCycleModal
          cycle={closeTarget}
          onClose={() => setCloseTarget(null)}
        />
      )}

      {migrateTarget && (
        <MigrateCycleModal
          cycle={migrateTarget}
          onClose={() => setMigrateTarget(null)}
        />
      )}
    </motion.div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
      <h3 className="text-base font-semibold text-slate-800">
        No admission cycles yet
      </h3>
      <p className="text-sm text-slate-500 mt-1">
        Create your first cycle to start accepting applications.
      </p>
      <Can permission="add_admissioncycle">
        <button
          onClick={onCreate}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
        >
          <PlusIcon className="w-4 h-4" /> New cycle
        </button>
      </Can>
    </div>
  )
}

function CycleCard({
  cycle,
  onEdit,
  onDelete,
  onSetCurrent,
  onClose,
  onMigrate,
  settingCurrent,
}: {
  cycle: AdmissionCycle
  onEdit: () => void
  onDelete: () => void
  onSetCurrent: () => void
  onClose: () => void
  onMigrate: () => void
  settingCurrent: boolean
}) {
  return (
    <motion.div
      layout
      className={`bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow ${cycle.is_current ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-200'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">
            {cycle.name}
          </h3>
          <p className="text-xs text-slate-500">
            {formatDate(cycle.start_date)} — {formatDate(cycle.end_date)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {cycle.is_current && <StatusBadge status="current" />}
        {cycle.is_admissions_closed ? (
          <StatusBadge status="inactive" label="Admissions closed" />
        ) : (
          <StatusBadge status="active" label="Accepting" />
        )}
        {cycle.migration_completed_at && (
          <StatusBadge status="completed" label="Migrated" />
        )}
      </div>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        {!cycle.is_current && (
          <Can permission="change.admissioncycle">
            <button
              onClick={onSetCurrent}
              disabled={settingCurrent}
              className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 px-2 py-1 rounded hover:bg-orange-50 disabled:opacity-50"
            >
              {settingCurrent ? (
                <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <StarIcon className="w-3.5 h-3.5" />
              )}
              Set current
            </button>
          </Can>
        )}
        {!cycle.is_admissions_closed && (
          <Can permission="change_admissioncycle">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100"
            >
              <LockIcon className="w-3.5 h-3.5" /> Close
            </button>
          </Can>
        )}
        {cycle.is_admissions_closed && !cycle.migration_completed_at && (
          <Can permission="change_admissioncycle">
            <button
              onClick={onMigrate}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-50"
            >
              <UserCheckIcon className="w-3.5 h-3.5" /> Migrate
            </button>
          </Can>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Can permission="change_admissioncycle">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
              aria-label="Edit"
            >
              <PencilIcon className="w-3.5 h-3.5" />
            </button>
          </Can>
          <Can permission="delete_admissioncycle">
            <button
              onClick={onDelete}
              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
              aria-label="Delete"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </Can>
        </div>
      </div>
    </motion.div>
  )
}

function CycleFormModal({
  open,
  initial,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean
  initial: AdmissionCycle | null
  onClose: () => void
  onSubmit: (p: AdmissionCyclePayload) => Promise<void>
  submitting: boolean
}) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const onOpen = () => {
    if (initial) {
      setName(initial.name)
      setStartDate(initial.start_date.slice(0, 10))
      setEndDate(initial.end_date.slice(0, 10))
      setIsCurrent(initial.is_current)
    } else {
      setName('')
      setStartDate('')
      setEndDate('')
      setIsCurrent(false)
    }
    setErrors({})
  }

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) onOpen()
  }, [open, initial])

  return (
    <Modal
      open={open}
      title={initial ? 'Edit cycle' : 'New admission cycle'}
      onClose={onClose}
    >
      <CycleFormBody
        key={initial?.id ?? 'new'}
        initial={initial}
        submitting={submitting}
        onCancel={onClose}
        onSubmit={async (p) => await onSubmit(p)}
      />
    </Modal>
  )
}

function CycleFormBody({
  initial,
  submitting,
  onCancel,
  onSubmit,
}: {
  initial: AdmissionCycle | null
  submitting: boolean
  onCancel: () => void
  onSubmit: (p: AdmissionCyclePayload) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [startDate, setStartDate] = useState(
    initial ? initial.start_date.slice(0, 10) : '',
  )
  const [endDate, setEndDate] = useState(
    initial ? initial.end_date.slice(0, 10) : '',
  )
  const [isCurrent, setIsCurrent] = useState(initial?.is_current ?? false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!startDate) e.start = 'Start date is required'
    if (!endDate) e.end = 'End date is required'
    if (startDate && endDate && startDate > endDate)
      e.end = 'End date must be after start date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const payload: AdmissionCyclePayload = {
      name: name.trim(),
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      is_current: isCurrent,
    }
    await onSubmit(payload)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="2025/2026 Academic Year"
          className={inputCls}
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name}</p>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputCls}
          />
          {errors.start && (
            <p className="text-xs text-red-600 mt-1">{errors.start}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            End date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputCls}
          />
          {errors.end && (
            <p className="text-xs text-red-600 mt-1">{errors.end}</p>
          )}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
          className="rounded text-orange-500 focus:ring-orange-500"
        />
        Mark as current cycle
      </label>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
        >
          {submitting && <LoaderIcon className="w-4 h-4 animate-spin" />}
          {initial ? 'Save changes' : 'Create cycle'}
        </button>
      </div>
    </div>
  )
}

function CloseCycleModal({
  cycle,
  onClose,
}: {
  cycle: AdmissionCycle
  onClose: () => void
}) {
  const { data, isLoading, isError, error } = useClosureStatus(cycle.id)
  const closeMut = useCloseCycle()
  const canClose = !data?.is_admissions_closed

  const handleClose = async () => {
    try {
      await closeMut.mutateAsync(cycle.id)
      toast.success('Admissions closed for this cycle')
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to close cycle')
    }
  }

  return (
    <Modal
      open
      title="Close admissions"
      subtitle={cycle.name}
      onClose={onClose}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <LoaderIcon className="w-4 h-4 animate-spin mr-2" /> Checking
            status...
          </div>
        ) : isError ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Failed to load closure status.{' '}
            {(error as any)?.response?.data?.detail || ''}
          </div>
        ) : data ? (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">End date:</span>
                <span className="text-slate-800 font-medium">
                  {formatDate(data.end_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already closed:</span>
                <span
                  className={
                    data.is_admissions_closed
                      ? 'text-amber-700 font-medium'
                      : 'text-emerald-700 font-medium'
                  }
                >
                  {data.is_admissions_closed ? 'Yes' : 'No'}
                </span>
              </div>
              {data.admissions_closed_at && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Closed at:</span>
                  <span className="text-slate-800 font-medium">
                    {formatDate(data.admissions_closed_at, true)}
                  </span>
                </div>
              )}
            </div>
            {!canClose && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Admissions are already closed for this cycle.</span>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={closeMut.isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleClose}
            disabled={!canClose || closeMut.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
          >
            {closeMut.isPending && (
              <LoaderIcon className="w-4 h-4 animate-spin" />
            )}
            Close admissions
          </button>
        </div>
      </div>
    </Modal>
  )
}

function MigrateCycleModal({
  cycle,
  onClose,
}: {
  cycle: AdmissionCycle
  onClose: () => void
}) {
  const [started, setStarted] = useState(false)
  const startMut = useMigrateCycle()
  const { data: status } = useMigrationStatus(cycle.id, started)

  const handleStart = async () => {
    try {
      await startMut.mutateAsync(cycle.id)
      setStarted(true)
      toast.success('Migration started')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to start migration')
    }
  }

  const pct =
    status && status.total_approved > 0
      ? Math.round((status.migrated / status.total_approved) * 100)
      : 0

  return (
    <Modal
      open
      title="Migrate approved applicants"
      subtitle={cycle.name}
      onClose={onClose}
    >
      <div className="space-y-4">
        {!started ? (
          <>
            <p className="text-sm text-slate-600">
              This will move all approved applicants into the students records.
              The operation runs in the background and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                disabled={startMut.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
              >
                {startMut.isPending && (
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                )}
                Start migration
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium text-slate-800">{pct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  animate={{
                    width: `${pct}%`,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-slate-500">Total</div>
                <div className="font-semibold text-slate-900 text-base">
                  {status?.total_approved ?? '-'}
                </div>
              </div>
              <div className="p-2 bg-emerald-50 rounded">
                <div className="text-emerald-700">Migrated</div>
                <div className="font-semibold text-emerald-800 text-base">
                  {status?.migrated ?? 0}
                </div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <div className="text-red-700">Failed</div>
                <div className="font-semibold text-red-800 text-base">
                  {status?.failed ?? 0}
                </div>
              </div>
            </div>
            {status?.migration_completed ? (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <CheckCircle2Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Migration completed{' '}
                  {status.migration_completed_at &&
                    `at ${formatDate(status.migration_completed_at, true)}`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LoaderIcon className="w-4 h-4 animate-spin" />
                Migrating, this may take a few minutes...
              </div>
            )}
            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                {status?.migration_completed ? 'Done' : 'Close (keeps running)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}