import React, { useMemo, useState } from 'react'
import { PlusIcon, UserCheckIcon, BookOpenIcon, SchoolIcon } from 'lucide-react'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { SearchableSelect } from '@/components/SearchableSelect'
import { MultiSelect } from '@/components/MultiSelect'
import {
  ClassAssignment,
  ClassAssignmentPayload,
} from '@/types/curriculum'
import {
  useClassAssignments,
  useCreateClassAssignment,
  useUpdateClassAssignment,
  useDeleteClassAssignment,
} from '../hooks/useClassAssignments'
import { useSubjects } from '../hooks/useSubjects'
import { useClassRooms } from '@/features/structure/hooks/useClassRooms'
import { useUserSearch } from '@/hooks/shared/useUsers'
import { useListQuery } from '@/hooks/shared/useApiQuery'
import { AcademicYear } from '@/types/academic';
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';


export function ClassAssignments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const { data, isLoading } = useClassAssignments({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
  })
  const createMutation = useCreateClassAssignment()
  const updateMutation = useUpdateClassAssignment()
  const deleteMutation = useDeleteClassAssignment()
  const { data: subjectsData } = useSubjects({
    page_size: 200,
  })
  const { data: classroomsData } = useClassRooms({
    page_size: 200,
  })
  const { data: academicYearsData } = useListQuery<AcademicYear>(
    'academic-years',
    '/academic-years/',
    {
      page_size: 50,
    },
  )
  const userSearch = useUserSearch()
  const subjectMap = useMemo(() => {
    const map: Record<number, string> = {}
    subjectsData?.data.forEach((s) => {
      map[s.id] = s.name
    })
    return map
  }, [subjectsData])
  const classroomMap = useMemo(() => {
    const map: Record<number, string> = {}
    classroomsData?.data.forEach((c) => {
      map[c.id] = c.name
    })
    return map
  }, [classroomsData])
  const subjectOptions = (subjectsData?.data || []).map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }))
  const classroomOptions = (classroomsData?.data || []).map((c) => ({
    value: c.id,
    label: c.name,
  }))
  const academicYearOptions = (academicYearsData?.data || []).map((ay) => ({
    value: ay.id,
    label: ay.name,
  }))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClassAssignment | null>(null)
  const [itemToDelete, setItemToDelete] = useState<ClassAssignment | null>(null)
  const [formData, setFormData] = useState<ClassAssignmentPayload>({
    subjects: [],
    class_room: 0,
    teacher: 0,
    academic_year: '',
  })
  const { getLabel, getPlural } = useInstitutionConfig();
  
  const columns = [
    {
      header: `${getPlural('class_progression_name')}`,
      accessor: (item: ClassAssignment) => (
        <span className="font-medium">
          {classroomMap[item.class_room] || `#${item.class_room}`}
        </span>
      ),
    },
    {
      header: 'Teacher',
      accessor: (item: ClassAssignment) => `Teacher #${item.teacher}`,
    },
    {
      header: 'Subjects',
      accessor: (item: ClassAssignment) => (
        <div className="flex flex-wrap gap-1">
          {item.subjects.slice(0, 3).map((id) => (
            <span
              key={id}
              className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
            >
              {subjectMap[id] || `#${id}`}
            </span>
          ))}
          {item.subjects.length > 3 && (
            <span className="text-xs text-slate-400">
              +{item.subjects.length - 3} more
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Academic Year',
      accessor: 'academic_year' as keyof ClassAssignment,
    },
  ]
  const handleOpenModal = (item?: ClassAssignment) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        subjects: item.subjects,
        class_room: item.class_room,
        teacher: item.teacher,
        academic_year: item.academic_year,
      })
    } else {
      setEditingItem(null)
      setFormData({
        subjects: [],
        class_room: 0,
        teacher: 0,
        academic_year: '',
      })
    }
    setIsModalOpen(true)
  }
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          payload: formData,
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error(`Failed to save ${getPlural('class_progression_name')} assignment`, error)
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
  const summaryCards = [
    {
      title: 'Total Assignments',
      value: data?.pagination.total_count || 0,
      icon: SchoolIcon,
      color: 'orange' as const,
    },
    {
      title: 'Teachers Assigned',
      value: new Set(data?.data.map((d) => d.teacher) || []).size,
      icon: UserCheckIcon,
      color: 'emerald' as const,
    },
    {
      title: 'Subjects Covered',
      value: new Set(data?.data.flatMap((d) => d.subjects) || []).size,
      icon: BookOpenIcon,
      color: 'blue' as const,
    },
  ]
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {getLabel('class_progression_name')} Assignments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Assign teachers and subjects to {getPlural('class_progression_name')}.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
        >
          <PlusIcon className="w-4 h-4" />
          Add New
        </button>
      </div>

      <PageSummaryCards cards={summaryCards} />

      <div className="flex-1 min-h-0">
        {isLoading && !data ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            Loading...
          </div>
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
            onEdit={handleOpenModal}
            onDelete={(item) => {
              setItemToDelete(item)
              setIsDeleteModalOpen(true)
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Failed to load data
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit ${getLabel('class_progression_name')} Assignment` : `New ${getLabel('class_progression_name')} Assignment`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <SearchableSelect
            label={getLabel('class_progression_name')}
            required
            options={classroomOptions}
            value={formData.class_room || null}
            onChange={(v) =>
              setFormData({
                ...formData,
                class_room: (v as number) || 0,
              })
            }
            placeholder={`Select ${getLabel('class_progression_name').toLowerCase()}...`}
          />
          <SearchableSelect
            label={getLabel('instructor_title')}
            required
            options={userSearch.options}
            value={formData.teacher || null}
            onChange={(v) =>
              setFormData({
                ...formData,
                teacher: (v as number) || 0,
              })
            }
            onSearch={userSearch.setSearch}
            isLoading={userSearch.isLoading}
            placeholder={`Search for ${getLabel('instructor_title').toLowerCase()}...`}
          />
          <MultiSelect
            label={getLabel('subject_naming')}
            required
            options={subjectOptions}
            value={formData.subjects}
            onChange={(v) =>
              setFormData({
                ...formData,
                subjects: v as number[],
              })
            }
            placeholder={`Select ${getLabel('subject_naming').toLowerCase()}...`}
          />
          <SearchableSelect
            label="Academic Year"
            required
            options={academicYearOptions}
            value={formData.academic_year || null}
            onChange={(v) =>
              setFormData({
                ...formData,
                academic_year: (v as string) || '',
              })
            }
            placeholder="Select academic year..."
          />
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
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : 'Save'}
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
            Are you sure you want to remove this {getPlural('class_progression_name')} assignment? This action
            cannot be undone.
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
