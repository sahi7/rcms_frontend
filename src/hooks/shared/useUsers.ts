import { useState } from 'react'
import { useSearchQuery, useListQuery, useDeleteMutation, useCreateMutation, useDetailQuery } from './useApiQuery'
import { useDepartments } from '@/features/structure/hooks/useDepartments'
import { useClassRooms } from '@/features/structure/hooks/useClassRooms'
import { useTaughtSubjects, useAddTaughtSubject, useRemoveTaughtSubject } from '@/features/users/hooks/useTaughtSubjects'
import { User } from '@/types/shared'
import { Subject } from '@/types/academic'

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

  const { data: rolesData } = useListQuery<any>(
    'roles',
    '/roles/'
  )

  const { data: subjectsData } = useListQuery<Subject>(
    'subjects',
    '/subjects/'
  )

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
    `/users/${userId}/`,
    null
  )

  // Taught subjects (full data + mutations)
  const taughtSubjectsHook = useTaughtSubjects(userId)

  const addTaughtSubject = useAddTaughtSubject(userId)
  const removeTaughtSubject = useRemoveTaughtSubject(userId)

  // Supporting data
  const { data: subjectsData } = useListQuery<Subject>('subjects', '/subjects/')
  const { data: departmentsData } = useDepartments()
  const { data: classroomsData } = useClassRooms()

  return {
    user,
    isLoadingUser,
    taughtSubjectsData: taughtSubjectsHook.data,           // ← explicitly returned
    isLoading: taughtSubjectsHook.isLoading,               // taught subjects loading
    addTaughtSubject,
    removeTaughtSubject,
    subjectsData,
    departmentsData,
    classroomsData,
  }
}