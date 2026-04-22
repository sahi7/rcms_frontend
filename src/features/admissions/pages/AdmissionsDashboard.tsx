import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  LayersIcon,
  GraduationCapIcon,
  FormInputIcon,
  UsersIcon,
  ArrowRightIcon,
} from 'lucide-react'
import { useCyclesList } from '../hooks/useCycles'
import { useApplicationTypesList } from '../hooks/useApplicationTypes'
import { useStudyProgramsList } from '../hooks/useStudyPrograms'
import { useApplicantsSearch } from '../hooks/useApplicants'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
const StatCard = ({
  label,
  value,
  icon: Icon,
  to,
  loading,
}: {
  label: string
  value: React.ReactNode
  icon: any
  to: string
  loading?: boolean
}) => (
  <Link
    to={to}
    className="group bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-orange-300 hover:shadow-sm transition-all"
  >
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          {loading ? (
            <span className="inline-block w-12 h-7 bg-slate-100 rounded animate-pulse" />
          ) : (
            value
          )}
        </p>
      </div>
      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="mt-3 inline-flex items-center gap-1 text-xs text-orange-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
      View <ArrowRightIcon className="w-3 h-3" />
    </div>
  </Link>
)


export function AdmissionsDashboard() {
  const cycles = useCyclesList()
  const appTypes = useApplicationTypesList()
  const programs = useStudyProgramsList()
  const pending = useApplicantsSearch({
    status: 'SUBMITTED',
    limit: 1,
  })
  const approved = useApplicantsSearch({
    status: 'APPROVED',
    limit: 1,
  })
  const currentCycle = (cycles.data?.items ?? []).find((c) => c.is_current)
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
      transition={{
        duration: 0.2,
      }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Admissions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage cycles, application types, programs, form fields and
          applicants.
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="flex justify-end"
      >
        <Link
          to="/dashboard/domains/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg 
               bg-gradient-to-r from-orange-500 to-amber-500 
               text-white text-sm font-medium 
               shadow-sm hover:shadow-md 
               hover:from-orange-600 hover:to-amber-600 
               transition-all"
        >
          Manage Admissions portal and domain name
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <ArrowRightIcon className="w-4 h-4" />
          </motion.span>
        </Link>
      </motion.div>

      {currentCycle && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                  Current cycle
                </span>
                {currentCycle.is_admissions_closed ? (
                  <StatusBadge status="inactive" label="Closed" />
                ) : (
                  <StatusBadge status="active" label="Open" />
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                {currentCycle.name}
              </h2>
              <p className="text-sm text-slate-600">
                {formatDate(currentCycle.start_date)} —{' '}
                {formatDate(currentCycle.end_date)}
              </p>
            </div>
            <Link
              to="/dashboard/admissions/cycles"
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 rounded-lg border border-orange-200"
            >
              Manage cycles <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Cycles"
          value={cycles.data?.total ?? 0}
          icon={CalendarIcon}
          to="/dashboard/admissions/cycles"
          loading={cycles.isLoading}
        />
        <StatCard
          label="Application types"
          value={appTypes.data?.total ?? 0}
          icon={LayersIcon}
          to="/dashboard/admissions/application-types"
          loading={appTypes.isLoading}
        />
        <StatCard
          label="Study programs"
          value={programs.data?.total ?? 0}
          icon={GraduationCapIcon}
          to="/dashboard/admissions/study-programs"
          loading={programs.isLoading}
        />
        <StatCard
          label="Pending applications"
          value={pending.data?.total ?? 0}
          icon={FormInputIcon}
          to="/dashboard/admissions/applicants?status=SUBMITTED"
          loading={pending.isLoading}
        />
        <StatCard
          label="Approved applicants"
          value={approved.data?.total ?? 0}
          icon={UsersIcon}
          to="/dashboard/admissions/applicants?status=APPROVED"
          loading={approved.isLoading}
        />
        <StatCard
          label="Form fields"
          value="Configure"
          icon={FormInputIcon}
          to="/dashboard/admissions/form-fields"
        />
      </div>
    </motion.div>
  )
}
