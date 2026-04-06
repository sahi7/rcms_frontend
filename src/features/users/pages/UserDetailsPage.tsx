// src/features/users/pages/UserDetailsPage.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  BookOpen,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import { useUserDetails } from '@/hooks/shared/useUsers'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { cn } from '@/lib/utils'
import { SearchableSelect } from '@/components/SearchableSelect'
import { MultiSelect } from '@/components/MultiSelect'


export function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'taught_subjects'>('overview')

  const {
    user,
    isLoadingUser,
    // taughtSubjectsData,
    // isLoading: isLoadingTaughtSubjects,
    // addTaughtSubject,
    // removeTaughtSubject,
    // subjectsData,
    // departmentsData,
    // classroomsData,
  } = useUserDetails(id!)

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">User Not Found</h2>
        <button
          onClick={() => navigate('/users')}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Back to Users
        </button>
      </div>
    )
  }

  const isTeacher = user.role === 'teacher' || user.role === 'hod' || user.role === 'dean'

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
            {user.first_name?.[0]}
            {user.last_name?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {user.first_name} {user.last_name}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                {user.role.replace('_', ' ')}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user.email}{' '}
              {user.department?.name ? `• ${user.department.name}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          {isTeacher && (
            <button
              onClick={() => setActiveTab('taught_subjects')}
              className={cn(
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors',
                activeTab === 'taught_subjects'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <BookOpen className="h-4 w-4" />
              Taught Subjects
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <OverviewTab user={user} />
      ) : (
        <TaughtSubjectsTab userId={id!} />
      )}
    </div>
  )
}

function OverviewTab({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Full Name</p>
            <p className="mt-1 text-sm text-gray-900">{user.first_name} {user.last_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="mt-1 text-sm text-gray-900">{user.phone_number || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Date of Birth</p>
            <p className="mt-1 text-sm text-gray-900">{user.date_of_birth || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Nationality</p>
            <p className="mt-1 text-sm text-gray-900">{user.nationality || '-'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Emergency Contact</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Contact Name</p>
            <p className="mt-1 text-sm text-gray-900">{user.emergency_guardian_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Contact Phone</p>
            <p className="mt-1 text-sm text-gray-900">{user.emergency_guardian_phone || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaughtSubjectsTab({ userId }: { userId: string }) {
  const { getLabel, getPlural } = useInstitutionConfig()
  const [subjectId, setSubjectId] = useState<string | number | null>(null)
  const [departmentId, setDepartmentId] = useState<string | number | null>(null)
  const [classroomIds, setClassroomIds] = useState<(string | number)[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    taughtSubjectsData,
    isLoading: isLoadingTaughtSubjects,
    addTaughtSubject,
    removeTaughtSubject,
    subjectsData,
    departmentsData,
    classroomsData,
  } = useUserDetails(userId)

  const handleAdd = async () => {
    if (!subjectId || !departmentId || classroomIds.length === 0) {
      setErrorMsg('Please select a subject, department, and at least one class.')
      return
    }
    setErrorMsg(null)
    try {
      await addTaughtSubject.mutateAsync({
        subject_id: Number(subjectId),
        department_id: Number(departmentId),
        classroom_ids: classroomIds.map(Number),
      })
      setSubjectId(null)
      setDepartmentId(null)
      setClassroomIds([])
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.error || 'Failed to add taught subject')
    }
  }

  const handleRemove = async (subject_id: number, department_id: number) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return
    try {
      await removeTaughtSubject.mutateAsync({ subject_id, department_id })
    } catch (error) {
      console.error('Failed to remove assignment', error)
    }
  }

  const subjectOptions = subjectsData?.data?.map((s: any) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  })) || []

  const deptOptions = departmentsData?.data?.map((d: any) => ({
    value: d.id,
    label: d.name,
  })) || []

  const classOptions = classroomsData?.data?.map((c: any) => ({
    value: c.id,
    label: c.name,
  })) || []

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Add New Assignment</h2>
        </div>
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-200">
              {errorMsg}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <SearchableSelect
                options={subjectOptions}
                value={subjectId}
                onChange={setSubjectId}
                placeholder="Select subject..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getLabel('departmentLabel')}
              </label>
              <SearchableSelect
                options={deptOptions}
                value={departmentId}
                onChange={setDepartmentId}
                placeholder={`Select ${getLabel('departmentLabel')}...`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getPlural('classLabel')}
              </label>
              <MultiSelect
                options={classOptions}
                value={classroomIds}
                onChange={setClassroomIds}
                placeholder={`Select ${getPlural('classLabel')}...`}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={addTaughtSubject.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {addTaughtSubject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Current Assignments</h2>
        </div>

        {isLoadingTaughtSubjects ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : !taughtSubjectsData?.data?.length ? (
          <div className="p-12 text-center text-gray-500">No subjects assigned yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {taughtSubjectsData.data.map((ts: any, idx: number) => (
              <li
                key={idx}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {ts.subject?.name || `Subject ${ts.subject_id}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {ts.department?.name || `Dept ${ts.department_id}`} • {ts.classroom_ids?.length || 0} Classes
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(ts.subject_id, ts.department_id)}
                  disabled={removeTaughtSubject.isPending}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}