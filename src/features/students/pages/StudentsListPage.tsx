// src/features/students/pages/StudentsListPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Upload,
  Trash2,
  Eye,
  Edit,
  Users,
  UserCheck,
  UserX,
  UserPlus,
} from 'lucide-react'
import { DataTable } from '@/components/DataTable'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { StatusBadge } from '@/components/StatusBadge'
import { SearchableSelect } from '@/components/SearchableSelect'
import {
  useStudentsList,
  useDeleteStudent,
} from '../hooks/useStudents'
import { Student } from '@/types/academic'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { Can } from '@/hooks/shared/useHasPermission'
import { useClassRooms } from '../../structure/hooks/useClassRooms'
import { useDepartments } from '../../structure/hooks/useDepartments'

export function StudentsList() {
  const navigate = useNavigate()
  const { getLabel } = useInstitutionConfig()

  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState<string | number | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState<string | number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: classroomsData } = useClassRooms()
  const { data: departmentsData } = useDepartments()

  const { data, isLoading } = useStudentsList({
    page,
    search: searchTerm || undefined,
    current_class: classFilter || undefined,
    department: departmentFilter || undefined,
    enrollment_status: statusFilter || undefined,
  })

  const deleteMutation = useDeleteStudent()

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete student', error)
      }
    }
  }

  const columns = [
    {
      header: 'Reg. Number',
      accessor: 'registration_number' as keyof Student,
    },
    {
      header: 'Name',
      accessor: (student: Student) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-medium text-xs">
            {student.initials ||
              `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {student.first_name} {student.last_name}
            </div>
            <div className="text-xs text-gray-500">
              {student.email || 'No email'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: getLabel('classLabel'),
      accessor: (student: Student) =>
        student.current_class ? `Class ${student.current_class}` : '-',
    },
    {
      header: getLabel('departmentLabel'),
      accessor: (student: Student) =>
        student.department ? `Dept ${student.department}` : '-',
    },
    {
      header: 'Status',
      accessor: (student: Student) => (
        <StatusBadge status={student.enrollment_status || 'active'} />
      ),
    },
    {
      header: 'Actions',
      accessor: (student: Student) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/students/${student.id}`)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <Can permission="edit_student">
            <button
              onClick={() => navigate(`/students/create?id=${student.id}`)}
              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          </Can>
          <Can permission="delete_student">
            <button
              onClick={() => handleDelete(student.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Can>
        </div>
      ),
    },
  ]

  const summaryCards = [
    {
      title: 'Total Students',
      value: data?.pagination?.total_count || 0,
      icon: Users,
      color: 'orange' as const,
    },
    { title: 'Active', value: '-', icon: UserCheck, color: 'emerald' as const },
    { title: 'Inactive/Suspended', value: '-', icon: UserX, color: 'rose' as const },
    { title: 'New This Term', value: '-', icon: UserPlus, color: 'blue' as const },
  ]

  const classOptions = classroomsData?.data?.map((c: any) => ({
    value: c.id,
    label: c.name,
  })) || []

  const deptOptions = departmentsData?.data?.map((d: any) => ({
    value: d.id,
    label: d.name,
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view all enrolled students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Can permission="add_student">
            <button
              onClick={() => navigate('/students/bulk-upload')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </button>
            <button
              onClick={() => navigate('/students/create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Student
            </button>
          </Can>
        </div>
      </div>

      <PageSummaryCards cards={summaryCards} />

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Filter by {getLabel('classLabel')}
          </label>
          <SearchableSelect
            options={[{ value: '', label: 'All Classes' }, ...classOptions]}
            value={classFilter || ''}
            onChange={(val) => setClassFilter(val === '' ? null : val)}
            placeholder={`Select ${getLabel('classLabel')}...`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Filter by {getLabel('departmentLabel')}
          </label>
          <SearchableSelect
            options={[{ value: '', label: 'All Departments' }, ...deptOptions]}
            value={departmentFilter || ''}
            onChange={(val) => setDepartmentFilter(val === '' ? null : val)}
            placeholder={`Select ${getLabel('departmentLabel')}...`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>
      </div>

      <DataTable<Student>
        data={data || { data: [], pagination: { current_page: 1, page_size: 20, total_pages: 1, total_count: 0, has_next: false, has_previous: false } }}
        columns={columns}
        isLoading={isLoading}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        onPageChange={setPage}
        onEdit={(student) => navigate(`/students/create?id=${student.id}`)}
        onDelete={handleDelete}
        actions={false}   // we use custom Actions column instead
      />
    </div>
  )
}