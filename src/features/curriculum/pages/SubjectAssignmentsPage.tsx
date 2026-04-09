// src/features/students/pages/SubjectAssignments.tsx
import React, { useMemo, useState } from 'react'
import {
  PlusIcon,
  UserCheckIcon,
  BookOpenIcon,
  BuildingIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { DataTable } from '@/components/DataTable'
import { Modal } from '@/components/Modal'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { SearchableSelect } from '@/components/SearchableSelect'
import { MultiSelect } from '@/components/MultiSelect'
import {
  SubjectAssignment,
  SubjectAssignmentPayload,
} from '@/types/curriculum'
import {
  useSubjectAssignments,
  useCreateSubjectAssignment,
  useUpdateSubjectAssignment,
  useDeleteSubjectAssignment,
} from '../hooks/useSubjectAssignments'
import { useSubjects } from '../hooks/useSubjects'
import { useDepartments } from '../../structure/hooks/useDepartments'
import { useClassRooms } from '../../structure/hooks/useClassRooms'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { useTeachers, useRoleIdByType } from '@/hooks/shared/useUsers'
import { useRoles } from '@/features/users/hooks/useRoles';

export function SubjectAssignments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const { data, isLoading } = useSubjectAssignments({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
  })
  const createMutation = useCreateSubjectAssignment()
  const updateMutation = useUpdateSubjectAssignment()
  const deleteMutation = useDeleteSubjectAssignment()
  const { data: subjectsData } = useSubjects({
    page_size: 200,
  })
  const { data: departmentsData } = useDepartments({
    page_size: 200,
  })
  const { data: classroomsData } = useClassRooms({
    page_size: 200,
  })

  const { data: rolesData } = useRoles()

  // Fetch teachers only
  const teacherRoleId = useRoleIdByType('teacher')

  const { data: teachersData } = useTeachers(
    {
      page_size: 200,
      role: teacherRoleId,
    },
  )

  
  const teacherOptions = useMemo(() => {
    const allUsers = teachersData?.data || []
    const allRoles = rolesData?.data || []

    return allUsers
      .filter((user: any) => {
        const userRoleId = user.role
        const matchedRole = allRoles.find((r: any) => String(r.id) === String(userRoleId))
        return matchedRole?.role_type === 'teacher'
      })
      .map((t: any) => ({
        value: t.id,
        label: `${t.first_name} ${t.last_name}`,
      }))
  }, [teachersData, rolesData])

  const subjectMap = useMemo(() => {
    const map: Record<number, string> = {}
    subjectsData?.data.forEach((s) => {
      map[s.id] = s.name
    })
    return map
  }, [subjectsData])
  const departmentMap = useMemo(() => {
    const map: Record<number, string> = {}
    departmentsData?.data.forEach((d) => {
      map[d.id] = d.name
    })
    return map
  }, [departmentsData])
  const classroomMap = useMemo(() => {
    const map: Record<number, string> = {}
    classroomsData?.data.forEach((c) => {
      map[c.id] = c.name
    })
    return map
  }, [classroomsData])

  // Teacher name map for clean display in table
  const teacherMap = useMemo(() => {
    const map: Record<number, string> = {}
    const allUsers = teachersData?.data || []
    allUsers.forEach((t: any) => {
      map[t.id] = `${t.first_name} ${t.last_name}`
    })
    return map
  }, [teachersData])

  const subjectOptions = (subjectsData?.data || []).map((s) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  }))
  const departmentOptions = (departmentsData?.data || []).map((d) => ({
    value: d.id,
    label: d.name,
  }))
  const classroomOptions = (classroomsData?.data || []).map((c) => ({
    value: c.id,
    label: c.name,
  }))

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SubjectAssignment | null>(null)
  const [itemToDelete, setItemToDelete] = useState<SubjectAssignment | null>(
    null,
  )
  const { getLabel, getPlural } = useInstitutionConfig();
  const [formData, setFormData] = useState<SubjectAssignmentPayload>({
    subject: 0,
    department: null,
    class_rooms: [],
    teacher: 0,
  })
  const columns = [
    {
      header: `${getPlural('subject_naming')}`,
      accessor: (item: SubjectAssignment) => {
        const name = subjectMap[item.subject] || `#${item.subject}`
        return (
          <span
            className="font-medium truncate max-w-[220px] inline-block"
            title={name}
          >
            {name}
          </span>
        )
      },
    },
    {
      header: `${getPlural('instructor_title')}`,
      accessor: (item: SubjectAssignment) => {
        const name = teacherMap[item.teacher] || `Teacher #${item.teacher}`
        return (
          <span
            className="truncate max-w-[180px] inline-block"
            title={name}
          >
            {name}
          </span>
        )
      },
    },
    {
      header: 'Department',
      accessor: (item: SubjectAssignment) =>
        item.department
          ? departmentMap[item.department] || `#${item.department}`
          : '—',
    },
    {
      header: `${getPlural('class_progression_name')}`,
      accessor: (item: SubjectAssignment) => (
        <span className="text-slate-600">
          {item.class_rooms
            .map((id) => classroomMap[id] || `#${id}`)
            .join(', ') || '—'}
        </span>
      ),
    },
  ]
  const handleOpenModal = (item?: SubjectAssignment) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        subject: item.subject,
        department: item.department,
        class_rooms: item.class_rooms,
        teacher: item.teacher,
      })
    } else {
      setEditingItem(null)
      setFormData({
        subject: 0,
        department: null,
        class_rooms: [],
        teacher: 0,
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
        toast.success('Subject assignment updated successfully')
      } else {
        await createMutation.mutateAsync(formData)
        toast.success('Subject assignment created successfully')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error(`Failed to save ${getPlural('subject_naming')} assignment`, error)
      toast.error('Failed to save subject assignment')
    }
  }
  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        toast.success('Subject assignment deleted successfully')
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
      } catch (error) {
        console.error('Failed to delete', error)
        toast.error('Failed to delete subject assignment')
      }
    }
  }
  const summaryCards = [
    {
      title: 'Total Assignments',
      value: data?.pagination.total_count || 0,
      icon: BookOpenIcon,
      color: 'blue' as const,
    },
    {
      title: `${getPlural('instructor_title')} Assigned`,
      value: new Set(data?.data.map((d) => d.teacher) || []).size,
      icon: UserCheckIcon,
      color: 'emerald' as const,
    },
    {
      title: 'Departments Covered',
      value: new Set(data?.data.map((d) => d.department).filter(Boolean) || [])
        .size,
      icon: BuildingIcon,
      color: 'purple' as const,
    },
  ]
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {getLabel('subject_naming')} Assignments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Assign {getPlural('subject_naming')} to {getPlural('instructor_title')} across {getPlural('class_progression_name')}.
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
        title={
          editingItem ? 'Edit Subject Assignment' : 'New Subject Assignment'
        }
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <SearchableSelect
            label="Subject"
            required
            options={subjectOptions}
            value={formData.subject || null}
            onChange={(v) =>
              setFormData({
                ...formData,
                subject: (v as number) || 0,
              })
            }
            placeholder="Select subject..."
          />
          <SearchableSelect
            label="Teacher"
            required
            options={teacherOptions}
            value={formData.teacher || null}
            onChange={(v) =>
              setFormData({
                ...formData,
                teacher: (v as number) || 0,
              })
            }
            placeholder="Select teacher..."
          />
          <SearchableSelect
            label="Department"
            options={departmentOptions}
            value={formData.department}
            onChange={(v) =>
              setFormData({
                ...formData,
                department: v as number | null,
              })
            }
            placeholder="Select department (optional)..."
          />
          <MultiSelect
            label="Classrooms"
            required
            options={classroomOptions}
            value={formData.class_rooms}
            onChange={(v) =>
              setFormData({
                ...formData,
                class_rooms: v as number[],
              })
            }
            placeholder="Select classrooms..."
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
            Are you sure you want to remove this subject assignment? This action
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