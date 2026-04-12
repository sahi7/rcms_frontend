// src/features/students/pages/StudentsList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { PageSummaryCards } from '@/components/PageSummaryCards';
import { StatusBadge } from '@/components/StatusBadge';
import { SearchableSelect } from '@/components/SearchableSelect';
import {
  useStudentsList,
  useDeleteStudent,
} from '../hooks/useStudents';
import { Student } from '@/types/academic';
import type { PaginatedResponse } from '@/types/academic';
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig';
import { Can } from '@/hooks/shared/useHasPermission';
import { useClassRooms } from '../../structure/hooks/useClassRooms';
import { useDepartments } from '../../structure/hooks/useDepartments';

/**
 * Empty fallback for paginated response when data is not yet loaded.
 */
const emptyPaginatedResponse: PaginatedResponse<Student> = {
  data: [],
  pagination: {
    current_page: 1,
    page_size: 20,
    total_pages: 1,
    total_count: 0,
    has_next: false,
    has_previous: false,
  },
  search: { term: '', has_results: false },
  filters: {},
};

/**
 * Main page component for listing and managing all students.
 * Supports filtering by class, department, and status with dynamic labeling.
 */
export function StudentsList() {
  const navigate = useNavigate();

  // Institution configuration for dynamic naming (e.g., Classroom → Form, Grade, etc.)
  const { getLabel, getPlural } = useInstitutionConfig();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string | number | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | number; name: string } | null>(null);

  // Fetch supporting data for filters
  const { data: classroomsData } = useClassRooms();
  const { data: departmentsData } = useDepartments();

  // Main students data with filters applied
  const { data, isLoading } = useStudentsList({
    page,
    search: searchTerm || undefined,
    current_class: classFilter || undefined,
    department: departmentFilter || undefined,
    enrollment_status: statusFilter || undefined,
  });

  const deleteMutation = useDeleteStudent();

  /**
   * Opens the delete confirmation for a specific student.
   */
  const handleDeleteClick = (student: Student) => {
    setDeleteConfirm({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
    });
  };

  /**
   * Executes the delete operation after user confirmation.
   */
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
    } catch (error) {
      console.error('Failed to delete student', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  /**
   * Table columns definition with dynamic class label and action buttons.
   */
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
      header: getLabel('class_progression_name'),
      accessor: (student: Student) => {
        if (!student.current_class) return '-';
        const classroom = classroomsData?.data?.find(
          (c: any) => c.id === student.current_class
        );
        return classroom ? classroom.name : `${getLabel('class_progression_name')} ${student.current_class}`;
      },
    },
    {
      header: 'Department',
      accessor: (student: Student) => {
        if (!student.department) return '-';
        const department = departmentsData?.data?.find(
          (d: any) => d.id === student.department
        );
        return department ? department.name : `Dept ${student.department}`;
      },
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
          {/* View Student Details */}
          <button
            onClick={() => navigate(`/dashboard/students/${student.id}`)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Edit Student - permission protected */}
          <Can permission="change_student">
            <button
              onClick={() => navigate(`/dashboard/students/create?id=${student.id}`)}
              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          </Can>

          {/* Delete Student - permission protected */}
          <Can permission="delete_student">
            <button
              onClick={() => handleDeleteClick(student)}
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
  ];

  /**
   * Summary cards shown at the top of the page.
   * Some values are placeholders (to be enhanced with real counts later).
   */
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
  ];

  const classOptions = classroomsData?.data?.map((c: any) => ({
    value: c.id,
    label: c.name,
  })) || [];

  const deptOptions = departmentsData?.data?.map((d: any) => ({
    value: d.id,
    label: d.name,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view all enrolled students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add & Bulk Upload - permission protected */}
          <Can permission="add_student">
            <button
              onClick={() => navigate('/dashboard/students/bulk-upload')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </button>
            <button
              onClick={() => navigate('/dashboard/students/create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Student
            </button>
          </Can>
        </div>
      </div>

      {/* Summary Cards */}
      <PageSummaryCards cards={summaryCards} />

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Filter by {getLabel('class_progression_name')}
          </label>
          <SearchableSelect
            options={[{ value: '', label: `All ${getPlural('class_progression_name')}` }, ...classOptions]}
            value={classFilter || ''}
            onChange={(val) => setClassFilter(val === '' ? null : val)}
            placeholder={`Select ${getLabel('class_progression_name')}...`}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Filter by Department
          </label>
          <SearchableSelect
            options={[{ value: '', label: 'All Departments' }, ...deptOptions]}
            value={departmentFilter || ''}
            onChange={(val) => setDepartmentFilter(val === '' ? null : val)}
            placeholder="Select Department..."
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

      {/* Main Students DataTable */}
      <DataTable<Student>
        data={data ?? emptyPaginatedResponse}
        columns={columns}
        loading={isLoading}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        onPageChange={setPage}
        onEdit={(student) => navigate(`/dashboard/students/create?id=${student.id}`)}
        onDelete={(student) => handleDeleteClick(student)}
        actions={false}
      />

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Delete Student</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-900">{deleteConfirm.name}</span>?
              </p>
              <p className="text-sm text-rose-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-4 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-4 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}