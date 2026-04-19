import { motion } from 'framer-motion'
import { ServerIcon, AlertCircleIcon, InfoIcon } from 'lucide-react'
import { useDomain } from '../../hooks/useDomain'
import { useDomainInfo } from '../../hooks/useDomainInfo'
import { NetworkPulse, PacketFlow } from '@/components/NetworkPulse'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/lib/utils'


export function NameserversSection() {
  const info = useDomainInfo()
  const domainName = info.data?.DomainName || null
  const domain = useDomain(domainName)
  if (!domainName) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            No domain registered
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Register a domain to view and configure nameservers.
          </p>
        </div>
      </div>
    )
  }
  if (domain.isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <NetworkPulse
          state="connecting"
          label="Resolving nameservers"
          sublabel="Querying registry…"
        />
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
  const ns = domain.data?.nameservers
  const hosts = ns?.hosts || []
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
      className="space-y-4"
    >
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ServerIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {ns?.provider === 'basic'
                  ? 'Default (basic)'
                  : ns?.provider || 'Unknown'}{' '}
                nameservers
              </p>
              <p className="text-xs text-slate-500">
                {hosts.length} host{hosts.length === 1 ? '' : 's'} configured
              </p>
            </div>
          </div>
          <StatusBadge status="active" label="Active" />
        </div>

        <div className="mt-5">
          <PacketFlow active from="Visitors" to={domainName} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Nameserver hosts
        </div>
        {hosts.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            No nameservers configured.
          </div>
        ) : (
          hosts.map((host, i) => (
            <div
              key={host}
              className="px-4 py-3 border-b border-slate-100 last:border-b-0 flex items-center gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </span>
              <span className="font-mono text-sm text-slate-800 truncate">
                {host}
              </span>
              <StatusBadge status="success" label="Reachable" />
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 flex items-start gap-2">
        <InfoIcon className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          Nameserver changes can take up to 48 hours to fully propagate across
          the internet. Custom nameserver configuration will be available in an
          upcoming release.
        </span>
      </div>
    </motion.div>
  )
}
