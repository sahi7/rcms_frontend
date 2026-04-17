// Thin wrapper around the existing institution hooks so letterhead is
// a first-class concept even though it is persisted as a JSON field on
// the institution record itself.
import { useMemo } from 'react'
import { useInstitution, useUpdateInstitution } from './useInstitution'
import { EMPTY_LETTERHEAD, Letterhead } from '@/types/letterhead'

export function useLetterhead() {
  const { data, isLoading } = useInstitution()

  const letterhead: Letterhead = useMemo(() => {
    const raw = (data as any)?.letterhead
    if (!raw) return EMPTY_LETTERHEAD
    return {
      left_html: raw.left_html ?? '',
      center_html: raw.center_html ?? '',
      right_html: raw.right_html ?? '',
    }
  }, [data])

  return { letterhead, isLoading }
}

export function useUpdateLetterhead() {
  const updateInstitution = useUpdateInstitution()

  return {
    ...updateInstitution,
    mutateAsync: (letterhead: Letterhead) =>
      updateInstitution.mutateAsync({ letterhead } as any),
  }
}
