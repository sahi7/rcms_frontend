// src/features/users/pages/UserDetailsPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useUserDetails, useRoleType } from '@/hooks/shared/useUsers'
import { useInstitutionConfig } from '@/hooks/shared/useInstitutionConfig'
import { cn } from '@/lib/utils'
import { MultiSelect } from '@/components/MultiSelect'

export function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    user,
    isLoadingUser,
    isTeacher,
    subjectsData,
  } = useUserDetails(id!)
  
  const roleType = useRoleType(user?.role)

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
          onClick={() => navigate('/dashboard/users')}
          className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Back to Users
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/users')}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4">
          {/* Profile Picture with graceful fallback */}
          <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex-shrink-0 border border-white shadow-sm">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={`${user.first_name} ${user.last_name}`}
                className="h-full w-full object-cover"
                // onError={(e) => {
                //   // Fallback to initials if image fails to load
                //   const target = e.currentTarget
                //   target.style.display = 'none'
                //   const fallback = target.parentElement?.querySelector('.initials-fallback')
                //   if (fallback) fallback.style.display = 'flex'
                // }}
              />
            ) : null}
            {/* Initials fallback (always rendered but hidden when image loads successfully) */}
            <div
              className="initials-fallback h-full w-full hidden items-center justify-center font-bold text-lg text-blue-600"
              style={{ display: user.profile_picture ? 'none' : 'flex' }}
            >
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {user.first_name} {user.last_name}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                {roleType ? roleType.replace('_', ' ') : 'Not set'}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user.email}{' '}
              {user.department?.name ? `• ${user.department.name}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Only Overview tab remains */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors',
              'border-orange-500 text-orange-600'
            )}
          >
            <User className="h-4 w-4" />
            Overview
          </button>
        </nav>
      </div>

      <OverviewTab user={user} isTeacher={isTeacher} subjectsData={subjectsData} />
    </div>
  )
}

function OverviewTab({ 
  user, 
  isTeacher, 
  subjectsData 
}: { 
  user: any
  isTeacher: boolean
  subjectsData: any 
}) {
  const { getLabel } = useInstitutionConfig()

  // Prepare options for MultiSelect (subject IDs → label)
  const subjectOptions = subjectsData?.data?.map((s: any) => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
  })) || []

  // Current taught subjects (array of IDs)
  const taughtSubjectIds = user.taught_subjects || []

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

      {/* Taught Subjects – now a single MultiSelect field (only for teachers) */}
      {isTeacher && (
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Taught Subjects</h2>
          </div>
          <div className="p-6">
            <MultiSelect
              options={subjectOptions}
              value={taughtSubjectIds}
              onChange={() => {}} // placeholder – will be wired to user update later
              placeholder={`Select ${getLabel('subjectLabel')}...`}
              disabled // read-only for now (saves with rest of user data via PUT)
            />
          </div>
        </div>
      )}
    </div>
  )
}