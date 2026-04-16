import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  SearchIcon,
  LoaderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  XIcon,
} from 'lucide-react'
import {
  useApplicantsSearch,
  useBulkUpdateApplicationStatus,
  useBulkDeleteApplications,
} from '../hooks/useApplicants'
import { useCyclesList } from '../hooks/useCycles'
import { useApplicationTypesList } from '../hooks/useApplicationTypes'
import { useStudyProgramsList } from '../hooks/useStudyPrograms'
import { useStructureLookups } from '../hooks/useResolvers'
import {
  ApplicantSearchParams,
  ApplicantStatus,
} from '@/types/admissions'
import { Can } from '@/hooks/shared/useHasPermission'
import { StatusBadge } from '@/components/StatusBadge'
import { SearchableSelect } from '@/components/SearchableSelect'
import { formatDate } from '@/lib/utils'
import { Modal } from '@/components/AdModal'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { toast } from 'sonner'
const STATUSES: ApplicantStatus[] = [
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'WAITLISTED',
]
const statusToBadge = (s: ApplicantStatus) => {
  switch (s) {
    case 'APPROVED':
      return 'active'
    case 'REJECTED':
      return 'inactive'
    case 'UNDER_REVIEW':
      return 'published'
    case 'WAITLISTED':
      return 'resit'
    default:
      return 'optional'
  }
}


export function ApplicantsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const params: ApplicantSearchParams = useMemo(
    () => ({
      q: searchParams.get('q') || undefined,
      status: (searchParams.get('status') as ApplicantStatus) || undefined,
      admission_cycle_id: searchParams.get('admission_cycle_id') || undefined,
      application_type_id: searchParams.get('application_type_id') || undefined,
      study_program_id: searchParams.get('study_program_id') || undefined,
      gender: searchParams.get('gender') || undefined,
      nationality: searchParams.get('nationality') || undefined,
      page: Number(searchParams.get('page') || 1),
      limit: 20,
    }),
    [searchParams],
  )
  const { data, isLoading, isFetching } = useApplicantsSearch(params)
  const cycles = useCyclesList()
  const types = useApplicationTypesList()
  const programs = useStudyProgramsList()
  const lookups = useStructureLookups()
  const bulkStatusMut = useBulkUpdateApplicationStatus()
  const bulkDeleteMut = useBulkDeleteApplications()
  const [selected, setSelected] = useState<string[]>([])
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const cycleMap = useMemo(() => {
    const m = new Map<string, string>()
    cycles.data?.items.forEach((c) => m.set(c.id, c.name))
    return m
  }, [cycles.data])
  const typeMap = useMemo(() => {
    const m = new Map<string, string>()
    types.data?.items.forEach((t) => m.set(t.id, t.name))
    return m
  }, [types.data])
  const programMap = useMemo(() => {
    const m = new Map<string, string>()
    programs.data?.items.forEach((p) => {
      const name =
        lookups.classRoomMap.get(p.class_room_id) || `Program #${p.id}`
      m.set(String(p.id), name)
    })
    return m
  }, [programs.data, lookups.classRoomMap])
  const updateParam = (key: string, value?: string) => {
    const sp = new URLSearchParams(searchParams)
    if (value) sp.set(key, value)
    else sp.delete(key)
    if (key !== 'page') sp.delete('page')
    setSearchParams(sp, {
      replace: true,
    })
  }
  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), {
      replace: true,
    })
    setQ('')
  }
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('q', q.trim() || undefined)
  }
  const toggleSelect = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    )
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / (params.limit ?? 20)))
    : 1
  const page = params.page ?? 1
  const activeFilters = [
    params.status,
    params.admission_cycle_id,
    params.application_type_id,
    params.study_program_id,
    params.gender,
    params.nationality,
  ].filter(Boolean).length
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Applicants
        </h1>
        <p className="text-sm text-slate-500">
          Search, filter and manage applications.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, application ID..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </form>
        <button
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg"
        >
          <FilterIcon className="w-4 h-4" /> Filters
          {activeFilters > 0 && (
            <span className="bg-orange-500 text-white text-xs px-1.5 rounded-full">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {activeFilters > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active filters:</span>
          {params.status && (
            <FilterChip
              label={params.status}
              onRemove={() => updateParam('status', undefined)}
            />
          )}
          {params.admission_cycle_id && (
            <FilterChip
              label={cycleMap.get(params.admission_cycle_id) || 'Cycle'}
              onRemove={() => updateParam('admission_cycle_id', undefined)}
            />
          )}
          {params.application_type_id && (
            <FilterChip
              label={typeMap.get(params.application_type_id) || 'Type'}
              onRemove={() => updateParam('application_type_id', undefined)}
            />
          )}
          {params.study_program_id && (
            <FilterChip
              label={programMap.get(params.study_program_id) || 'Program'}
              onRemove={() => updateParam('study_program_id', undefined)}
            />
          )}
          {params.gender && (
            <FilterChip
              label={`Gender: ${params.gender}`}
              onRemove={() => updateParam('gender', undefined)}
            />
          )}
          {params.nationality && (
            <FilterChip
              label={params.nationality}
              onRemove={() => updateParam('nationality', undefined)}
            />
          )}
          <button
            onClick={clearFilters}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex items-center justify-between gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <span className="text-sm font-medium text-orange-800">
            {selected.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelected([])}
              className="text-sm text-slate-700 px-3 py-1.5 hover:bg-white rounded"
            >
              Clear
            </button>
            <Can permission="admissions.manage_application">
              <button
                onClick={() => setBulkStatusOpen(true)}
                className="text-sm text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded"
              >
                Update status
              </button>
            </Can>
            <Can permission="admissions.manage_application">
              <button
                onClick={() => setBulkDeleteOpen(true)}
                className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded"
              >
                Delete
              </button>
            </Can>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <LoaderIcon className="w-5 h-5 animate-spin mr-2" /> Loading
          applicants...
        </div>
      ) : !data?.results.length ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
          <h3 className="text-base font-semibold text-slate-800">
            No applicants found
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-slate-100">
            {data.results.map((a) => (
              <Link
                key={a.id}
                to={`/admissions/applicants/${a.id}`}
                className="block p-4 hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelect(a.id)}
                    className="mt-1 rounded text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900 truncate">
                        {a.full_name}
                      </span>
                      <StatusBadge
                        status={statusToBadge(a.status)}
                        label={a.status}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {a.email}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-2">
                      <span>{typeMap.get(a.application_type_id)}</span>
                      <span>• {programMap.get(a.study_program_id) || '—'}</span>
                      <span>• {formatDate(a.submitted_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        data.results.length > 0 &&
                        selected.length === data.results.length
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? data.results.map((r) => r.id) : [],
                        )
                      }
                      className="rounded text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Cycle</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.results.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => {
                      // navigate via link click
                    }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(a.id)}
                        onChange={() => toggleSelect(a.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admissions/applicants/${a.id}`}
                        className="block"
                      >
                        <div className="font-medium text-slate-900 hover:text-orange-600">
                          {a.full_name}
                        </div>
                        <div className="text-xs text-slate-500">{a.email}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {typeMap.get(a.application_type_id) || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {programMap.get(a.study_program_id) || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {cycleMap.get(a.admission_cycle_id) || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(a.submitted_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={statusToBadge(a.status)}
                        label={a.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
            <span className="text-slate-500">
              {data.total} result{data.total === 1 ? '' : 's'}
              {isFetching && (
                <LoaderIcon className="w-3 h-3 inline-block ml-2 animate-spin" />
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-slate-600 px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => updateParam('page', String(page + 1))}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded disabled:opacity-30"
                aria-label="Next"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters modal */}
      <Modal
        open={filtersOpen}
        title="Filter applicants"
        onClose={() => setFiltersOpen(false)}
      >
        <div className="space-y-4">
          <SearchableSelect
            label="Status"
            options={STATUSES.map((s) => ({
              value: s,
              label: s,
            }))}
            value={params.status ?? null}
            onChange={(v) => updateParam('status', v ? String(v) : undefined)}
            placeholder="Any status"
          />
          <SearchableSelect
            label="Admission cycle"
            options={
              cycles.data?.items.map((c) => ({
                value: c.id,
                label: c.name,
              })) ?? []
            }
            value={params.admission_cycle_id ?? null}
            onChange={(v) =>
              updateParam('admission_cycle_id', v ? String(v) : undefined)
            }
            placeholder="Any cycle"
          />
          <SearchableSelect
            label="Application type"
            options={
              types.data?.items.map((t) => ({
                value: t.id,
                label: t.name,
              })) ?? []
            }
            value={params.application_type_id ?? null}
            onChange={(v) =>
              updateParam('application_type_id', v ? String(v) : undefined)
            }
            placeholder="Any type"
          />
          <SearchableSelect
            label="Study program"
            options={
              programs.data?.items.map((p) => ({
                value: String(p.id),
                label:
                  lookups.classRoomMap.get(p.class_room_id) ||
                  `Program #${p.id}`,
              })) ?? []
            }
            value={params.study_program_id ?? null}
            onChange={(v) =>
              updateParam('study_program_id', v ? String(v) : undefined)
            }
            placeholder="Any program"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gender
              </label>
              <input
                value={params.gender ?? ''}
                onChange={(e) =>
                  updateParam('gender', e.target.value || undefined)
                }
                placeholder="e.g. M, F"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nationality
              </label>
              <input
                value={params.nationality ?? ''}
                onChange={(e) =>
                  updateParam('nationality', e.target.value || undefined)
                }
                placeholder="e.g. Singaporean"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-100">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Clear all
            </button>
            <button
              onClick={() => setFiltersOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg"
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>

      <BulkStatusModal
        open={bulkStatusOpen}
        count={selected.length}
        submitting={bulkStatusMut.isPending}
        onClose={() => setBulkStatusOpen(false)}
        onSubmit={async (status, notes) => {
          try {
            await bulkStatusMut.mutateAsync({
              application_ids: selected,
              status,
              notes,
            })
            toast.success(`Updated ${selected.length} applications`)
            setSelected([])
            setBulkStatusOpen(false)
          } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Bulk update failed')
          }
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        variant="danger"
        title={`Delete ${selected.length} applications?`}
        message="This action cannot be undone."
        confirmLabel="Delete all"
        loading={bulkDeleteMut.isPending}
        onConfirm={async () => {
          try {
            await bulkDeleteMut.mutateAsync(selected)
            toast.success(`Deleted ${selected.length} applications`)
            setSelected([])
            setBulkDeleteOpen(false)
          } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Bulk delete failed')
          }
        }}
        onClose={() => setBulkDeleteOpen(false)}
      />
    </motion.div>
  )
}
function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
      {label}
      <button onClick={onRemove} className="hover:text-red-600">
        <XIcon className="w-3 h-3" />
      </button>
    </span>
  )
}
function BulkStatusModal({
  open,
  count,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean
  count: number
  submitting: boolean
  onClose: () => void
  onSubmit: (status: ApplicantStatus, notes?: string) => Promise<void>
}) {
  const [status, setStatus] = useState<ApplicantStatus>('APPROVED')
  const [notes, setNotes] = useState('')
  return (
    <Modal open={open} title={`Update ${count} applications`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicantStatus)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Optional reason / context"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(status, notes.trim() || undefined)}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
          >
            {submitting && <LoaderIcon className="w-4 h-4 animate-spin" />}
            Update
          </button>
        </div>
      </div>
    </Modal>
  )
}
