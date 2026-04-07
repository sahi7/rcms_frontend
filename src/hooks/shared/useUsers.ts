// src/features/users/hooks/useUsers.ts
import { useState } from 'react'
import { useSearchQuery, useListQuery, useDeleteMutation, useCreateMutation, useDetailQuery } from './useApiQuery'
import { useDepartments } from '@/features/structure/hooks/useDepartments'
import { useClassRooms } from '@/features/structure/hooks/useClassRooms'
import { useSubjects } from '@/features/curriculum/hooks/useSubjects'
import { useRoles } from '@/features/users/hooks/useRoles'
import { User } from '@/types/shared'

// Reusable hook: takes ONLY the role ID and internally uses useRoles to check if it's a teacher
// Global reusable hook: pass a role ID → get role_type
export function useRoleType(roleId: number | string | null | undefined): string | null {
  const { data: rolesData } = useRoles()

  if (!roleId || !rolesData?.length) return null

  const role = rolesData.find((r: any) => String(r.id) === String(roleId))
  return role?.role_type || null
}

// Convenience hook built on top of useRoleType
export function useIsTeacher(roleId: number | string | null | undefined): boolean {
  const roleType = useRoleType(roleId)
  return roleType === 'teacher'
}

export function useUsers(params: Record<string, any> = {}) {
  // We can use useListQuery if we need a full list, but usually we just search
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

export function useUsersList(params: Record<string, any> = {}) {
  return useListQuery<User>(KEY, ENDPOINT, params)
}

export function useDeleteUser() {
  return useDeleteMutation(ENDPOINT, [KEY])
}

export function useUserForm() {
  const { data: departmentsData } = useDepartments()

  const { data: rolesData } = useRoles()

  const { data: subjectsData } = useSubjects()

  const createMutation = useCreateMutation<any, any>(
    '/auth/register/',
    [KEY]
  )

  return {
    departmentsData,
    rolesData,
    subjectsData,
    createMutation,
  }
}

export function useUserDetails(userId: string) {
  // User details
  const { data: user, isLoading: isLoadingUser } = useDetailQuery<User>(
    'user',
    `/users/`,
    userId
  )

  // Supporting data
  const { data: subjectsData } = useSubjects()
  const { data: departmentsData } = useDepartments()
  const { data: classroomsData } = useClassRooms()

  return {
    user,
    isLoadingUser,
    isTeacher: useIsTeacher(user?.role),   // ← now only passes the role (ID)
    subjectsData,
    departmentsData,
    classroomsData,
  }
}