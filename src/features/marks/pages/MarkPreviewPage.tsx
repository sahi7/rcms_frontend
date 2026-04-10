import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  Fragment,
} from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  SaveIcon,
  Loader2Icon,
  SearchIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  UndoIcon,
  TableIcon,
} from 'lucide-react'
import { useMarkPreview, useUpdateMarks } from '@/features/marks/hooks/useMarks'
import { Modal } from '@/components/Modal'
import type { MarkChange, MarkPreviewSequenceMark } from '@/types/marks'

interface CellEdit {
  score?: number | null
  comment?: string
}

export function MarkPreviewPage() {
  const { groupKey } = useParams<{
    groupKey: string
  }>()
  const [searchParams] = useSearchParams()
  const termId = searchParams.get('term_id') || ''
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [edits, setEdits] = useState<Map<string | number, CellEdit>>(new Map())
  const [saveModal, setSaveModal] = useState<'success' | 'error' | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMarkPreview({
      group_key: groupKey || '',
      term_id: termId,
      search: debouncedSearch,
      enabled: !!groupKey && !!termId,
    })

  const updateMutation = useUpdateMarks()

  // Flatten pages
  const allRows = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((p) => p.data)
  }, [data])

  const sequences = useMemo(() => {
    if (!data?.pages?.[0]) return []
    return data.pages[0].sequences
  }, [data])

  // Improved infinite scroll with better threshold and safeguards
  const handleInfiniteScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return

    const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    console.log('Scroll check →', {
      scrollBottom,
      hasNextPage,
      isFetchingNextPage,
      isNearBottom: scrollBottom < 300,
    })

    if (scrollBottom < 300) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    el.addEventListener('scroll', handleInfiniteScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleInfiniteScroll)
  }, [handleInfiniteScroll])

  // Edit helpers
  const getEditKey = (markId: string | number) => markId

  const hasEdits = edits.size > 0

  const updateEdit = useCallback(
    (markId: string | number, field: 'score' | 'comment', value: any) => {
      setEdits((prev) => {
        const next = new Map(prev)
        const existing = next.get(getEditKey(markId)) || {}
        next.set(getEditKey(markId), {
          ...existing,
          [field]: value,
        })
        return next
      })
    },
    [],
  )

  const getCellValue = (
    mark: MarkPreviewSequenceMark,
    field: 'score' | 'comment',
  ) => {
    const edit = edits.get(getEditKey(mark.mark_id))
    if (edit && field in edit) return edit[field]
    return mark[field]
  }

  const discardEdits = () => setEdits(new Map())

  const handleSave = async () => {
    if (!hasEdits) return
    const changes: MarkChange[] = []
    edits.forEach((edit, markId) => {
      const change: MarkChange = {
        mark_id: markId,
      }
      if ('score' in edit) change.score = edit.score
      if ('comment' in edit) change.comment = edit.comment ?? ''
      changes.push(change)
    })

    try {
      await updateMutation.mutateAsync({
        changes,
      })
      setEdits(new Map())
      setSaveModal('success')
    } catch {
      setSaveModal('error')
    }
  }

  if (!groupKey || !termId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <TableIcon className="w-12 h-12 text-slate-300 mb-3" />
        <p className="font-medium">No marks to preview</p>
        <p className="text-sm mt-1">
          Upload marks first, then navigate here from the success dialog.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Marks Preview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Group: <span className="font-mono text-slate-600">{groupKey}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasEdits && (
            <motion.button
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              onClick={discardEdits}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <UndoIcon className="w-4 h-4" />
              Discard ({edits.size})
            </motion.button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasEdits || updateMutation.isPending}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <SaveIcon className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-72">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by registration number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
        />
      </div>

      {/* Excel-like table */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2Icon className="w-7 h-7 animate-spin text-orange-500" />
            <span className="ml-3 text-slate-500">Loading marks...</span>
          </div>
        ) : allRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <TableIcon className="w-10 h-10 mb-2" />
            <p className="text-sm">No marks found</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-800 text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-700 sticky left-0 bg-slate-800 z-20">
                  Reg. Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-slate-700">
                  Subject
                </th>

                {/* Sequences with per-sequence Grade column */}
                {sequences.map((seq) => (
                  <th
                    key={seq.id}
                    className="text-center text-xs font-semibold uppercase tracking-wider border-r border-slate-700"
                    colSpan={3}
                  >
                    <div className="px-4 py-3">{seq.code}</div>
                    <div className="flex border-t border-slate-700">
                      <span className="flex-1 px-2 py-1.5 text-[10px] font-medium text-slate-300">
                        Score
                      </span>
                      <span className="flex-1 px-2 py-1.5 text-[10px] font-medium text-slate-300 border-l border-slate-700">
                        Comment
                      </span>
                      <span className="flex-1 px-2 py-1.5 text-[10px] font-medium text-slate-300 border-l border-slate-700">
                        Grade
                      </span>
                    </div>
                  </th>
                ))}

                {/* No separate Grade column anymore */}
              </tr>
            </thead>
            <tbody>
              {allRows.map((row, ri) => (
                <tr
                  key={`${row.registration_number}-${row.subject_code}-${ri}`}
                  className={`border-b border-slate-100 ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-orange-50/30 transition-colors`}
                >
                  <td className="px-4 py-2.5 font-mono text-xs font-medium text-slate-700 border-r border-slate-100 sticky left-0 bg-inherit z-10">
                    {row.registration_number}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 border-r border-slate-100">
                    {row.subject_code}
                  </td>

                  {sequences.map((seq) => {
                    const mark = row.sequences.find(
                      (m) => m.sequence_id === seq.id,
                    )
                    if (!mark) {
                      return (
                        <Fragment key={seq.id}>
                          <td className="px-2 py-1 border-r border-slate-100 text-center text-slate-300">
                            —
                          </td>
                          <td className="px-2 py-1 border-r border-slate-100 text-center text-slate-300">
                            —
                          </td>
                          <td className="px-2 py-1 border-r border-slate-100 text-center text-slate-300">
                            —
                          </td>
                        </Fragment>
                      )
                    }

                    const scoreVal = getCellValue(mark, 'score')
                    const commentVal = getCellValue(mark, 'comment')
                    const isScoreEdited =
                      edits.has(getEditKey(mark.mark_id)) &&
                      'score' in (edits.get(getEditKey(mark.mark_id)) || {})
                    const isCommentEdited =
                      edits.has(getEditKey(mark.mark_id)) &&
                      'comment' in (edits.get(getEditKey(mark.mark_id)) || {})

                    return (
                      <Fragment key={seq.id}>
                        {/* Score */}
                        <td
                          className={`px-1 py-1 border-r border-slate-100 ${isScoreEdited ? 'bg-amber-50' : ''}`}
                        >
                          <input
                            type="number"
                            step="0.1"
                            value={scoreVal ?? ''}
                            onChange={(e) => {
                              const v =
                                e.target.value === ''
                                  ? null
                                  : parseFloat(e.target.value)
                              updateEdit(mark.mark_id, 'score', v)
                            }}
                            className="w-full px-2 py-1 text-center text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400 rounded"
                          />
                        </td>

                        {/* Comment */}
                        <td
                          className={`px-1 py-1 border-r border-slate-100 ${isCommentEdited ? 'bg-amber-50' : ''}`}
                        >
                          <input
                            type="text"
                            value={commentVal ?? ''}
                            onChange={(e) =>
                              updateEdit(
                                mark.mark_id,
                                'comment',
                                e.target.value,
                              )
                            }
                            className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-orange-400 rounded"
                            placeholder="—"
                          />
                        </td>

                        {/* Grade - now shown next to each sequence */}
                        <td className="px-2 py-1 border-r border-slate-100 text-center">
                          {mark.grade ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                              {mark.grade}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </Fragment>
                    )
                  })}
                </tr>
              ))}

              {isFetchingNextPage && (
                <tr>
                  <td
                    colSpan={2 + sequences.length * 3}
                    className="py-4 text-center"
                  >
                    <Loader2Icon className="w-5 h-5 animate-spin text-orange-500 mx-auto" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {hasEdits && (
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center justify-between"
        >
          <p className="text-sm text-amber-700">
            <strong>{edits.size}</strong> unsaved change(s). Edited cells are
            highlighted.
          </p>
          <div className="flex gap-2">
            <button
              onClick={discardEdits}
              className="text-sm text-amber-600 hover:text-amber-800 underline"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Save All
            </button>
          </div>
        </motion.div>
      )}

      {/* Save result modal */}
      <Modal
        isOpen={!!saveModal}
        onClose={() => setSaveModal(null)}
        title={saveModal === 'success' ? 'Changes Saved' : 'Save Failed'}
      >
        <div className="text-center space-y-3">
          {saveModal === 'success' ? (
            <>
              <CheckCircle2Icon className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-slate-700">
                All changes have been saved successfully.
              </p>
            </>
          ) : (
            <>
              <AlertTriangleIcon className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-slate-700">
                Failed to save changes. Please try again.
              </p>
            </>
          )}
          <button
            onClick={() => setSaveModal(null)}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}