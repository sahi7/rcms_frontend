import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  SearchIcon,
  LoaderIcon,
  HistoryIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { useCombinedHistory } from '../hooks/useCombinedHistory'
import { useRegisterDomain } from '../../domains/hooks/useRegisterDomain'
import { useOperationStatus } from '../../domains/hooks/useOperationStatus'
import { StatusBadge } from '../../../components/StatusBadge'
import { NetworkPulse } from '../../../components/NetworkPulse'
import { formatCurrency, formatDate, getErrorMessage } from '../../../lib/utils'
import { toast } from 'sonner'
function PaymentStatusCell({ status }: { status?: string }) {
  if (!status) return <span className="text-xs text-slate-400">—</span>
  const tone =
    status === 'SUCCESSFUL' || status === 'success'
      ? 'success'
      : status === 'FAILED' || status === 'failed'
        ? 'failed'
        : 'pending'
  const icon =
    tone === 'success' ? (
      <CheckCircle2Icon className="w-3.5 h-3.5" />
    ) : tone === 'failed' ? (
      <XCircleIcon className="w-3.5 h-3.5" />
    ) : (
      <ClockIcon className="w-3.5 h-3.5" />
    )
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      <StatusBadge status={tone} label={status} />
    </span>
  )
}
export function PaymentHistoryPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const {
    items,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCombinedHistory({
    domain: debouncedSearch || undefined,
  })
  const [retryingDomain, setRetryingDomain] = useState<string | null>(null)
  const [retryOpId, setRetryOpId] = useState<string | null>(null)
  const register = useRegisterDomain()
  useOperationStatus(retryOpId, {
    onSettled: (o) => {
      if (o.status === 'success') {
        toast.success(`${retryingDomain} registered!`)
        refetch()
      } else if (o.status === 'failed') {
        toast.error('Registration retry failed.')
      }
      setRetryingDomain(null)
      setRetryOpId(null)
    },
  })
  const handleSearch = (v: string) => {
    setSearch(v)
    // Debounce
    setTimeout(() => setDebouncedSearch(v), 300)
  }
  const handleRetry = async (domain: string) => {
    setRetryingDomain(domain)
    try {
      const res = await register.mutateAsync({
        domainName: domain,
        payload: {
          autoRenew: false,
          years: 1,
          privacyProtection: {
            level: 'high',
            userConsent: true,
          },
        },
      })
      setRetryOpId(res.operationId)
      toast.info('Retrying registration…')
    } catch (e) {
      setRetryingDomain(null)
      toast.error(getErrorMessage(e, 'Could not start retry'))
    }
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
      <div>
        <Link
          to="/dashboard/domains"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" /> Back to domains
        </Link>
        <div className="flex items-center justify-between gap-3 flex-wrap mt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <HistoryIcon className="w-6 h-6 text-orange-600" /> History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Payments &amp; domain registrations combined by domain.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
          >
            <RefreshCwIcon className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Filter by domain name…"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <NetworkPulse state="connecting" label="Loading history…" />
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-rose-900">
              Couldn't load history
            </p>
            <p className="text-xs text-rose-800 mt-0.5">
              {getErrorMessage(error)}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-medium text-rose-700 underline"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-600">
            No history yet. Your payments and registrations will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Domain</th>
                  <th className="text-left px-4 py-3 font-semibold">Payment</th>
                  <th className="text-left px-4 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Registration
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-right px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const paySuccess = item.payment?.status === 'SUCCESSFUL'
                  const regFailed =
                    item.registration?.registration_status === 'failed'
                  const canRetry = paySuccess && regFailed
                  const isRetrying = retryingDomain === item.domain
                  return (
                    <tr
                      key={item.key}
                      className="border-t border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm font-medium text-slate-900">
                          {item.domain}
                        </p>
                        {item.registration?.years && (
                          <p className="text-[11px] text-slate-500">
                            {item.registration.years} year(s)
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusCell status={item.payment?.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.payment
                          ? formatCurrency(
                              item.payment.amount,
                              item.payment.currency,
                            )
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusCell
                          status={item.registration?.registration_status}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDate(item.createdAt, true)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canRetry && (
                          <button
                            onClick={() => handleRetry(item.domain)}
                            disabled={isRetrying || register.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg disabled:opacity-60"
                          >
                            {isRetrying ? (
                              <>
                                <LoaderIcon className="w-3 h-3 animate-spin" />{' '}
                                Retrying…
                              </>
                            ) : (
                              <>
                                <RefreshCwIcon className="w-3 h-3" /> Retry
                                registration
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {hasNextPage && (
            <div className="p-3 border-t border-slate-100 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg disabled:opacity-60"
              >
                {isFetchingNextPage ? (
                  <>
                    <LoaderIcon className="w-3 h-3 animate-spin" /> Loading…
                  </>
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
