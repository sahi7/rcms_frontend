// src/features/users/hooks/useUsers.ts
import { useState } from 'react'
import { useSearchQuery, useListQuery, useDeleteMutation, useCreateMutation, useDetailQuery, usePutMutation } from './useApiQuery'
import { useDepartments } from '@/features/structure/hooks/useDepartments'
import { useClassRooms } from '@/features/structure/hooks/useClassRooms'
import { useSubjects } from '@/features/curriculum/hooks/useSubjects'
import { useRoles } from '@/features/users/hooks/useRoles'
import { User } from '@/types/shared'

// Reusable hook: takes ONLY the role ID and internally uses useRoles to check if it's a teacher
// Right now this hook returns: { roleType, roleId }
// So if a caller only needs roleType: const { roleType } = useRoleType(user?.role)
// Usage: if (roleType === 'teacher') { *** }
export function useRoleType(
  roleId: number | string | null | undefined
): { roleType: string | null; roleId: number | string | null } {
  const { data: rolesData } = useRoles()

  if (!roleId || !rolesData?.data?.length) {
    return { roleType: null, roleId: roleId ?? null }
  }

  const role = rolesData.data.find(
    (r: any) => String(r.id) === String(roleId)
  )

  return {
    roleType: role?.role_type || null,
    roleId: role?.id ?? roleId ?? null,
  }
}

// Convenience hook built on top of useRoleType
// Caller: const isTeacher = useIsTeacher(user?.role)
// Usage: {isTeacher && <TeacherPanel />}
export function useIsTeacher(
  roleId: number | string | null | undefined
): boolean {
  const { roleType } = useRoleType(roleId)
  return roleType === 'teacher'
}

// Return the RoleId of a given role_type
export function useRoleIdByType(
  roleType: string | null | undefined
): number | null {
  const { data: rolesData } = useRoles()

  if (!roleType || !rolesData?.data?.length) return null

  const role = rolesData.data.find(
    (r: any) => r.role_type === roleType
  )

  return role?.id ?? null
}


export function useUsers(params: Record<string, any> = {}) {
  return useSearchQuery<User>('users', '/users/', params.search || '')
}

export function useUserSearch(initialSearch: string = '') {
  const [search, setSearch] = useState(initialSearch)
  const { data, isLoading } = useSearchQuery<User>(
    'users',
    '/users/',
    search,
    search.length > 0,
  )

  const options =
    data?.data.map((user) => ({
      value: user.id,
      label:
        `${user.first_name} ${user.last_name} ${user.username ? `(@${user.username})` : ''}`.trim(),
    })) || []

  return {
    search,
    setSearch,
    options,
    isLoading,
  }
}

const KEY = 'users'
const ENDPOINT = '/users/'
const CREATE_ENDPOINT = '/auth/register/'

export function useUsersList(params: Record<string, any> = {}) {
  return useListQuery<User>(KEY, ENDPOINT, params)
}

export function useTeachers(params: Record<string, any> = {}) {
  return useListQuery<User>(KEY, ENDPOINT, params)
}

export function useDeleteUser() {
  return useDeleteMutation(ENDPOINT, [KEY])
}

// MODIFIED: Now supports full editing mode (exactly like useStudentForm)
export function useUserForm(userId?: string) {
  const isEditing = !!userId

  // Fetch existing user when editing
  const { data: existingUser, isLoading: isLoadingUser } = useDetailQuery<User>(
    'user',
    `/users/`,
    userId || ''
  )

  const { data: departmentsData } = useDepartments()
  const { data: rolesData } = useRoles()
  const { data: subjectsData } = useSubjects()

  const createMutation = useCreateMutation<any, any>(
    CREATE_ENDPOINT,
    [KEY]
  )

  const updateMutation = usePutMutation<any, any>(
    ENDPOINT,
    userId ? ([KEY,['user', userId]] as unknown as string[]) : [KEY] // Type Assertion to treat the mixed array as string[].
    // Normally we would send [['user', userId], KEY] but it gives a type error
  )

  return {
    existingUser,
    isLoadingUser,
    createMutation,
    updateMutation,
    isEditing,
    departmentsData,
    rolesData,
    subjectsData,
  }
}

export function useUserDetails(userId: string) {
  const { data: user, isLoading: isLoadingUser } = useDetailQuery<User>(
    'user',
    `/users/`,
    userId
  )

  const { data: subjectsData } = useSubjects()
  const { data: departmentsData } = useDepartments()
  const { data: classroomsData } = useClassRooms()

  return {
    user,
    isLoadingUser,
    isTeacher: useIsTeacher(user?.role),
    subjectsData,
    departmentsData,
    classroomsData,
  }
}