import { useState } from 'react'
import { useSearchQuery } from './useApiQuery'
import { User } from '@/types/shared'

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
