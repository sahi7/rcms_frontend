import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SearchIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
  LoaderIcon,
  ShieldIcon,
  CreditCardIcon,
  InfoIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCheckDomainAvailability } from '../../hooks/useDomainAvailability'
import { useRegisterDomain } from '../../hooks/useRegisterDomain'
import { useOperationStatus } from '../../hooks/useOperationStatus'
import { useDomainInfo } from '../../hooks/useDomainInfo'
import { Modal } from '@/components/Modal'
import { getErrorMessage } from '@/lib/utils'
import { NetworkPulse, PacketFlow } from '@/components/NetworkPulse'
import type {
  DomainAvailabilityResult,
  RegisterDomainPayload,
} from '@/types/domains'
const SAMPLE_PRICE_USD = 14.99 // payment integration pending
const resultConfig: Record<
  DomainAvailabilityResult,
  {
    tone: 'success' | 'error' | 'warn'
    title: string
    desc: string
  }
> = {
  available: {
    tone: 'success',
    title: 'Available',
    desc: 'This domain is free to register.',
  },
  taken: {
    tone: 'error',
    title: 'Taken',
    desc: 'This domain is already registered. Transfer may be possible.',
  },
  invalidDomainName: {
    tone: 'error',
    title: 'Invalid name',
    desc: 'The domain name format is invalid.',
  },
  tldNotSupported: {
    tone: 'warn',
    title: 'TLD not supported',
    desc: "We don't support this top-level domain yet.",
  },
  unexpectedError: {
    tone: 'error',
    title: 'Unexpected error',
    desc: 'Something went wrong checking this domain. Try again.',
  },
}


export function RegisterDomainSection() {
  const info = useDomainInfo()
  const hasContact = !!info.data?.DomainContactID
  const hasDomain = !!info.data?.DomainName
  const [query, setQuery] = useState('')
  const [checkedDomain, setCheckedDomain] = useState<string | null>(null)
  const check = useCheckDomainAvailability()
  const register = useRegisterDomain()
  const [operationId, setOperationId] = useState<string | null>(null)
  const [years, setYears] = useState(1)
  const [autoRenew, setAutoRenew] = useState(false)
  const [privacyLevel, setPrivacyLevel] =
    useState<RegisterDomainPayload['privacyProtection']['level']>('high')
  const [consent, setConsent] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const op = useOperationStatus(operationId, {
    onSettled: (o) => {
      if (o.status === 'success') {
        toast.success('Domain registered successfully')
        setConfirmOpen(false)
        setOperationId(null)
        info.refetch()
      } else if (o.status === 'failed') {
        toast.error('Domain registration failed')
      }
    },
  })
  const handleCheck = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const name = query.trim().toLowerCase()
    if (!name) return
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(name)) {
      toast.error('Enter a full domain like example.com')
      return
    }
    setCheckedDomain(name)
    try {
      await check.mutateAsync(name)
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }
  const handleRegister = async () => {
    if (!checkedDomain) return
    if (!consent) {
      toast.error('You must consent to the privacy protection terms')
      return
    }
    try {
      const res = await register.mutateAsync({
        domainName: checkedDomain,
        payload: {
          autoRenew,
          years,
          privacyProtection: {
            level: privacyLevel,
            userConsent: consent,
          },
        },
      })
      setOperationId(res.operationId)
      toast.info('Registration started — tracking progress…')
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to submit registration'))
    }
  }
  if (hasDomain) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2Icon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-emerald-800">
            {info.data?.DomainName} is already registered.
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Manage DNS and nameservers from the other tabs.
          </p>
        </div>
      </div>
    )
  }
  if (!hasContact) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Add contact details first
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            A domain contact is required before you can register any domain.
            Switch to the <b>Contact</b> tab to add it.
          </p>
        </div>
      </div>
    )
  }
  const result = check.data?.result
  const cfg = result ? resultConfig[result] : null
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
      {/* Search */}
      <form
        onSubmit={handleCheck}
        className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5"
      >
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Find your domain
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="myschool.com"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={check.isPending || !query.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-60"
          >
            {check.isPending ? (
              <>
                <LoaderIcon className="w-4 h-4 animate-spin" /> Checking…
              </>
            ) : (
              'Check availability'
            )}
          </button>
        </div>

        {check.isPending && (
          <div className="mt-4">
            <PacketFlow active from="You" to="Registry" />
            <p className="text-xs text-slate-500 mt-2 text-center">
              Pinging registry for{' '}
              <span className="font-mono">{checkedDomain}</span>…
            </p>
          </div>
        )}
      </form>

      {/* Availability result */}
      {!check.isPending && cfg && checkedDomain && (
        <motion.div
          key={checkedDomain + (result || '')}
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${cfg.tone === 'success' ? 'bg-emerald-50 border-emerald-200' : cfg.tone === 'warn' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}`}
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {cfg.tone === 'success' ? (
              <CheckCircle2Icon className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : cfg.tone === 'warn' ? (
              <AlertCircleIcon className="w-6 h-6 text-amber-600 shrink-0" />
            ) : (
              <XCircleIcon className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                <span className="font-mono">{checkedDomain}</span> — {cfg.title}
              </p>
              <p className="text-xs text-slate-700 mt-0.5">{cfg.desc}</p>
            </div>
          </div>
          {result === 'available' && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shrink-0"
            >
              <CreditCardIcon className="w-4 h-4" /> Register · $
              {SAMPLE_PRICE_USD}
            </button>
          )}
        </motion.div>
      )}

      {check.isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
          {getErrorMessage(check.error, 'Availability check failed')}
        </div>
      )}

      {/* Confirmation modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() =>
          !register.isPending && !operationId && setConfirmOpen(false)
        }
        title={`Register ${checkedDomain ?? ''}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {!operationId ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Years
                  </label>
                  <select
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    {[1, 2, 3, 5, 10].map((y) => (
                      <option key={y} value={y}>
                        {y} year{y > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Privacy level
                  </label>
                  <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                Auto-renew before expiration
              </label>

              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span>
                  <ShieldIcon className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  I consent to the privacy protection terms and the registrar's
                  agreement.
                </span>
              </label>

              <div className="bg-slate-50 rounded-lg p-3 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <CreditCardIcon className="w-4 h-4" />
                  <span>
                    Total{' '}
                    <span className="text-[11px] text-slate-500">(sample)</span>
                  </span>
                </div>
                <span className="font-semibold text-slate-900">
                  ${(SAMPLE_PRICE_USD * years).toFixed(2)}
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2">
                <InfoIcon className="w-4 h-4 mt-0.5 shrink-0" />
                Payment integration is pending. This step will charge the card
                on file once enabled.
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={register.isPending}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={register.isPending || !consent}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
                >
                  {register.isPending ? (
                    <>
                      <LoaderIcon className="w-4 h-4 animate-spin" />{' '}
                      Submitting…
                    </>
                  ) : (
                    <>
                      Register for {years} year{years > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <NetworkPulse
                state={
                  op.data?.status === 'success'
                    ? 'success'
                    : op.data?.status === 'failed'
                      ? 'error'
                      : 'connecting'
                }
                label={
                  op.data?.status === 'success'
                    ? 'Domain registered!'
                    : op.data?.status === 'failed'
                      ? 'Registration failed'
                      : 'Registering with registry'
                }
                sublabel={
                  op.data?.status === 'pending'
                    ? `Operation ${operationId.slice(0, 10)}… — this can take up to a minute`
                    : typeof op.data?.details === 'string'
                      ? op.data.details
                      : op.data?.status === 'success'
                        ? 'You can now configure DNS and nameservers.'
                        : 'Please try again or contact support.'
                }
              />
              <PacketFlow
                active={op.data?.status === 'pending'}
                from="Our server"
                to="Registry"
              />
              {op.data?.status !== 'pending' && (
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      setOperationId(null)
                      setConfirmOpen(false)
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  )
}
