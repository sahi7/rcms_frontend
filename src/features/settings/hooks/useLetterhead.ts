// src/features/settings/hooks/useLetterhead.ts
//
// Reads and writes the letterhead. Now also passes through the optional
// per-column width fields (left_width / center_width / right_width) when they
// exist on the institution record. Safe defaults are applied otherwise.
//
// See the note at the top of LetterheadEditor.tsx about adding these fields
// to your Letterhead type for full type-safety.

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
      // Optional width fields — cast because Letterhead may not declare them yet.
      ...(typeof raw.left_width === 'number'
        ? { left_width: raw.left_width }
        : {}),
      ...(typeof raw.center_width === 'number'
        ? { center_width: raw.center_width }
        : {}),
      ...(typeof raw.right_width === 'number'
        ? { right_width: raw.right_width }
        : {}),
    } as Letterhead
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
