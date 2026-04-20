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
} from 'lucide-react'
import { useDomainInfo } from '../hooks/useDomainInfo'
import { useDomain } from '../hooks/useDomain'
import { useDnsRecords } from '../hooks/useDnsRecords'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { LiveIndicator, NetworkPulse } from '@/components/NetworkPulse'
import { getErrorMessage } from '@/lib/utils'
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
            Manage admission portal domain name, configure DNS records, and manage
            nameservers.
          </p>
        </div>
        <LiveIndicator label="Live status" />
      </div>

      {/* Connection status card */}
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

      {/* Hero: either current domain or CTA to register */}
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                    Get started
                  </span>
                </div>
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
                to="/dashboard/domains/manage"
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0"
              >
                <PlusCircleIcon className="w-4 h-4" /> Register a domain
              </Link>
            </div>
          </div>
        )
      )}

      {/* Stat cards */}
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
