// src/features/students/pages/SubjectAssignments.tsx
import React, { useMemo, useState, useEffect } from 'react'
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
import { useRoles } from '@/features/users/hooks/useRoles'
import { Can } from '@/hooks/shared/useHasPermission'

/**
 * Subject Assignments Management Page
 *
 * Allows administrators to assign specific subjects to teachers and link them
 * to one or more classrooms (and optionally a department).
 *
 * Features:
 * - Live validation ensuring a teacher can only be assigned subjects they actually teach
 * - Dynamic column rendering with name mappings for clean display
 * - Summary cards showing total assignments, unique teachers, and departments covered
 * - Full CRUD support with permission checks
 */
export function SubjectAssignments() {
  // ========================
  // LOCAL STATE
  // ========================
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Modal & editing state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SubjectAssignment | null>(null)
  const [itemToDelete, setItemToDelete] = useState<SubjectAssignment | null>(null)

  // Form state for create / edit
  const [formData, setFormData] = useState<SubjectAssignmentPayload>({
    subject: 0,
    department: null,
    class_rooms: [],
    teacher: 0,
  })

  // Live validation error for teacher-subject mismatch
  const [subjectTeacherMismatchError, setSubjectTeacherMismatchError] = useState<string>('')

  // ========================
  // CONFIG & DATA FETCHING
  // ========================
  const { getLabel, getPlural } = useInstitutionConfig()

  // Main data for the table
  const { data, isLoading } = useSubjectAssignments({
    search: searchTerm,
    page: currentPage,
    page_size: pageSize,
  })

  // Mutations
  const createMutation = useCreateSubjectAssignment()
  const updateMutation = useUpdateSubjectAssignment()
  const deleteMutation = useDeleteSubjectAssignment()

  // Supporting data for dropdowns
  const { data: subjectsData } = useSubjects({ page_size: 200 })
  const { data: departmentsData } = useDepartments({ page_size: 200 })
  const { data: classroomsData } = useClassRooms({ page_size: 200 })

  // Teacher-specific data
  const { data: rolesData } = useRoles()
  const teacherRoleId = useRoleIdByType('teacher')
  const { data: teachersData } = useTeachers({
    page_size: 200,
    role: teacherRoleId,
  })

  // ========================
  // DERIVED OPTIONS & MAPS
  // ========================

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

  const teacherMap = useMemo(() => {
    const map: Record<number, string> = {}
    const allUsers = teachersData?.data || []
    allUsers.forEach((t: any) => {
      map[t.id] = `${t.first_name} ${t.last_name}`
    })
    return map
  }, [teachersData])

  const teacherTaughtSubjectsMap = useMemo(() => {
    const map: Record<number, number[]> = {}
    const allUsers = teachersData?.data || []
    allUsers.forEach((t: any) => {
      map[t.id] = Array.isArray(t.taught_subjects) ? t.taught_subjects.map(Number) : []
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

  // ========================
  // LIVE VALIDATION
  // ========================

  useEffect(() => {
    if (formData.teacher && formData.subject) {
      const taughtSubjects = teacherTaughtSubjectsMap[formData.teacher] || []
      if (!taughtSubjects.includes(formData.subject)) {
        setSubjectTeacherMismatchError(`Selected ${getLabel('subject_naming')} is not assigned to this teacher.`)
      } else {
        setSubjectTeacherMismatchError('')
      }
    } else {
      setSubjectTeacherMismatchError('')
    }
  }, [formData.teacher, formData.subject, teacherTaughtSubjectsMap])

  // ========================
  // TABLE COLUMNS
  // ========================
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
          : '#General',
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

  // ========================
  // HANDLERS
  // ========================

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
        toast.success(`${getLabel('subject_naming')} assignment updated successfully`)
      } else {
        await createMutation.mutateAsync(formData)
        toast.success(`${getLabel('subject_naming')} assignment created successfully`)
      }
      setIsModalOpen(false)
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || `Failed to save ${getPlural('subject_naming')} assignment`
      toast.error(errorMsg)
    }
  }

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete.id)
        toast.success(`${getLabel('subject_naming')} assignment deleted successfully`)
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
      } catch (error) {
        console.error('Failed to delete', error)
        toast.error(`Failed to delete ${getLabel('subject_naming')} assignment`)
      }
    }
  }

  // ========================
  // SUMMARY CARDS
  // ========================
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

  // ========================
  // RENDER
  // ========================
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">
            {getPlural('subject_naming')} Assignments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Assign {getPlural('subject_naming')} to {getPlural('instructor_title')} across {getPlural('class_progression_name')}.
          </p>
        </div>

        <Can permission="add.subjectassignment">
          <button
            onClick={() => handleOpenModal()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm shadow-orange-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            Add New
          </button>
        </Can>
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
          editingItem
            ? `Edit ${getLabel('subject_naming')} Assignment`
            : `New ${getLabel('subject_naming')} Assignment`
        }
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <SearchableSelect
            label={getLabel('subject_naming')}
            required
            options={subjectOptions}
            value={formData.subject || null}
            onChange={(v) =>
              setFormData({
                ...formData,
                subject: (v as number) || 0,
              })
            }
            placeholder={`Select ${getLabel('subject_naming').toLowerCase()}...`}
          />

          <SearchableSelect
            label={getPlural('instructor_title')}
            required
            options={teacherOptions}
            value={formData.teacher || null}
            onChange={(v) =>
              setFormData({
                ...formData,
                teacher: (v as number) || 0,
              })
            }
            placeholder={`Select ${getLabel('instructor_title').toLowerCase()}...`}
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
            label={getPlural('class_progression_name')}
            required
            options={classroomOptions}
            value={formData.class_rooms}
            onChange={(v) =>
              setFormData({
                ...formData,
                class_rooms: v as number[],
              })
            }
            placeholder={`Select ${getPlural('class_progression_name').toLowerCase()}...`}
          />

          {subjectTeacherMismatchError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="text-amber-500 text-base leading-none mt-px">⚠</span>
              <span>{subjectTeacherMismatchError}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <Can permission="change.subjectassignment">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm shadow-orange-500/20 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : 'Save'}
              </button>
            </Can>
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
            Are you sure you want to remove this {getLabel('subject_naming')} assignment? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <Can permission="delete.subjectassignment">
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </Can>
          </div>
        </div>
      </Modal>
    </div>
  )
}