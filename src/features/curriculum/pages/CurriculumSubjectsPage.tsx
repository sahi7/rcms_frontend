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
  CurriculumSubject,
  CurriculumSubjectPayload, // still imported (only for the hook)
} from '@/types/curriculum'
import {
  useCurriculumSubjects,
  useCreateCurriculumSubject,
  useDeleteCurriculumSubject,
} from '../hooks/useCurriculumSubjects'
import { useSubjects } from '../hooks/useSubjects'
import { useDepartments } from '../../structure/hooks/useDepartments'
import { useClassRooms } from '../../structure/hooks/useClassRooms'

// Local payload type that exactly matches what the server expects (plural subjects + term_number)
type CurriculumSubjectCreatePayload = {
  department: number
  class_room: number
  subjects: number[]          // ← plural array (what the server wants)
  subject_role: 1 | 2
  term_number: number
}

export function CurriculumSubjects() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filterDepartment, setFilterDepartment] = useState<string>('')
  const pageSize = 20

  const { data, isLoading } = useCurriculumSubjects({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
    department: filterDepartment || undefined,
  })

  const createMutation = useCreateCurriculumSubject()
  const deleteMutation = useDeleteCurriculumSubject()

  // Lookup maps
  const { data: subjectsData } = useSubjects({ page_size: 200 })
  const { data: departmentsData } = useDepartments({ page_size: 200 })
  const { data: classroomsData } = useClassRooms({ page_size: 200 })

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
  const [itemToDelete, setItemToDelete] = useState<CurriculumSubject | null>(null)

  // Form data now matches server payload exactly
  const [formData, setFormData] = useState<CurriculumSubjectCreatePayload>({
    department: 0,
    class_room: 0,
    subjects: [],
    subject_role: 1,
    term_number: 1,
  })

  // Fixed columns – now correctly uses `subjects` (plural) to match the actual type + server response
  const columns = [
    {
      header: 'Department',
      accessor: (item: CurriculumSubject) => (
        <span className="font-medium">
          {departmentMap[item.department] || `#${item.department}`}
        </span>
      ),
    },
    {
      header: 'Subjects',
      accessor: (item: CurriculumSubject) => (
        <div className="flex flex-wrap gap-1">
          {item.subjects?.slice(0, 3).map((id: number) => (
            <span
              key={id}
              className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
            >
              {subjectMap[id] || `#${id}`}
            </span>
          ))}
          {item.subjects?.length > 3 && (
            <span className="text-xs text-slate-400">
              +{item.subjects.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (item: CurriculumSubject) => (
        <StatusBadge
          status={item.subject_role === 1 ? 'mandatory' : 'optional'}
          label={item.subject_role === 1 ? 'Core' : 'Elective'}
        />
      ),
    },
    {
      header: 'Classroom',
      accessor: (item: CurriculumSubject) =>
        classroomMap[item.class_room] || `#${item.class_room}`,
    },
  ]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Cast only for the mutation hook – no other files are touched
      await createMutation.mutateAsync(formData as CurriculumSubjectPayload)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save curriculum subject', error)
    }
  }

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
      } catch (error) {
        console.error('Failed to delete', error)
      }
    }
  }

  const coreCount = data?.data.filter((c) => c.subject_role === 1).length || 0
  const electiveCount = data?.data.filter((c) => c.subject_role === 2).length || 0

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
        <div className="flex items-center gap-3">
          <select
            value={filterDepartment}
            onChange={(e) => {
              setFilterDepartment(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
          >
            <option value="">All Departments</option>
            {departmentOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFormData({
                department: 0,
                class_room: 0,
                subjects: [],
                subject_role: 1,
                term_number: 1,
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
            onEdit={() => {}}
            onDelete={(item) => {
              setItemToDelete(item)
              setIsDeleteModalOpen(true)
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">Failed to load data</div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Curriculum Subjects"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <SearchableSelect
            label="Department"
            required
            options={departmentOptions}
            value={formData.department || null}
            onChange={(v) =>
              setFormData({ ...formData, department: (v as number) || 0 })
            }
            placeholder="Select department..."
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Term Number
              </label>
              <input
                required
                type="number"
                min="1"
                max="4"
                value={formData.term_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    term_number: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to remove this curriculum subject assignment? This action cannot be undone.
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