import React, { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  LoaderIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  DownloadIcon,
  PencilIcon,
  GraduationCapIcon,
} from 'lucide-react'
import {
  useApplicantDetail,
  useEducationalHistory,
  useUpdateApplicationStatus,
} from '../hooks/useApplicants'
import { useCyclesList } from '../hooks/useCycles'
import { useApplicationTypesList } from '../hooks/useApplicationTypes'
import { useStudyProgramsList } from '../hooks/useStudyPrograms'
import { useStructureLookups } from '../hooks/useResolvers'
import { useFormFieldsGrouped } from '../hooks/useFormFields'
import { ApplicantStatus } from '@/types/admissions'
import { Can } from '@/hooks/shared/useHasPermission'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { Modal } from '@/components/AdModal'
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


export function ApplicantDetailPage() {
  const { id } = useParams<{
    id: string
  }>()
  const { data: applicant, isLoading } = useApplicantDetail(id ?? null)
  const eduHistory = useEducationalHistory(applicant?.application_id ?? null)
  const cycles = useCyclesList()
  const types = useApplicationTypesList()
  const programs = useStudyProgramsList()
  const lookups = useStructureLookups()
  const fieldsGrouped = useFormFieldsGrouped()
  const updateStatusMut = useUpdateApplicationStatus()
  const [statusOpen, setStatusOpen] = useState(false)
  const cycleName = useMemo(() => {
    if (!applicant) return ''
    return (
      cycles.data?.items.find((c) => c.id === applicant.admission_cycle_id)
        ?.name || '—'
    )
  }, [cycles.data, applicant])
  const typeName = useMemo(() => {
    if (!applicant) return ''
    return (
      types.data?.items.find((t) => t.id === applicant.application_type_id)
        ?.name || '—'
    )
  }, [types.data, applicant])
  const programName = useMemo(() => {
    if (!applicant) return ''
    const p = programs.data?.items.find(
      (x) => String(x.id) === applicant.study_program_id,
    )
    if (!p) return '—'
    return lookups.classRoomMap.get(p.class_room_id) || `Program #${p.id}`
  }, [programs.data, lookups.classRoomMap, applicant])
  const customFieldDefs = useMemo(() => {
    if (!applicant) return []
    return (fieldsGrouped.data?.[applicant.application_type_id] ?? []).sort(
      (a, b) => a.order - b.order,
    )
  }, [fieldsGrouped.data, applicant])
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        <LoaderIcon className="w-5 h-5 animate-spin mr-2" /> Loading
        applicant...
      </div>
    )
  }
  if (!applicant) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <h3 className="text-base font-semibold text-slate-800">
          Applicant not found
        </h3>
        <Link
          to="/admissions/applicants"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block"
        >
          ← Back to applicants
        </Link>
      </div>
    )
  }
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
      <Link
        to="/admissions/applicants"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Back to applicants
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-semibold text-lg shrink-0">
              {applicant.full_name
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {applicant.full_name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge
                  status={statusToBadge(applicant.status)}
                  label={applicant.status}
                />
                <span className="text-xs text-slate-500 font-mono">
                  {applicant.application_id}
                </span>
              </div>
            </div>
          </div>
          <Can permission="change_applicant">
            <button
              onClick={() => setStatusOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
            >
              <PencilIcon className="w-4 h-4" /> Update status
            </button>
          </Can>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          <InfoRow icon={MailIcon} label="Email" value={applicant.email} />
          <InfoRow icon={PhoneIcon} label="Phone" value={applicant.phone} />
          <InfoRow
            icon={UserIcon}
            label="Gender"
            value={applicant.gender || '—'}
          />
          <InfoRow
            icon={CalendarIcon}
            label="Date of birth"
            value={formatDate(applicant.date_of_birth)}
          />
          <InfoRow
            icon={MapPinIcon}
            label="Nationality"
            value={applicant.nationality || '—'}
          />
          <InfoRow
            icon={MapPinIcon}
            label="Country of birth"
            value={applicant.country_of_birth || '—'}
          />
          <InfoRow
            icon={MapPinIcon}
            label="Place of birth"
            value={applicant.place_of_birth || '—'}
          />
          <InfoRow
            icon={FileTextIcon}
            label="Preferred language"
            value={applicant.preferred_language || '—'}
          />
          <InfoRow
            icon={MapPinIcon}
            label="Address"
            value={applicant.address || '—'}
          />
        </div>
      </div>

      {/* Application context */}
      <Section title="Application">
        <div className="grid sm:grid-cols-3 gap-4">
          <MetaCard label="Type" value={typeName} />
          <MetaCard label="Study program" value={programName} />
          <MetaCard label="Cycle" value={cycleName} />
          <MetaCard
            label="Submitted at"
            value={formatDate(applicant.submitted_at, true)}
          />
          <MetaCard
            label="Decision at"
            value={
              applicant.decision_at
                ? formatDate(applicant.decision_at, true)
                : '—'
            }
          />
          <MetaCard label="Applicant ID" value={applicant.applicant_id} mono />
        </div>
        {applicant.notes && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-xs font-semibold text-amber-800 uppercase mb-1">
              Admin notes
            </div>
            <p className="text-sm text-amber-900 whitespace-pre-wrap">
              {applicant.notes}
            </p>
          </div>
        )}
      </Section>

      {/* Emergency contact */}
      <Section title="Emergency contact">
        <div className="grid sm:grid-cols-2 gap-4">
          <MetaCard
            label="Name"
            value={applicant.emergency_guardian_name || '—'}
          />
          <MetaCard
            label="Relationship"
            value={applicant.relationship_to_guardian || '—'}
          />
          <MetaCard
            label="Email"
            value={applicant.emergency_guardian_email || '—'}
          />
          <MetaCard
            label="Phone"
            value={applicant.emergency_guardian_phone || '—'}
          />
          <div className="sm:col-span-2">
            <MetaCard
              label="Address"
              value={applicant.emergency_guardian_address || '—'}
            />
          </div>
        </div>
      </Section>

      {/* Custom fields */}
      {Object.keys(applicant.custom_fields || {}).length > 0 && (
        <Section title="Additional information">
          <div className="space-y-3">
            {Object.entries(applicant.custom_fields).map(([key, value]) => {
              const def = customFieldDefs.find((f) => f.name === key)
              return (
                <div key={key} className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 uppercase">
                    {def?.label || key}
                  </div>
                  <div className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">
                    {value || '—'}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Educational history */}
      <Section
        title="Educational history"
        icon={<GraduationCapIcon className="w-4 h-4" />}
      >
        {eduHistory.isLoading ? (
          <div className="flex items-center text-sm text-slate-400">
            <LoaderIcon className="w-4 h-4 animate-spin mr-2" /> Loading...
          </div>
        ) : eduHistory.isError ? (
          <p className="text-sm text-red-600">
            Failed to load educational history.
          </p>
        ) : !eduHistory.data?.length ? (
          <p className="text-sm text-slate-500">
            No educational history provided.
          </p>
        ) : (
          <div className="space-y-3">
            {eduHistory.data.map((h, i) => (
              <div
                key={i}
                className="p-4 bg-white border border-slate-200 rounded-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">
                      {h.school_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {h.location} • {formatDate(h.from_year)} —{' '}
                      {formatDate(h.to_year)}
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      {h.certificate_obtained}
                    </div>
                  </div>
                  {h.certificate_url && (
                    <CertificatePreview url={h.certificate_url} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <StatusUpdateModal
        open={statusOpen}
        currentStatus={applicant.status}
        currentNotes={applicant.notes}
        submitting={updateStatusMut.isPending}
        onClose={() => setStatusOpen(false)}
        onSubmit={async (status, notes) => {
          try {
            await updateStatusMut.mutateAsync({
              id: applicant.id,
              payload: {
                status,
                notes,
              },
            })
            toast.success('Application updated')
            setStatusOpen(false)
          } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to update')
          }
        }}
      />
    </motion.div>
  )
}
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm text-slate-800 truncate">{value}</div>
      </div>
    </div>
  )
}
function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}
function MetaCard({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className={`text-sm text-slate-800 mt-0.5 ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </div>
    </div>
  )
}
function CertificatePreview({ url }: { url: string }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)
  const isPdf = /\.pdf(\?|$)/i.test(url)
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
      >
        <FileTextIcon className="w-3.5 h-3.5" /> View certificate
      </button>
      <Modal
        open={open}
        title="Certificate"
        onClose={() => setOpen(false)}
        size="xl"
      >
        <div className="space-y-3">
          {isImage ? (
            <img
              src={url}
              alt="Certificate"
              className="max-h-[70vh] w-full object-contain rounded-lg bg-slate-50"
            />
          ) : isPdf ? (
            <iframe
              src={url}
              title="Certificate PDF"
              className="w-full h-[70vh] rounded-lg border border-slate-200"
            />
          ) : (
            <div className="p-6 bg-slate-50 rounded-lg text-center text-sm text-slate-600">
              Preview not available for this file type.
            </div>
          )}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <DownloadIcon className="w-4 h-4" /> Open in new tab / download
          </a>
        </div>
      </Modal>
    </>
  )
}
function StatusUpdateModal({
  open,
  currentStatus,
  currentNotes,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean
  currentStatus: ApplicantStatus
  currentNotes: string
  submitting: boolean
  onClose: () => void
  onSubmit: (status: ApplicantStatus, notes?: string) => Promise<void>
}) {
  const [status, setStatus] = useState<ApplicantStatus>(currentStatus)
  const [notes, setNotes] = useState(currentNotes ?? '')
  return (
    <Modal open={open} title="Update application" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
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
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Decision rationale, next steps, etc."
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
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}
