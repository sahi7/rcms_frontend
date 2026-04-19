import React from 'react'
import { motion } from 'framer-motion'
import {
  GlobeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  ServerIcon,
  NetworkIcon,
} from 'lucide-react'
import { useDomainInfo } from '../../hooks/useDomainInfo'
import { useDomain } from '../../hooks/useDomain'
import { useDnsRecords } from '../../hooks/useDnsRecords'
import { PageSummaryCards } from '@/components/PageSummaryCards'
import { NetworkPulse, LiveIndicator } from '@/components/NetworkPulse'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDate } from '@/lib/utils'
import { getErrorMessage } from '@/lib/utils'


export function OverviewSection() {
  const info = useDomainInfo()
  const domainName = info.data?.DomainName || null
  const domain = useDomain(domainName)
  const dns = useDnsRecords(domainName)
  if (!domainName) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
        <GlobeIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-800">No domain yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Use the <b>Register</b> tab to search for and register a new domain.
        </p>
      </div>
    )
  }
  if (domain.isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <NetworkPulse state="connecting" label="Loading domain details" />
      </div>
    )
  }
  if (domain.isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
        {getErrorMessage(domain.error)}
        <button
          onClick={() => domain.refetch()}
          className="ml-2 underline font-medium"
        >
          Retry
        </button>
      </div>
    )
  }
  const d = domain.data
  if (!d) return null
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-slate-900">Overview</h3>
        <LiveIndicator />
      </div>

      <PageSummaryCards
        cards={[
          {
            title: 'Status',
            value: d.lifecycleStatus,
            subtitle: d.verificationStatus,
            icon: ShieldCheckIcon,
            color: d.lifecycleStatus === 'registered' ? 'emerald' : 'amber',
          },
          {
            title: 'Expires',
            value: formatDate(d.expirationDate),
            subtitle: d.autoRenew ? 'Auto-renew on' : 'Auto-renew off',
            icon: CalendarIcon,
            color: 'orange',
          },
          {
            title: 'DNS records',
            value: dns.data?.total ?? (dns.isLoading ? '…' : 0),
            subtitle: 'Across all types',
            icon: NetworkIcon,
            color: 'blue',
          },
          {
            title: 'Nameservers',
            value: d.nameservers.hosts.length,
            subtitle: d.nameservers.provider,
            icon: ServerIcon,
            color: 'purple',
          },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <GlobeIcon className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-800">
              Domain details
            </h4>
          </div>
          <button
            onClick={() => domain.refetch()}
            disabled={domain.isFetching}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-60"
          >
            <RefreshCwIcon
              className={`w-3.5 h-3.5 ${domain.isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Row
            label="Name"
            value={<span className="font-mono">{d.unicodeName || d.name}</span>}
          />
          <Row label="Registered" value={formatDate(d.registrationDate)} />
          <Row
            label="Premium"
            value={
              <StatusBadge
                status={d.isPremium ? 'info' : 'inactive'}
                label={d.isPremium ? 'Yes' : 'No'}
              />
            }
          />
          <Row
            label="Privacy"
            value={
              <StatusBadge
                status={
                  d.privacyProtection.level === 'none' ? 'warning' : 'success'
                }
                label={d.privacyProtection.level}
              />
            }
          />
          <Row
            label="EPP statuses"
            value={
              d.eppStatuses.length ? (
                <div className="flex flex-wrap gap-1">
                  {d.eppStatuses.map((s) => (
                    <span
                      key={s}
                      className="px-1.5 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                '—'
              )
            }
          />
          <Row
            label="Suspensions"
            value={
              d.suspensions.length ? (
                <div className="flex flex-wrap gap-1">
                  {d.suspensions.map((s) => (
                    <StatusBadge
                      key={s.reasonCode}
                      status="failed"
                      label={s.reasonCode}
                    />
                  ))}
                </div>
              ) : (
                <StatusBadge status="success" label="None" />
              )
            }
          />
        </div>
      </div>
    </motion.div>
  )
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-32 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-slate-800 min-w-0 break-words">{value}</span>
    </div>
  )
}
