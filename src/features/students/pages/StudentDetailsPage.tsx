// src/features/students/pages/StudentDetailsPage.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  BookOpen,
  User,
  AlertCircle,
  Loader2,
  BarChart3,
} from 'lucide-react'
import { useDetailQuery } from '@/hooks/shared/useApiQuery'
import { Student } from '@/types/academic'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { StatusBadge } from '@/components/StatusBadge'
import { cn, formatDate } from '@/lib/utils'
import { MultiSelect } from '@/components/MultiSelect'
import { SearchableSelect } from '@/components/SearchableSelect'
import { useStudentElectives } from '../hooks/useStudentElectives'
import { toast } from 'sonner'
import { useClassRooms } from '../../structure/hooks/useClassRooms'
import { useDepartments } from '../../structure/hooks/useDepartments'
import { StudentReportPage } from '@/features/students/pages/StudentReportPage'

export function StudentDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'overview' | 'electives' | 'performance'>('overview')

  const { data: student, isLoading: isLoadingStudent } = useDetailQuery<Student>(
    'student',
    `/students/`,
    `${id}`
  )

  if (isLoadingStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Student Not Found</h2>
        <p className="text-gray-500 mt-2">
          The student you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/dashboard/students')}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Back to Students
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Profile picture with fallback to initials */}
          <div className="flex-shrink-0">
            {student.profile_picture ? (
              <img
                src={student.profile_picture}
                alt={`${student.first_name} ${student.last_name}`}
                className="h-16 w-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-3xl border border-gray-200 shadow-sm">
                {student.initials ||
                  `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {student.first_name} {student.last_name}
              <StatusBadge status={student.enrollment_status || 'active'} />
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {student.registration_number
                ? `Reg: ${student.registration_number}`
                : 'No Registration Number'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/dashboard/students/create?id=${student.id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors',
              activeTab === 'overview'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <User className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('electives')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors',
              activeTab === 'electives'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <BookOpen className="h-4 w-4" />
            Electives
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors',
              activeTab === 'performance'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Performance
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <OverviewTab student={student} />
      ) : activeTab === 'electives' ? (
        <StudentElectivesTab studentId={id!} student={student} />
      ) : (
        <StudentReportPage studentId={id!} />
      )}
    </div>
  )
}

function OverviewTab({ student }: { student: Student }) {
  const { getLabel } = useInstitutionConfig()
  const { data: classroomsData } = useClassRooms()
  const { data: departmentsData } = useDepartments()

  // Resolve class and department names instead of IDs
  const className = student.current_class
    ? classroomsData?.data?.find((c: any) => c.id === student.current_class)?.name ||
      `Class ${student.current_class}`
    : 'Not Assigned'

  const departmentName = student.department
    ? departmentsData?.data?.find((d: any) => d.id === student.department)?.name ||
      `Department ${student.department}`
    : 'Not Assigned'

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="mt-1 text-sm text-gray-900">{student.first_name} {student.last_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-sm text-gray-900">{student.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="mt-1 text-sm text-gray-900">{student.phone_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Date of Birth</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(student.date_of_birth)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Place of Birth</p>
              <p className="mt-1 text-sm text-gray-900">{student.place_of_birth || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nationality</p>
              <p className="mt-1 text-sm text-gray-900">{student.nationality || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Preferred Language</p>
              <p className="mt-1 text-sm text-gray-900">{student.preferred_language || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Emergency Contact</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Guardian Name</p>
              <p className="mt-1 text-sm text-gray-900">{student.emergency_guardian_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Relationship</p>
              <p className="mt-1 text-sm text-gray-900">{student.relationship_to_guardian || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Guardian Phone</p>
              <p className="mt-1 text-sm text-gray-900">{student.emergency_guardian_phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Guardian Email</p>
              <p className="mt-1 text-sm text-gray-900">{student.emergency_guardian_email || '-'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-500">Guardian Address</p>
              <p className="mt-1 text-sm text-gray-900">{student.emergency_guardian_address || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Academic Status</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">{getLabel('class_progression_name')}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{className}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{getLabel('departmentLabel')}</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{departmentName}</p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-500">Enrollment Date</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(student.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudentElectivesTab({ studentId, student }: { studentId: string; student: Student }) {
  const { getLabel, getPlural } = useInstitutionConfig()
  const [selectedElectiveIds, setSelectedElectiveIds] = useState<(string | number)[]>([])
  const [termId, setTermId] = useState<string | number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    electivesData,
    isLoadingElectives,
    curriculumSubjectsData,
    allSubjectsData,
    termsData,
    saveElectivesMutation,
  } = useStudentElectives(studentId, student.current_class, student.department)

  const availableElectives = curriculumSubjectsData?.data
    ?.filter((cs: any) => {
      const isElective = cs.subject_role === 2
      const matchesDepartment = cs.department === student.department
      const matchesClass = cs.class_room === student.current_class
      return isElective && (matchesDepartment && matchesClass)
    })
    .map((cs: any) => {
      const subjectDetail = allSubjectsData?.data?.find((s: any) => s.id === cs.subject)
      return {
        value: cs.subject,
        label: subjectDetail
          ? `${subjectDetail.name} (${subjectDetail.code})`
          : `Subject ${cs.subject}`,
      }
    }) || []

  const currentElectiveIds = electivesData?.subject_ids || []
  const currentElectiveSubjects = allSubjectsData?.data?.filter((s: any) =>
    currentElectiveIds.includes(s.id)
  ) || []

  const termOptions = termsData?.data?.map((t: any) => ({
    value: t.id,
    label: t.name,
  })) || []

  useEffect(() => {
    if (currentElectiveIds.length > 0) {
      setSelectedElectiveIds(currentElectiveIds)
    }
  }, [currentElectiveIds])

  const handleUpdateElectives = async () => {
    setErrorMsg(null)
    try {
      await saveElectivesMutation.mutateAsync({
        id: studentId,
        payload: {
          electives: selectedElectiveIds.map(Number),
          term: termId ? Number(termId) : null,
        }
      })
      toast.success('Electives updated successfully')
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.error || 'Failed to update electives')
    }
  }

  return (
    <div className="space-y-6">
      {/* Manage Electives - removed overflow-hidden so dropdowns are visible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Manage Electives</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose elective subjects available for this student (based on their class and department)
          </p>
        </div>
        <div className="p-6">
          {!termId && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Warning: No {getLabel('termLabel').toLowerCase()} selected. Electives will be automatically added to the current {getLabel('termLabel').toLowerCase()}.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {getLabel('termLabel')} (Optional)
              </label>
              <SearchableSelect
                options={termOptions}
                value={termId}
                onChange={setTermId}
                placeholder={`Select ${getLabel('termLabel')}...`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getPlural('subjectLabel')} (Electives)
              </label>
              <div className="min-h-[160px]">
                <MultiSelect
                  options={availableElectives}
                  value={selectedElectiveIds}
                  onChange={setSelectedElectiveIds}
                  placeholder={`Select ${getPlural('electiveLabel')?.toLowerCase() || 'electives'}...`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpdateElectives}
              disabled={saveElectivesMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
            >
              {saveElectivesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
              Update Electives
            </button>
          </div>
        </div>
      </div>

      {/* Current Electives Display - removed overflow-hidden */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Current Electives</h2>
        </div>

        {isLoadingElectives ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : currentElectiveSubjects.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No electives assigned yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {currentElectiveSubjects.map((subject: any) => (
              <li
                key={subject.id}
                className="p-4 sm:px-6 flex items-center gap-3 hover:bg-gray-50"
              >
                <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{subject.name}</p>
                  <p className="text-xs text-gray-500">{subject.code}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/*
 * NOTES ON HOW TO USE studentId IN StudentReportPage COMPONENT
 * (single student only - no multi-select support)
 *
 * In StudentReportPage.tsx you should consume the passed studentId like this:
 *
 * const { studentId } = props;   // or useParams if you prefer, but prop is preferred here
 *
 * Then use a controlled single-ID input (exactly as shown below) if you ever need
 * to let the user change the ID inside the report page:
 *
 * <div className="relative">
 *   <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 *   <input
 *     type="text"
 *     value={studentId}
 *     onChange={(e) => setStudentId(e.target.value)}
 *     placeholder="Enter student ID or registration number..."
 *     className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
 *   />
 * </div>
 *
 * This design ensures the component works with exactly ONE studentId at a time.
 */