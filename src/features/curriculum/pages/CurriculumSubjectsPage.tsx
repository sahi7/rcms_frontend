// src/features/curriculum/pages/CurriculumSubjects.tsx
import React, { useMemo, useState } from 'react'
import {
  PlusIcon,
  BookMarkedIcon,
  LayersIcon,
  SparklesIcon,
} from 'lucide-react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { StatusBadge } from '@/components/StatusBadge'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { SearchableSelect } from '@/components/SearchableSelect'
import { MultiSelect } from '@/components/MultiSelect'
import {
  CurriculumSubjectPayload,
} from '@/types/curriculum'
import {
  useCurriculumSubjects,
  useCreateCurriculumSubject,
  useUpdateCurriculumSubject,
  useDeleteCurriculumSubject,
} from '../hooks/useCurriculumSubjects'
import { useSubjects } from '../hooks/useSubjects'
import { useDepartments } from '../../structure/hooks/useDepartments'
import { useClassRooms } from '../../structure/hooks/useClassRooms'
import { useTerms } from '@/features/academic/hooks/terms'
import { toast } from 'sonner'

// Local payload type that exactly matches the server (plural subjects + nullable term_number)
type CurriculumSubjectCreatePayload = {
  department: number | null
  class_room: number
  subjects: number[]
  subject_role: 1 | 2
  term_number: number | null
}

export function CurriculumSubjects() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterDepartment, setFilterDepartment] = useState<string>('')
  const [filterClassroom, setFilterClassroom] = useState<string>('')
  const pageSize = 20

  const { data, isLoading } = useCurriculumSubjects({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
    department: filterDepartment || undefined,
    class_room: filterClassroom || undefined,
  })

  const createMutation = useCreateCurriculumSubject()
  const updateMutation = useUpdateCurriculumSubject()
  const deleteMutation = useDeleteCurriculumSubject()

  // Lookup data
  const { data: subjectsData } = useSubjects({ page_size: 200 })
  const { data: departmentsData } = useDepartments({ page_size: 200 })
  const { data: classroomsData } = useClassRooms({ page_size: 200 })

  const { data: termsData } = useTerms()

  const subjectMap = useMemo(() => {
    const map: Record<number, string> = {}
    subjectsData?.data.forEach((s) => (map[s.id] = s.name))
    return map
  }, [subjectsData])

  const departmentMap = useMemo(() => {
    const map: Record<number, string> = {}
    departmentsData?.data.forEach((d) => (map[d.id] = d.name))
    return map
  }, [departmentsData])

  const classroomMap = useMemo(() => {
    const map: Record<number, string> = {}
    classroomsData?.data.forEach((c) => (map[c.id] = c.name))
    return map
  }, [classroomsData])

  const termOptions = useMemo(() => {
    return (termsData?.data || []).map((t) => ({
      value: t.term_number,
      label: t.name,
    }))
  }, [termsData])

  const departmentOptions = (departmentsData?.data || []).map((d) => ({
    value: d.id,
    label: d.name,
  }))

  const classroomOptions = (classroomsData?.data || []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const subjectOptions = (subjectsData?.data || []).map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }))

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  // NEW: Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form data for CREATE (multi-subject)
  const [formData, setFormData] = useState<CurriculumSubjectCreatePayload>({
    department: null,
    class_room: 0,
    subjects: [],
    subject_role: 1,
    term_number: null,
  })

  // Form data for EDIT (single subject)
  const [editFormData, setEditFormData] = useState({
    department: null,
    class_room: 0,
    subject: 0,
    subject_role: 1,
    term_number: null as number | null,
  })

  const columns = [
    {
      header: 'Department',
      accessor: (item: any) => (
        <span className="font-medium">
          {departmentMap[item.department] || `#General`}
        </span>
      ),
    },
    {
      header: 'Subject',
      accessor: (item: any) => (
        <span className="font-medium">
          {subjectMap[item.subject] || `#${item.subject}`}
        </span>
      ),
    },
    {
      header: 'Role',
      accessor: (item: any) => (
        <StatusBadge
          status={item.subject_role === 1 ? 'mandatory' : 'optional'}
          label={item.subject_role === 1 ? 'Core' : 'Elective'}
        />
      ),
    },
    {
      header: 'Classroom',
      accessor: (item: any) =>
        classroomMap[item.class_room] || `#${item.class_room}`,
    },
  ]

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(formData as CurriculumSubjectPayload)
      toast.success('Curriculum subject assigned successfully')
      setIsModalOpen(false)
    } catch (error: any) {
      console.error('Failed to save curriculum subject', error)
      const errorMsg = error.response?.data?.error || 'An unexpected error occurred'
      toast.error(errorMsg)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        payload: {
          department: editFormData.department,
          class_room: editFormData.class_room,
          subject: editFormData.subject,
          subject_role: editFormData.subject_role,
          term_number: editFormData.term_number,
        }
      } as any)
      toast.success('Curriculum subject updated successfully')
      setIsEditModalOpen(false)
    } catch (error: any) {
      console.error('Failed to update', error)
      const errorMsg = error.response?.data?.error || 'An unexpected error occurred'
      toast.error(errorMsg)
    }
  }

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        toast.success('Curriculum subject deleted successfully')
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
      } catch (error: any) {
        console.error('Failed to delete', error)
        const errorMsg = error.response?.data?.error || 'An unexpected error occurred'
        toast.error(errorMsg)
      }
    }
  }

  const coreCount = data?.data.filter((c: any) => c.subject_role === 1).length || 0
  const electiveCount = data?.data.filter((c: any) => c.subject_role === 2).length || 0

  const summaryCards = [
    {
      title: 'Total Assignments',
      value: data?.pagination.total_count || 0,
      icon: BookMarkedIcon,
      color: 'blue' as const,
    },
    {
      title: 'Core Subjects',
      value: coreCount,
      icon: LayersIcon,
      color: 'emerald' as const,
    },
    {
      title: 'Electives',
      value: electiveCount,
      icon: SparklesIcon,
      color: 'purple' as const,
    },
  ]

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Curriculum Subjects</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Assign subjects to departments and classrooms.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Department filter */}
          <select
            value={filterDepartment}
            onChange={(e) => {
              setFilterDepartment(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          >
            <option value="">All Departments</option>
            {departmentOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          {/* NEW: Classroom filter (mobile-friendly) */}
          <select
            value={filterClassroom}
            onChange={(e) => {
              setFilterClassroom(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          >
            <option value="">All Classrooms</option>
            {classroomOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFormData({
                department: null,
                class_room: 0,
                subjects: [],
                subject_role: 1,
                term_number: null,
              })
              setIsModalOpen(true)
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
          </button>
        </div>
      </div>

      <PageSummaryCards cards={summaryCards} />

      <div className="flex-1 min-h-0">
        {isLoading && !data ? (
          <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>
        ) : data ? (
          <DataTable
            data={data}
            columns={columns}
            onPageChange={setCurrentPage}
            onSearch={(term) => {
              setSearchTerm(term)
              setCurrentPage(1)
            }}
            searchTerm={searchTerm}
            onEdit={(item) => {
              setEditingItem(item)
              setEditFormData({
                department: item.department,
                class_room: item.class_room,
                subject: item.subject || 0,
                subject_role: item.subject_role,
                term_number: null,
              })
              setIsEditModalOpen(true)
            }}
            onDelete={(item) => {
              setItemToDelete(item)
              setIsDeleteModalOpen(true)
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">Failed to load data</div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Curriculum Subjects"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <SearchableSelect
            label="Department"
            options={departmentOptions}
            value={formData.department || null}
            onChange={(v) =>
              setFormData({ ...formData, department: v !== null && v !== undefined ? (v as number) : null })
            }
            placeholder="Select department... (optional)"
          />

          <SearchableSelect
            label="Classroom"
            required
            options={classroomOptions}
            value={formData.class_room || null}
            onChange={(v) =>
              setFormData({ ...formData, class_room: (v as number) || 0 })
            }
            placeholder="Select classroom..."
          />

          <MultiSelect
            label="Subjects"
            required
            options={subjectOptions}
            value={formData.subjects}
            onChange={(v) =>
              setFormData({ ...formData, subjects: v as number[] })
            }
            placeholder="Select subjects..."
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject Role
              </label>
              <select
                value={formData.subject_role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subject_role: parseInt(e.target.value) as 1 | 2,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value={1}>Core</option>
                <option value={2}>Elective</option>
              </select>
            </div>

            <div>
              <SearchableSelect
                label="Term"
                options={termOptions}
                value={formData.term_number ?? null}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    term_number: (v as number) ?? null,
                  })
                }
                placeholder="Select term... (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Curriculum Subject"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <SearchableSelect
            label="Department"
            options={departmentOptions}
            value={editFormData.department || null}
            onChange={(v) =>
              setEditFormData({ ...editFormData, department: v !== null && v !== undefined ? (v as number) : null })
            }
            placeholder="Select department... (optional)"
          />

          <SearchableSelect
            label="Classroom"
            required
            options={classroomOptions}
            value={editFormData.class_room || null}
            onChange={(v) =>
              setEditFormData({ ...editFormData, class_room: (v as number) || 0 })
            }
            placeholder="Select classroom..."
          />

          <SearchableSelect
            label="Subject"
            required
            options={subjectOptions}
            value={editFormData.subject || null}
            onChange={(v) =>
              setEditFormData({ ...editFormData, subject: (v as number) || 0 })
            }
            placeholder="Select subject..."
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject Role
              </label>
              <select
                value={editFormData.subject_role}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    subject_role: parseInt(e.target.value) as 1 | 2,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              >
                <option value={1}>Core</option>
                <option value={2}>Elective</option>
              </select>
            </div>

            <div>
              <SearchableSelect
                label="Term"
                options={termOptions}
                value={editFormData.term_number ?? null}
                onChange={(v) =>
                  setEditFormData({
                    ...editFormData,
                    term_number: (v as number) ?? null,
                  })
                }
                placeholder="Select term... (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to remove the assignment for{' '}
            <span className="font-semibold text-slate-800">
              {subjectMap[itemToDelete?.subject] || `#${itemToDelete?.subject}`}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}