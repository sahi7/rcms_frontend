import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  EyeIcon,
  GripVerticalIcon,
} from 'lucide-react'
import {
  useFormFieldsGrouped,
  useCreateFormField,
  useUpdateFormField,
  useDeleteFormField,
} from '../hooks/useFormFields'
import { useApplicationTypesList } from '../hooks/useApplicationTypes'
import { FormField, FormFieldPayload } from '@/types/admissions'
import { Can } from '@/hooks/shared/useHasPermission'
import { FieldBuilderModal } from '@/components/FieldBuilderModal'
import { FieldRenderer } from '@/components/FieldRenderer'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Modal } from '@/components/AdModal'
import { toast } from 'sonner'


export function FormFieldsPage() {
  const types = useApplicationTypesList()
  const grouped = useFormFieldsGrouped()
  const createMut = useCreateFormField()
  const updateMut = useUpdateFormField()
  const deleteMut = useDeleteFormField()
  const [activeTypeId, setActiveTypeId] = useState<string | null>(null)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editing, setEditing] = useState<FormField | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FormField | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({})
  const items = types.data?.items ?? []
  const current = items.find((t) => t.id === activeTypeId) || items[0] || null
  const currentId = current?.id ?? null
  const fields = useMemo(() => {
    if (!currentId || !grouped.data) return []
    return [...(grouped.data[currentId] ?? [])].sort(
      (a, b) => a.order - b.order,
    )
  }, [grouped.data, currentId])
  const nextOrder =
    fields.length > 0 ? Math.max(...fields.map((f) => f.order)) + 10 : 10
  const handleSave = async (payload: FormFieldPayload) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          payload,
        })
        toast.success('Field updated')
      } else {
        await createMut.mutateAsync(payload)
        toast.success('Field added')
      }
      setBuilderOpen(false)
      setEditing(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Failed to save field')
    }
  }
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMut.mutateAsync(deleteTarget.id)
      toast.success('Field removed')
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
            Form fields
          </h1>
          <p className="text-sm text-slate-500">
            Extra questions applicants fill in, per application type.
          </p>
        </div>
        <div className="flex gap-2">
          {currentId && (
            <button
              onClick={() => {
                setPreviewValues({})
                setPreviewOpen(true)
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg"
            >
              <EyeIcon className="w-4 h-4" /> Preview
            </button>
          )}
          {currentId && (
            <Can permission="add_formfield">
              <button
                onClick={() => {
                  setEditing(null)
                  setBuilderOpen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
              >
                <PlusIcon className="w-4 h-4" /> Add field
              </button>
            </Can>
          )}
        </div>
      </div>

      {types.isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <LoaderIcon className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-base font-semibold text-slate-800">
            Create an application type first
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Form fields are organized per application type.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
            {items.map((t) => {
              const active = (currentId ?? items[0]?.id) === t.id
              const count = grouped.data?.[t.id]?.length ?? 0
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTypeId(t.id)}
                  className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}
                >
                  {t.name}
                  <span
                    className={`ml-2 text-xs px-1.5 py-0.5 rounded ${active ? 'bg-white text-orange-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {grouped.isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <LoaderIcon className="w-5 h-5 animate-spin mr-2" /> Loading
              fields...
            </div>
          ) : fields.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
              <h3 className="text-base font-semibold text-slate-800">
                No custom fields yet
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Add fields to collect extra information for this application
                type.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {fields.map((f) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 4,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -4,
                    }}
                    className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                  >
                    <GripVerticalIcon className="w-4 h-4 text-slate-300 shrink-0 hidden sm:block" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900 truncate">
                          {f.label}
                        </span>
                        {f.is_required && (
                          <span className="text-xs text-red-600">required</span>
                        )}
                        <span className="text-xs text-slate-400 font-mono">
                          {f.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                          {f.field_type}
                        </span>
                        <span className="text-xs text-slate-500">
                          order {f.order}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Can permission="change_formfield">
                        <button
                          onClick={() => {
                            setEditing(f)
                            setBuilderOpen(true)
                          }}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                          aria-label="Edit"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                      </Can>
                      <Can permission="delete_formfield">
                        <button
                          onClick={() => setDeleteTarget(f)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          aria-label="Delete"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </Can>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {currentId && (
        <FieldBuilderModal
          open={builderOpen}
          applicationTypeId={currentId}
          initial={editing ?? undefined}
          nextOrder={nextOrder}
          onClose={() => {
            setBuilderOpen(false)
            setEditing(null)
          }}
          onSubmit={handleSave}
          submitting={createMut.isPending || updateMut.isPending}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete field?"
        message={
          <>
            Remove <strong>{deleteTarget?.label}</strong> from this form?
          </>
        }
        confirmLabel="Delete"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <Modal
        open={previewOpen}
        title="Form preview"
        subtitle={current?.name}
        onClose={() => setPreviewOpen(false)}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500">No fields to preview.</p>
          ) : (
            fields.map((f) => (
              <FieldRenderer
                key={f.id}
                field={f}
                value={previewValues[f.name]}
                onChange={(v) =>
                  setPreviewValues((p) => ({
                    ...p,
                    [f.name]: v,
                  }))
                }
              />
            ))
          )}
        </div>
      </Modal>
    </motion.div>
  )
}
