import React, { useEffect, useMemo, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2Icon,
  SearchIcon,
  FilterIcon,
  ClipboardCheckIcon,
  XIcon,
} from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { SearchableSelect } from '@/components/SearchableSelect'
import { useUploadStatus } from '@/features/marks/hooks/useMarks'
import { useListQuery } from '@/hooks/shared/useApiQuery'
import type { Sequence } from '@/types/academic'
import { useTerms } from '@/features/academic/hooks/terms'
import { useDepartments } from '../../structure/hooks/useDepartments'
export function UploadStatusPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<{
    term?: string
    department?: string
    teacher?: string
    subject?: string
    class?: string
    sequence?: string
  }>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data: termsData } = useTerms()
  const { data: sequencesData } = useListQuery<Sequence>(
    'sequences',
    '/sequence/',
    {
      page_size: 100,
    },
  )
  const { data: deptsData } = useDepartments()
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUploadStatus({
      ...filters,
    })
  const allResults = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap((p) => p.results)
  }, [data])
  // Infinite scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      if (
        el.scrollHeight - el.scrollTop - el.clientHeight < 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage()
      }
    }
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  const termOptions = useMemo(
    () =>
      termsData?.data?.map((t) => ({
        value: String(t.id),
        label: t.name,
      })) || [],
    [termsData],
  )
  const seqOptions = useMemo(
    () =>
      sequencesData?.data?.map((s) => ({
        value: String(s.id),
        label: `${s.name} (${s.code})`,
      })) || [],
    [sequencesData],
  )
  const deptOptions = useMemo(
    () =>
      deptsData?.data?.map((d) => ({
        value: String(d.id),
        label: `${d.name} (${d.code})`,
      })) || [],
    [deptsData],
  )
  const activeFilterCount = Object.values(filters).filter(Boolean).length
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Upload Status</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track subject mark upload progress
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 text-sm border rounded-lg flex items-center gap-2 transition-colors ${showFilters || activeFilterCount > 0 ? 'border-orange-300 bg-orange-50 text-orange-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <FilterIcon className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: 'auto',
          }}
          exit={{
            opacity: 0,
            height: 0,
          }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">Filter Results</p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({})}
                className="text-xs text-orange-500 hover:text-orange-700 flex items-center gap-1"
              >
                <XIcon className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SearchableSelect
              label="Term"
              options={termOptions}
              value={filters.term || null}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  term: v ? String(v) : undefined,
                }))
              }
              placeholder="All terms"
            />
            <SearchableSelect
              label="Department"
              options={deptOptions}
              value={filters.department || null}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  department: v ? String(v) : undefined,
                }))
              }
              placeholder="All departments"
            />
            <SearchableSelect
              label="Sequence"
              options={seqOptions}
              value={filters.sequence || null}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  sequence: v ? String(v) : undefined,
                }))
              }
              placeholder="All sequences"
            />
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div ref={scrollRef} className="flex-1 overflow-auto rounded-xl bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2Icon className="w-7 h-7 animate-spin text-orange-500" />
            <span className="ml-3 text-slate-500">Loading status...</span>
          </div>
        ) : allResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardCheckIcon className="w-10 h-10 mb-2" />
            <p className="text-sm">No upload records found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 text-slate-500">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  #
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider">
                  Class
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    delay: i * 0.02,
                  }}
                  className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5 text-slate-400 text-xs">
                    {item.id}
                  </td>
                  <td className="px-5 py-3.5 text-slate-800 font-medium">
                    {item.subject__name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {item.teacher__last_name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {item.class_room__name}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusBadge
                      status={item.is_resit ? 'resit' : 'active'}
                      label={item.is_resit ? 'Resit' : 'Regular'}
                    />
                  </td>
                </motion.tr>
              ))}
              {isFetchingNextPage && (
                <tr>
                  <td colSpan={5} className="py-4 text-center">
                    <Loader2Icon className="w-5 h-5 animate-spin text-orange-500 mx-auto" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
