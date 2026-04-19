import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  LoaderIcon,
  LockIcon,
  UserIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useCreateDomainContact,
  useDomainContact,
} from '../../hooks/useContact'
import { useDomainInfo } from '../../hooks/useDomainInfo'
import type { DomainContact } from '@/types/domains'
import { Modal } from '@/components/Modal'
import { SearchableSelect } from '@/components/SearchableSelect'
import { getErrorMessage } from '@/lib/utils'
import { NetworkPulse } from '@/components/NetworkPulse'
const COUNTRIES = [
  {
    value: 'US',
    label: 'United States',
  },
  {
    value: 'CM',
    label: 'Cameroon',
  },
  {
    value: 'GB',
    label: 'United Kingdom',
  },
  {
    value: 'NG',
    label: 'Nigeria',
  },
  {
    value: 'KE',
    label: 'Kenya',
  },
  {
    value: 'GH',
    label: 'Ghana',
  },
  {
    value: 'ZA',
    label: 'South Africa',
  },
  {
    value: 'FR',
    label: 'France',
  },
  {
    value: 'DE',
    label: 'Germany',
  },
  {
    value: 'CA',
    label: 'Canada',
  },
]
const emptyForm: DomainContact = {
  firstName: '',
  lastName: '',
  organization: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  country: '',
  stateProvince: '',
  postalCode: '',
  phone: '',
  phoneExt: '',
  fax: '',
  faxExt: '',
  taxNumber: '',
}
function Field({
  label,
  required,
  children,
  error,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${props.className || ''}`}
    />
  )
}
export function ContactDetailsSection() {
  const info = useDomainInfo()
  const contactId = info.data?.DomainContactID || null
  const contact = useDomainContact(contactId)
  const create = useCreateDomainContact()
  const [form, setForm] = useState<DomainContact>(emptyForm)
  const [errors, setErrors] = useState<
    Partial<Record<keyof DomainContact, string>>
  >({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  // ---- Existing contact (read-only) view ----
  if (contactId) {
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
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2Icon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-emerald-800">
              Contact details on file
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Contact ID <span className="font-mono">{contactId}</span>. These
              details cannot be modified.
            </p>
          </div>
        </div>

        {contact.isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <NetworkPulse state="connecting" label="Fetching contact details" />
          </div>
        ) : contact.isError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            {getErrorMessage(contact.error)}
            <button
              onClick={() => contact.refetch()}
              className="ml-2 underline font-medium"
            >
              Retry
            </button>
          </div>
        ) : contact.data ? (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {[
              ['Name', `${contact.data.firstName} ${contact.data.lastName}`],
              ['Organization', contact.data.organization || '—'],
              ['Email', contact.data.email],
              [
                'Phone',
                `${contact.data.phone}${contact.data.phoneExt ? ' ext. ' + contact.data.phoneExt : ''}`,
              ],
              [
                'Address',
                [
                  contact.data.address1,
                  contact.data.address2,
                  contact.data.city,
                  contact.data.stateProvince,
                  contact.data.postalCode,
                  contact.data.country,
                ]
                  .filter(Boolean)
                  .join(', '),
              ],
              ['Tax number', contact.data.taxNumber || '—'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
              >
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider w-full sm:w-40 shrink-0">
                  {k}
                </span>
                <span className="text-sm text-slate-800 break-words">{v}</span>
              </div>
            ))}
            <div className="px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
              <LockIcon className="w-3.5 h-3.5" /> Contact details are immutable
            </div>
          </div>
        ) : null}
      </motion.div>
    )
  }
  // ---- Create contact form ----
  const update = <K extends keyof DomainContact>(k: K, v: DomainContact[K]) => {
    setForm((f) => ({
      ...f,
      [k]: v,
    }))
    setErrors((e) => ({
      ...e,
      [k]: undefined,
    }))
  }
  const validate = (): boolean => {
    const e: Partial<Record<keyof DomainContact, string>> = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Invalid email'
    if (!form.address1.trim()) e.address1 = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.country.trim()) e.country = 'Required'
    if (!form.phone.trim()) e.phone = 'Required'
    else if (!/^\+?[0-9.\-\s()]{6,}$/.test(form.phone))
      e.phone = 'Use format +1.1234567890'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handleReview = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    setConfirmOpen(true)
  }
  const handleSubmit = async () => {
    try {
      const res = await create.mutateAsync(form)
      toast.success(`Contact saved (ID: ${res.contactId.slice(0, 8)}…)`)
      setConfirmOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save contact'))
    }
  }
  return (
    <>
      <motion.form
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        onSubmit={handleReview}
        className="space-y-5"
      >
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Contact details can only be saved <u>once</u> and are immutable.
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Double-check every field before submitting. You won't be able to
              edit this later.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Registrant</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" required error={errors.firstName}>
              <Input
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                placeholder="John"
              />
            </Field>
            <Field label="Last name" required error={errors.lastName}>
              <Input
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                placeholder="Doe"
              />
            </Field>
            <Field label="Organization">
              <Input
                value={form.organization || ''}
                onChange={(e) => update('organization', e.target.value)}
                placeholder="My Institution"
              />
            </Field>
            <Field label="Email" required error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="admin@example.com"
              />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <Input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+1.1234567890"
              />
            </Field>
            <Field label="Phone ext.">
              <Input
                value={form.phoneExt || ''}
                onChange={(e) => update('phoneExt', e.target.value)}
                placeholder="256"
              />
            </Field>
            <Field label="Address line 1" required error={errors.address1}>
              <Input
                value={form.address1}
                onChange={(e) => update('address1', e.target.value)}
                placeholder="286 King St."
              />
            </Field>
            <Field label="Address line 2">
              <Input
                value={form.address2 || ''}
                onChange={(e) => update('address2', e.target.value)}
                placeholder="Suite 100"
              />
            </Field>
            <Field label="City" required error={errors.city}>
              <Input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="San Francisco"
              />
            </Field>
            <Field label="State / Province">
              <Input
                value={form.stateProvince || ''}
                onChange={(e) => update('stateProvince', e.target.value)}
                placeholder="CA"
              />
            </Field>
            <Field label="Postal code">
              <Input
                value={form.postalCode || ''}
                onChange={(e) => update('postalCode', e.target.value)}
                placeholder="94107"
              />
            </Field>
            <SearchableSelect
              label="Country"
              required
              options={COUNTRIES}
              value={form.country || null}
              onChange={(v) => update('country', (v as string) || '')}
              placeholder="Select country"
            />
            <Field label="Tax number">
              <Input
                value={form.taxNumber || ''}
                onChange={(e) => update('taxNumber', e.target.value)}
                placeholder="123456789"
              />
            </Field>
          </div>
          {errors.country && (
            <p className="text-xs text-rose-600 -mt-2">{errors.country}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm"
          >
            Review & save
          </button>
        </div>
      </motion.form>

      <Modal
        isOpen={confirmOpen}
        onClose={() => !create.isPending && setConfirmOpen(false)}
        title="Confirm contact details"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
            <AlertTriangleIcon className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              This action is final. These details will be permanently linked to
              your account and cannot be changed.
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 space-y-1 max-h-64 overflow-y-auto">
            <div>
              <span className="text-slate-500">Name:</span> {form.firstName}{' '}
              {form.lastName}
            </div>
            <div>
              <span className="text-slate-500">Email:</span> {form.email}
            </div>
            <div>
              <span className="text-slate-500">Phone:</span> {form.phone}
            </div>
            <div>
              <span className="text-slate-500">Address:</span>{' '}
              {[
                form.address1,
                form.address2,
                form.city,
                form.stateProvince,
                form.postalCode,
                form.country,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
            {form.organization && (
              <div>
                <span className="text-slate-500">Organization:</span>{' '}
                {form.organization}
              </div>
            )}
          </div>
          {create.isPending && (
            <NetworkPulse
              state="connecting"
              label="Registering contact with registry"
              sublabel="Please do not close this window"
            />
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={create.isPending}
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-50"
            >
              Go back
            </button>
            <button
              type="button"
              disabled={create.isPending}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-70"
            >
              {create.isPending ? (
                <>
                  <LoaderIcon className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                'Confirm & save'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
