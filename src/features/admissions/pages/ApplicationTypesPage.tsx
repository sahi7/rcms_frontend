import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon, LoaderIcon } from 'lucide-react'
import {
  useApplicationTypesList,
  useCreateApplicationType,
  useUpdateApplicationType,
  useDeleteApplicationType,
} from '../hooks/useApplicationTypes'
import { ApplicationType, ApplicationTypePayload } from '@/types/admissions'
import { Can } from '@/hooks/shared/useHasPermission'
import { Modal } from '@/components/AdModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'
const inputCls =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'


  export function ApplicationTypesPage() {
  const { data, isLoading } = useApplicationTypesList()
  const createMut = useCreateApplicationType()
  const updateMut = useUpdateApplicationType()
  const deleteMut = useDeleteApplicationType()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ApplicationType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApplicationType | null>(null)
  const handleSave = async (payload: ApplicationTypePayload) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          payload,
        })
        toast.success('Application type updated')
      } else {
        await createMut.mutateAsync(payload)
        toast.success('Application type created')
      }
      setFormOpen(false)
      setEditing(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to save')
    }
  }
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMut.mutateAsync(deleteTarget.id)
      toast.success('Deleted')
      setDeleteTarget(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to delete')
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
            Application types
          </h1>
          <p className="text-sm text-slate-500">
            Categories of applications you accept.
          </p>
        </div>
        <Can permission="admissions.manage_application_type">
          <button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
          >
            <PlusIcon className="w-4 h-4" /> New type
          </button>
        </Can>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <LoaderIcon className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : !data?.items.length ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-base font-semibold text-slate-800">
            No application types yet
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Create your first type (e.g. "Transfer Student").
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.items.map((t) => (
            <motion.div
              key={t.id}
              layout
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {t.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                    {t.description || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Can permission="admissions.manage_application_type">
                    <button
                      onClick={() => {
                        setEditing(t)
                        setFormOpen(true)
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                      aria-label="Edit"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                  </Can>
                  <Can permission="admissions.manage_application_type">
                    <button
                      onClick={() => setDeleteTarget(t)}
                      className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                      aria-label="Delete"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </Can>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        title={editing ? 'Edit application type' : 'New application type'}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      >
        <AppTypeForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={createMut.isPending || updateMut.isPending}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSubmit={handleSave}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete application type?"
        message={
          <>
            This will delete <strong>{deleteTarget?.name}</strong>. Applications
            associated with this type may be affected.
          </>
        }
        confirmLabel="Delete"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </motion.div>
  )
}
function AppTypeForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: ApplicationType | null
  submitting: boolean
  onSubmit: (p: ApplicationTypePayload) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [err, setErr] = useState('')
  const handleSubmit = () => {
    if (!name.trim()) {
      setErr('Name is required')
      return
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
    })
  }
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setErr('')
          }}
          placeholder="Transfer Student"
          className={inputCls}
        />
        {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="From another institution"
          className={inputCls}
        />
      </div>
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
          {initial ? 'Save changes' : 'Create'}
        </button>
      </div>
    </div>
  )
}
