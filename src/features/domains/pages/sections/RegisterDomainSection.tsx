import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SearchIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
  LoaderIcon,
  ShieldIcon,
  CreditCardIcon,
  SmartphoneIcon,
  LinkIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  SparklesIcon,
  TagIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCheckDomainAvailability } from '../../hooks/useDomainAvailability'
import { useRegisterDomain } from '../../hooks/useRegisterDomain'
import { useOperationStatus } from '../../hooks/useOperationStatus'
import { useDomainInfo } from '../../hooks/useDomainInfo'
import { useInitiatePayment } from '@/features/payments/hooks/useInitiatePayment'
import { useTransactionStatus } from '@/features/payments/hooks/useTransactionStatus'
import { Modal } from '@/components/Modal'
import { NetworkPulse, PacketFlow } from '@/components/NetworkPulse'
import { PhoneInput } from '@/features/payments/components/PhoneInput'
import { USSDInstructions } from '@/features/payments/components/USSDInstructions'
import {
  PaymentFlowStepper,
  type FlowStage,
} from '@/features/payments/components/PaymentFlowStepper'
import { CARD_PAYMENTS_ENABLED } from '@/lib/api'
import {
  formatCurrency,
  getErrorMessage,
  makeExternalReference,
  normalizePhone,
} from '@/lib/utils'
import type {
  DomainAvailabilityResult,
  RegisterDomainPayload,
} from '@/types/domains'
import type {
  PaymentMethod,
  PremiumPricing,
  InitiateCollectResponse,
  InitiateLinkResponse,
  Transaction,
} from '@/types/payments'
const YEARS_OPTIONS = [1, 2, 3, 5, 10] as const
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
function priceFor(
  pricing: PremiumPricing[] | undefined,
  years: number,
): PremiumPricing | undefined {
  return pricing?.find((p) => p.years === years)
}
export function RegisterDomainSection() {
  const info = useDomainInfo()
  const hasContact = !!info.data?.DomainContactID
  const hasDomain = !!info.data?.DomainName
  const [query, setQuery] = useState('')
  const [checkedDomain, setCheckedDomain] = useState<string | null>(null)
  const check = useCheckDomainAvailability()
  // dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [years, setYears] = useState<number>(1)
  const [autoRenew, setAutoRenew] = useState(false)
  const [privacyLevel, setPrivacyLevel] =
    useState<RegisterDomainPayload['privacyProtection']['level']>('high')
  const [consent, setConsent] = useState(false)
  // payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('collect')
  const [countryCode, setCountryCode] = useState('237')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const initiate = useInitiatePayment()
  const [txReference, setTxReference] = useState<string | null>(null)
  const [ussdInfo, setUssdInfo] = useState<InitiateCollectResponse | null>(null)
  const [linkInfo, setLinkInfo] = useState<InitiateLinkResponse | null>(null)
  const [paymentSettled, setPaymentSettled] = useState<Transaction | null>(null)
  // registration state (runs AFTER payment success)
  const [operationId, setOperationId] = useState<string | null>(null)
  const [registrationFailed, setRegistrationFailed] = useState(false)
  const register = useRegisterDomain()
  const availabilityResult = check.data?.result
  const cfg = availabilityResult ? resultConfig[availabilityResult] : null
  const pricing = check.data?.premiumPricing
  const singleYearPrice = priceFor(pricing, 1)
  const selectedPrice = priceFor(pricing, years)
  // Polling — payment
  const txPoll = useTransactionStatus({
    reference: txReference,
    method: paymentMethod,
    enabled: !!txReference && !paymentSettled,
    onSettled: (tx) => {
      setPaymentSettled(tx)
      if (tx.status === 'SUCCESSFUL') {
        toast.success('Payment received — starting domain registration…')
        // Backend returns operationId for registration on SUCCESSFUL transaction
        if (tx.operationId) {
          setOperationId(tx.operationId)
        } else {
          // Defensive: if backend didn't bundle it, self-trigger registration
          triggerRegistrationFallback()
        }
      } else if (tx.status === 'FAILED') {
        toast.error(tx.reason || 'Payment failed. Please try again.')
      }
    },
  })
  // Polling — registration
  const op = useOperationStatus(operationId, {
    onSettled: (o) => {
      if (o.status === 'success') {
        toast.success('Domain registered successfully!')
        info.refetch()
      } else {
        setRegistrationFailed(true)
        toast.error(
          'Domain registration failed. You can retry — your payment is safe.',
        )
      }
    },
  })
  const currentStage: FlowStage = (() => {
    if (op.data?.status === 'success') return 'registrationSuccess'
    if (op.data?.status === 'failed' || registrationFailed)
      return 'registrationFailed'
    if (operationId) return 'registering'
    if (paymentSettled?.status === 'SUCCESSFUL') return 'paymentSuccess'
    if (paymentSettled?.status === 'FAILED') return 'paymentFailed'
    if (txReference) return 'awaitingPayment'
    if (initiate.isPending) return 'initiating'
    return 'idle'
  })()
  async function triggerRegistrationFallback() {
    if (!checkedDomain) return
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
      setRegistrationFailed(false)
    } catch (e) {
      setRegistrationFailed(true)
      toast.error(getErrorMessage(e, 'Failed to start registration'))
    }
  }
  async function handleRetryRegistration() {
    setRegistrationFailed(false)
    setOperationId(null)
    await triggerRegistrationFallback()
  }
  async function handleCheck(ev: React.FormEvent) {
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
  function resetFlow() {
    setTxReference(null)
    setUssdInfo(null)
    setLinkInfo(null)
    setPaymentSettled(null)
    setOperationId(null)
    setRegistrationFailed(false)
    initiate.reset()
    register.reset()
  }
  async function handlePay() {
    if (!checkedDomain) return
    if (!consent) {
      toast.error('You must consent to the privacy protection terms')
      return
    }
    if (paymentMethod === 'collect') {
      const cleanNumber = phoneNumber.replace(/\D/g, '')
      if (cleanNumber.length < 6) {
        setPhoneError('Enter a valid mobile money number')
        return
      }
      setPhoneError(null)
    }
    const from =
      paymentMethod === 'collect'
        ? normalizePhone(countryCode, phoneNumber)
        : undefined
    try {
      const res = await initiate.mutateAsync({
        domain: checkedDomain,
        years,
        payment_method: paymentMethod,
        from,
        description: `Domain registration fee for ${checkedDomain}`,
        external_reference: makeExternalReference('DOM'),
        auto_renew: autoRenew,
        privacy_protection: {
          level: privacyLevel,
          user_consent: consent,
        },
      })
      setTxReference(res.reference)
      if (paymentMethod === 'collect') {
        setUssdInfo(res as InitiateCollectResponse)
        toast.info('Payment initiated. Check your phone.')
      } else {
        const link = res as InitiateLinkResponse
        setLinkInfo(link)
        window.open(link.link, '_blank', 'noopener,noreferrer')
        toast.info(
          "Complete payment in the new tab — we'll detect it automatically.",
        )
      }
    } catch (e) {
      toast.error(getErrorMessage(e, 'Could not start payment'))
    }
  }
  function handleCloseDialog() {
    // Don't allow closing mid-flow unless in a terminal state
    if (initiate.isPending) return
    if (txReference && !paymentSettled) return
    if (operationId && op.data?.status === 'pending') return
    setConfirmOpen(false)
    resetFlow()
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
          key={checkedDomain + (availabilityResult || '')}
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
              {availabilityResult === 'available' && singleYearPrice && (
                <p className="text-sm font-semibold text-emerald-800 mt-2 flex items-center gap-1.5">
                  <TagIcon className="w-4 h-4" />
                  {formatCurrency(singleYearPrice.totalPrice)}
                  <span className="text-xs font-normal text-emerald-700">
                    / year
                  </span>
                </p>
              )}
            </div>
          </div>
          {availabilityResult === 'available' && (
            <button
              onClick={() => {
                setYears(1)
                setConfirmOpen(true)
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shrink-0"
            >
              <CreditCardIcon className="w-4 h-4" /> Register
            </button>
          )}
        </motion.div>
      )}

      {check.isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
          {getErrorMessage(check.error, 'Availability check failed')}
        </div>
      )}

      {/* Registration + payment dialog */}
      <Modal
        isOpen={confirmOpen}
        onClose={handleCloseDialog}
        title={`Register ${checkedDomain ?? ''}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Flow visual */}
          <PaymentFlowStepper
            stage={currentStage}
            paymentSublabel={
              currentStage === 'awaitingPayment'
                ? `Waiting · ${txPoll.secondsElapsed}s`
                : currentStage === 'paymentSuccess'
                  ? 'Paid ✓'
                  : currentStage === 'paymentFailed'
                    ? paymentSettled?.reason || 'Failed'
                    : undefined
            }
            registrationSublabel={
              currentStage === 'registering'
                ? 'Submitting…'
                : currentStage === 'registrationSuccess'
                  ? 'Done ✓'
                  : currentStage === 'registrationFailed'
                    ? 'Failed'
                    : undefined
            }
          />

          <AnimatePresence mode="wait">
            {/* Pre-payment config */}
            {currentStage === 'idle' && (
              <motion.div
                key="config"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="space-y-4"
              >
                {/* Years selector with pricing + savings */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Choose how many years
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {YEARS_OPTIONS.map((y) => {
                      const p = priceFor(pricing, y)
                      const selected = years === y
                      const saving =
                        p && singleYearPrice
                          ? singleYearPrice.unitPrice * y - p.totalPrice
                          : 0
                      return (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setYears(y)}
                          className={`relative rounded-lg border p-2 text-left transition-all ${selected ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          <div className="text-xs font-semibold text-slate-900">
                            {y}y
                          </div>
                          {p && (
                            <>
                              <div className="text-[10px] text-slate-600 mt-0.5">
                                {formatCurrency(p.unitPrice)}
                                <span className="text-[9px]">/yr</span>
                              </div>
                              {p.discountPct > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5">
                                  -{p.discountPct}%
                                </span>
                              )}
                            </>
                          )}
                          {selected && saving > 0 && (
                            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                              Save {formatCurrency(saving)}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {years > 1 && selectedPrice && singleYearPrice && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -4,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-start gap-2"
                    >
                      <SparklesIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-emerald-800">
                        <b>Smart pick!</b> You save{' '}
                        <b>
                          {formatCurrency(
                            singleYearPrice.unitPrice * years -
                              selectedPrice.totalPrice,
                          )}
                        </b>{' '}
                        ({selectedPrice.discountPct}% off) and lock the price
                        for {years} years — avoiding potential renewal hikes.
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Privacy level
                    </label>
                    <select
                      value={privacyLevel}
                      onChange={(e) => setPrivacyLevel(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="high">High (recommended)</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-700 mt-6">
                    <input
                      type="checkbox"
                      checked={autoRenew}
                      onChange={(e) => setAutoRenew(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    Auto-renew before expiration
                  </label>
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('collect')}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${paymentMethod === 'collect' ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <SmartphoneIcon className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Mobile Money
                        </p>
                        <p className="text-[11px] text-slate-500">
                          MTN / Orange
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      disabled={!CARD_PAYMENTS_ENABLED}
                      onClick={() =>
                        CARD_PAYMENTS_ENABLED && setPaymentMethod('link')
                      }
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${!CARD_PAYMENTS_ENABLED ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed' : paymentMethod === 'link' ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <LinkIcon className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Credit Card
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {CARD_PAYMENTS_ENABLED
                            ? 'Via secure link'
                            : 'Coming soon'}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'collect' && (
                  <PhoneInput
                    countryCode={countryCode}
                    number={phoneNumber}
                    onCountryCodeChange={setCountryCode}
                    onNumberChange={(v) => {
                      setPhoneNumber(v)
                      setPhoneError(null)
                    }}
                    error={phoneError || undefined}
                  />
                )}

                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>
                    <ShieldIcon className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                    I consent to the privacy protection terms and the
                    registrar's agreement.
                  </span>
                </label>

                {/* Total */}
                <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CreditCardIcon className="w-4 h-4" />
                    <span className="text-sm">
                      Total for {years} year{years > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {selectedPrice
                      ? formatCurrency(selectedPrice.totalPrice)
                      : '—'}
                  </span>
                </div>

                {initiate.isError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
                    {getErrorMessage(initiate.error, 'Could not start payment')}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    disabled={initiate.isPending}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePay}
                    disabled={initiate.isPending || !consent || !selectedPrice}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-60"
                  >
                    {initiate.isPending ? (
                      <>
                        <LoaderIcon className="w-4 h-4 animate-spin" /> Starting
                        payment…
                      </>
                    ) : (
                      <>
                        Pay{' '}
                        {selectedPrice
                          ? formatCurrency(selectedPrice.totalPrice)
                          : ''}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Awaiting payment */}
            {(currentStage === 'initiating' ||
              currentStage === 'awaitingPayment') && (
              <motion.div
                key="awaiting"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="space-y-4"
              >
                {paymentMethod === 'collect' && ussdInfo && (
                  <USSDInstructions
                    ussdCode={ussdInfo.ussd_code}
                    operator={ussdInfo.operator}
                    phoneNumber={normalizePhone(countryCode, phoneNumber)}
                  />
                )}
                {paymentMethod === 'link' && linkInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-blue-700" />
                      <p className="text-sm font-semibold text-blue-900">
                        Complete payment in the new tab
                      </p>
                    </div>
                    <p className="text-xs text-blue-800">
                      We'll detect your payment automatically. The transaction
                      only appears after you open the link — if you closed it,
                      use the button below to reopen.
                    </p>
                    <a
                      href={linkInfo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 underline"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" /> Reopen
                      payment link
                    </a>
                  </div>
                )}

                <NetworkPulse
                  state="connecting"
                  label={
                    paymentMethod === 'link' && txPoll.error
                      ? 'Waiting for you to open the link…'
                      : 'Waiting for payment confirmation'
                  }
                  sublabel={`Attempt ${txPoll.attempts} · ${txPoll.secondsElapsed}s elapsed · this can take up to a minute`}
                />

                <p className="text-[11px] text-center text-slate-500">
                  Reference:{' '}
                  <span className="font-mono">
                    {txReference?.slice(0, 12)}…
                  </span>
                </p>
              </motion.div>
            )}

            {/* Payment failed */}
            {currentStage === 'paymentFailed' && (
              <motion.div
                key="pfailed"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="space-y-3"
              >
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <XCircleIcon className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-rose-900">
                        Payment failed
                      </p>
                      <p className="text-xs text-rose-800 mt-0.5">
                        {paymentSettled?.reason ||
                          'The payment was not completed. No charge was made. You can try again.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      resetFlow()
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg"
                  >
                    <RefreshCwIcon className="w-4 h-4" /> Try again
                  </button>
                </div>
              </motion.div>
            )}

            {/* Registering (payment done) */}
            {(currentStage === 'paymentSuccess' ||
              currentStage === 'registering') && (
              <motion.div
                key="registering"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="space-y-3"
              >
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2Icon className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-emerald-800">
                    Payment confirmed —{' '}
                    {paymentSettled?.amount
                      ? formatCurrency(
                          paymentSettled.amount,
                          paymentSettled.currency,
                        )
                      : ''}
                  </p>
                </div>
                <NetworkPulse
                  state="connecting"
                  label="Registering with the registry"
                  sublabel={
                    operationId
                      ? `Operation ${operationId.slice(0, 10)}… This can take up to a minute.`
                      : 'Submitting registration request…'
                  }
                />
              </motion.div>
            )}

            {/* Registration failed (payment OK) */}
            {currentStage === 'registrationFailed' && (
              <motion.div
                key="rfailed"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="space-y-3"
              >
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2Icon className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-emerald-800 font-medium">
                    Payment successful ·{' '}
                    {paymentSettled?.amount
                      ? formatCurrency(
                          paymentSettled.amount,
                          paymentSettled.currency,
                        )
                      : ''}
                  </p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-rose-900">
                        Registration failed
                      </p>
                      <p className="text-xs text-rose-800 mt-0.5">
                        {typeof op.data?.details === 'string'
                          ? op.data.details
                          : 'The registry rejected the request.'}{' '}
                        Your payment is safe — you can retry the registration.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleRetryRegistration}
                    disabled={register.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-60"
                  >
                    {register.isPending ? (
                      <>
                        <LoaderIcon className="w-4 h-4 animate-spin" />{' '}
                        Retrying…
                      </>
                    ) : (
                      <>
                        <RefreshCwIcon className="w-4 h-4" /> Retry registration
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* All done */}
            {currentStage === 'registrationSuccess' && (
              <motion.div
                key="done"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3"
              >
                <CheckCircle2Icon className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <p className="text-base font-semibold text-emerald-900">
                    {checkedDomain} is yours 🎉
                  </p>
                  <p className="text-xs text-emerald-800 mt-1">
                    Registered for {years} year{years > 1 ? 's' : ''}. You can
                    now configure DNS & nameservers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setConfirmOpen(false)
                    resetFlow()
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </motion.div>
  )
}
