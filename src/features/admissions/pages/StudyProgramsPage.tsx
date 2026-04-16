import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LoaderIcon,
  LayersIcon,
} from 'lucide-react'
import {
  useStudyProgramsList,
  useCreateStudyProgram,
  useUpdateStudyProgram,
  useDeleteStudyProgram,
  useBulkCreateStudyPrograms,
  useBulkDeleteStudyPrograms,
} from '../hooks/useStudyPrograms'
import { useStructureLookups } from '../hooks/useResolvers'
import { StudyProgram, StudyProgramPayload } from '@/types/admissions'
import { Can } from '@/hooks/shared/useHasPermission'
import { StatusBadge } from '@/components/StatusBadge'
import { SearchableSelect } from '@/components/SearchableSelect'
import { MultiSelect } from '@/components/MultiSelect'
import { Modal } from '@/components/AdModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'


export function StudyProgramsPage() {
  const { data, isLoading } = useStudyProgramsList()
  const lookups = useStructureLookups()
  const createMut = useCreateStudyProgram()
  const updateMut = useUpdateStudyProgram()
  const deleteMut = useDeleteStudyProgram()
  const bulkCreateMut = useBulkCreateStudyPrograms()
  const bulkDeleteMut = useBulkDeleteStudyPrograms()
  const [formOpen, setFormOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editing, setEditing] = useState<StudyProgram | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StudyProgram | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const toggleSelect = (id: number) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    )
  const handleSave = async (payload: StudyProgramPayload) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          payload,
        })
        toast.success('Study program updated')
      } else {
        await createMut.mutateAsync(payload)
        toast.success('Study program created')
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
  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMut.mutateAsync(selected)
      toast.success(`Deleted ${selected.length} programs`)
      setSelected([])
      setBulkDeleteOpen(false)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Bulk delete failed')
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
            Study programs
          </h1>
          <p className="text-sm text-slate-500">
            Programs applicants can apply to.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Can permission="admissions.manage_study_program">
            <button
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg"
            >
              <LayersIcon className="w-4 h-4" /> Bulk create
            </button>
          </Can>
          <Can permission="admissions.manage_study_program">
            <button
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
            >
              <PlusIcon className="w-4 h-4" /> New program
            </button>
          </Can>
        </div>
      </div>

      {selected.length > 0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: -4,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex items-center justify-between gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg"
        >
          <span className="text-sm font-medium text-orange-800">
            {selected.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected([])}
              className="text-sm text-slate-700 px-3 py-1.5 hover:bg-white rounded"
            >
              Clear
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded"
            >
              Delete selected
            </button>
          </div>
        </motion.div>
      )}

      {isLoading || lookups.isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <LoaderIcon className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : !data?.items.length ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-base font-semibold text-slate-800">
            No study programs yet
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Add programs applicants can apply to.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {data.items.map((p) => (
              <div key={p.id} className="p-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="mt-1 rounded text-orange-500 focus:ring-orange-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900">
                    {lookups.classRoomMap.get(p.class_room_id) ||
                      `Classroom #${p.class_room_id}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 space-x-2">
                    {p.faculty_id && (
                      <span>{lookups.facultyMap.get(p.faculty_id)}</span>
                    )}
                    {p.department_id && (
                      <span>
                        • {lookups.departmentMap.get(p.department_id)}
                      </span>
                    )}
                    {p.program_id && (
                      <span>• {lookups.programMap.get(p.program_id)}</span>
                    )}
                    {p.level_id && (
                      <span>• {lookups.levelMap.get(p.level_id)}</span>
                    )}
                  </div>
                  <div className="mt-2">
                    <StatusBadge status={p.is_active ? 'active' : 'inactive'} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Can permission="admissions.manage_study_program">
                    <button
                      onClick={() => {
                        setEditing(p)
                        setFormOpen(true)
                      }}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                      aria-label="Edit"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                  </Can>
                  <Can permission="admissions.manage_study_program">
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      aria-label="Delete"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </Can>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        data.items.length > 0 &&
                        selected.length === data.items.length
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? data.items.map((i) => i.id) : [],
                        )
                      }
                      className="rounded text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-4 py-3">Classroom</th>
                  <th className="px-4 py-3">Faculty</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {lookups.classRoomMap.get(p.class_room_id) ||
                        `#${p.class_room_id}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(p.faculty_id && lookups.facultyMap.get(p.faculty_id)) ||
                        '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(p.department_id &&
                        lookups.departmentMap.get(p.department_id)) ||
                        '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(p.program_id && lookups.programMap.get(p.program_id)) ||
                        '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(p.level_id && lookups.levelMap.get(p.level_id)) || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={p.is_active ? 'active' : 'inactive'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Can permission="admissions.manage_study_program">
                          <button
                            onClick={() => {
                              setEditing(p)
                              setFormOpen(true)
                            }}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                            aria-label="Edit"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                        <Can permission="admissions.manage_study_program">
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            aria-label="Delete"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={formOpen}
        title={editing ? 'Edit study program' : 'New study program'}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      >
        <StudyProgramForm
          key={editing?.id ?? 'new'}
          initial={editing}
          lookups={lookups}
          submitting={createMut.isPending || updateMut.isPending}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSubmit={handleSave}
        />
      </Modal>

      <BulkCreateModal
        open={bulkOpen}
        lookups={lookups}
        submitting={bulkCreateMut.isPending}
        onClose={() => setBulkOpen(false)}
        onSubmit={async (rows) => {
          try {
            await bulkCreateMut.mutateAsync(rows)
            toast.success(`Created ${rows.length} programs`)
            setBulkOpen(false)
          } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Bulk create failed')
          }
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete study program?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        variant="danger"
        title={`Delete ${selected.length} programs?`}
        message="This action cannot be undone."
        confirmLabel="Delete all"
        loading={bulkDeleteMut.isPending}
        onConfirm={handleBulkDelete}
        onClose={() => setBulkDeleteOpen(false)}
      />
    </motion.div>
  )
}
function StudyProgramForm({
  initial,
  lookups,
  submitting,
  onCancel,
  onSubmit,
}: {
  initial: StudyProgram | null
  lookups: ReturnType<typeof useStructureLookups>
  submitting: boolean
  onCancel: () => void
  onSubmit: (p: StudyProgramPayload) => Promise<void>
}) {
  const [classRoomId, setClassRoomId] = useState<number | null>(
    initial?.class_room_id ?? null,
  )
  const [facultyId, setFacultyId] = useState<number | null>(
    initial?.faculty_id ?? null,
  )
  const [departmentId, setDepartmentId] = useState<number | null>(
    initial?.department_id ?? null,
  )
  const [programId, setProgramId] = useState<number | null>(
    initial?.program_id ?? null,
  )
  const [levelId, setLevelId] = useState<number | null>(
    initial?.level_id ?? null,
  )
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [err, setErr] = useState('')
  const handleSubmit = () => {
    if (!classRoomId) {
      setErr('Classroom is required')
      return
    }
    const payload: StudyProgramPayload = {
      class_room_id: classRoomId as number,
      is_active: isActive,
    }
    if (facultyId) payload.faculty_id = facultyId
    if (departmentId) payload.department_id = departmentId
    if (programId) payload.program_id = programId
    if (levelId) payload.level_id = levelId
    onSubmit(payload)
  }
  return (
    <div className="space-y-4">
      <SearchableSelect
        label="Classroom"
        required
        options={lookups.classRooms.map((c: any) => ({
          value: c.id,
          label: c.name,
        }))}
        value={classRoomId}
        onChange={(v) => {
          setClassRoomId(v as number)
          setErr('')
        }}
        placeholder="Select classroom..."
      />
      {err && <p className="text-xs text-red-600 -mt-2">{err}</p>}

      <SearchableSelect
        label="Faculty"
        options={lookups.faculties.map((f: any) => ({
          value: f.id,
          label: f.name,
        }))}
        value={facultyId}
        onChange={(v) => setFacultyId(v as number | null)}
        placeholder="Select faculty... (optional)"
      />
      <SearchableSelect
        label="Department"
        options={lookups.departments.map((d: any) => ({
          value: d.id,
          label: d.name,
        }))}
        value={departmentId}
        onChange={(v) => setDepartmentId(v as number | null)}
        placeholder="Select department... (optional)"
      />
      <SearchableSelect
        label="Program"
        options={lookups.programs.map((p: any) => ({
          value: p.id,
          label: p.name,
        }))}
        value={programId}
        onChange={(v) => setProgramId(v as number | null)}
        placeholder="Select program... (optional)"
      />
      <SearchableSelect
        label="Study level"
        options={lookups.levels.map((l: any) => ({
          value: l.id,
          label: l.name,
        }))}
        value={levelId}
        onChange={(v) => setLevelId(v as number | null)}
        placeholder="Select level... (optional)"
      />
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded text-orange-500 focus:ring-orange-500"
        />
        Active
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
          {initial ? 'Save' : 'Create'}
        </button>
      </div>
    </div>
  )
}
function BulkCreateModal({
  open,
  lookups,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean
  lookups: ReturnType<typeof useStructureLookups>
  submitting: boolean
  onClose: () => void
  onSubmit: (rows: StudyProgramPayload[]) => Promise<void>
}) {
  const [classRoomIds, setClassRoomIds] = useState<(number | string)[]>([])
  const [facultyId, setFacultyId] = useState<number | null>(null)
  const [departmentId, setDepartmentId] = useState<number | null>(null)
  const [programId, setProgramId] = useState<number | null>(null)
  const [levelId, setLevelId] = useState<number | null>(null)
  const reset = () => {
    setClassRoomIds([])
    setFacultyId(null)
    setDepartmentId(null)
    setProgramId(null)
    setLevelId(null)
  }
  const handleSubmit = async () => {
    if (classRoomIds.length === 0) {
      toast.error('Select at least one classroom')
      return
    }
    const rows: StudyProgramPayload[] = classRoomIds.map((id) => {
      const row: StudyProgramPayload = {
        class_room_id: Number(id),
        is_active: true,
      }
      if (facultyId) row.faculty_id = facultyId
      if (departmentId) row.department_id = departmentId
      if (programId) row.program_id = programId
      if (levelId) row.level_id = levelId
      return row
    })
    await onSubmit(rows)
    reset()
  }
  return (
    <Modal
      open={open}
      title="Bulk create study programs"
      subtitle="Apply the same faculty / department / program / level to many classrooms"
      onClose={() => {
        onClose()
        reset()
      }}
      size="lg"
    >
      <div className="space-y-4">
        <MultiSelect
          label="Classrooms"
          required
          options={lookups.classRooms.map((c: any) => ({
            value: c.id,
            label: c.name,
          }))}
          value={classRoomIds}
          onChange={setClassRoomIds}
          placeholder="Select classrooms..."
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <SearchableSelect
            label="Faculty"
            options={lookups.faculties.map((f: any) => ({
              value: f.id,
              label: f.name,
            }))}
            value={facultyId}
            onChange={(v) => setFacultyId(v as number | null)}
            placeholder="Optional"
          />
          <SearchableSelect
            label="Department"
            options={lookups.departments.map((d: any) => ({
              value: d.id,
              label: d.name,
            }))}
            value={departmentId}
            onChange={(v) => setDepartmentId(v as number | null)}
            placeholder="Optional"
          />
          <SearchableSelect
            label="Program"
            options={lookups.programs.map((p: any) => ({
              value: p.id,
              label: p.name,
            }))}
            value={programId}
            onChange={(v) => setProgramId(v as number | null)}
            placeholder="Optional"
          />
          <SearchableSelect
            label="Level"
            options={lookups.levels.map((l: any) => ({
              value: l.id,
              label: l.name,
            }))}
            value={levelId}
            onChange={(v) => setLevelId(v as number | null)}
            placeholder="Optional"
          />
        </div>
        <div className="text-xs text-slate-500">
          {classRoomIds.length > 0 && (
            <span>
              Will create <strong>{classRoomIds.length}</strong> programs.
            </span>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onClose()
              reset()
            }}
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
            Create {classRoomIds.length || ''}
          </button>
        </div>
      </div>
    </Modal>
  )
}
