import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GlobeIcon,
  ServerIcon,
  ShieldCheckIcon,
  NetworkIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  AlertCircleIcon,
  HistoryIcon,
  AlertTriangleIcon,
} from 'lucide-react'
import { useDomainInfo } from '../hooks/useDomainInfo'
import { useDomain } from '../hooks/useDomain'
import { useDnsRecords } from '../hooks/useDnsRecords'
import { StatusBadge } from '../../../components/StatusBadge'
import { formatDate, getErrorMessage, daysUntil } from '../../../lib/utils'
import { LiveIndicator, NetworkPulse } from '../../../components/NetworkPulse'
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
function ExpiryBanner({ date }: { date?: string }) {
  const days = daysUntil(date)
  if (days == null || days > 30) return null
  const tone =
    days < 0 || days <= 7
      ? 'bg-rose-50 border-rose-200 text-rose-900'
      : 'bg-amber-50 border-amber-200 text-amber-900'
  const label =
    days < 0
      ? `Expired ${Math.abs(days)} day(s) ago`
      : `Expires in ${days} day(s)`
  return (
    <div
      className={`border rounded-xl p-3 sm:p-4 flex items-start gap-3 ${tone}`}
    >
      <AlertTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          {label} — renew to avoid service interruption
        </p>
        <p className="text-xs mt-0.5 opacity-90">
          Keep your domain active by renewing or enabling auto-renew.
        </p>
      </div>
      <Link
        to="/dashboard/domains/manage"
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white rounded-lg border border-current/20 hover:bg-white/60 shrink-0"
      >
        Manage <ArrowRightIcon className="w-3 h-3" />
      </Link>
    </div>
  )
}
export function DomainsDashboard() {
  const info = useDomainInfo()
  const hasDomain = !!info.data?.DomainName
  const hasContact = !!info.data?.DomainContactID
  const domain = useDomain(hasDomain ? info.data?.DomainName : null)
  const dns = useDnsRecords(hasDomain ? info.data?.DomainName : null)
  const infoPulseState: 'idle' | 'connecting' | 'success' | 'error' =
    info.isLoading ? 'connecting' : info.isError ? 'error' : 'success'
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
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Domains
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage domain, configure DNS records, and manage nameservers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/domains/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
          >
            <HistoryIcon className="w-3.5 h-3.5" /> History
          </Link>
          <LiveIndicator label="Live status" />
        </div>
      </div>

      {hasDomain && <ExpiryBanner date={domain.data?.expirationDate} />}

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <NetworkPulse
            state={infoPulseState}
            label={
              info.isLoading
                ? 'Contacting registry...'
                : info.isError
                  ? 'Registry unreachable'
                  : 'Registry connected'
            }
            sublabel={
              info.isError
                ? getErrorMessage(info.error)
                : hasDomain
                  ? `Managing ${info.data?.DomainName}`
                  : hasContact
                    ? 'Contact on file — ready to register'
                    : 'No contact on file yet'
            }
          />
          {info.isError && (
            <button
              onClick={() => info.refetch()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
            >
              <AlertCircleIcon className="w-4 h-4" /> Retry
            </button>
          )}
        </div>
      </div>

      {hasDomain && domain.data ? (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                  Current domain
                </span>
                <StatusBadge
                  status={
                    domain.data.lifecycleStatus === 'registered'
                      ? 'active'
                      : 'pending'
                  }
                  label={domain.data.lifecycleStatus}
                />
                {domain.data.autoRenew && (
                  <StatusBadge status="info" label="Auto-renew" />
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                {domain.data.unicodeName || domain.data.name}
              </h2>
              <p className="text-sm text-slate-600">
                Registered {formatDate(domain.data.registrationDate)} • Expires{' '}
                {formatDate(domain.data.expirationDate)}
              </p>
            </div>
            <Link
              to="/dashboard/domains/manage"
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 rounded-lg border border-orange-200 shrink-0"
            >
              Manage domain <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        !info.isLoading && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Get started
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  You don't have a domain yet
                </h2>
                <p className="text-sm text-slate-600">
                  {hasContact
                    ? 'Your contact details are on file. Search and register a domain now.'
                    : 'Add your contact details first, then register your institution domain.'}
                </p>
              </div>
              <Link
                to="/dashboard/domains/manage?tab=register"
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0"
              >
                <PlusCircleIcon className="w-4 h-4" /> Register a domain
              </Link>
            </div>
          </div>
        )
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Domain"
          value={hasDomain ? '1' : '0'}
          icon={GlobeIcon}
          to="/dashboard/domains/manage"
          loading={info.isLoading}
        />
        <StatCard
          label="DNS records"
          value={dns.data?.total ?? (hasDomain ? 0 : '—')}
          icon={NetworkIcon}
          to="/dashboard/domains/manage?tab=dns"
          loading={hasDomain && dns.isLoading}
        />
        <StatCard
          label="Nameservers"
          value={
            domain.data?.nameservers?.hosts?.length ?? (hasDomain ? 0 : '—')
          }
          icon={ServerIcon}
          to="/dashboard/domains/manage?tab=nameservers"
          loading={hasDomain && domain.isLoading}
        />
        <StatCard
          label="Contact"
          value={hasContact ? 'On file' : 'Not set'}
          icon={ShieldCheckIcon}
          to="/dashboard/domains/manage?tab=contact"
          loading={info.isLoading}
        />
      </div>
    </motion.div>
  )
}
