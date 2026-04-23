import React, { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Monitor, Users as UsersIcon } from 'lucide-react'
import { Header } from '@/features/landing/components/Header'
import { Footer } from '@/features/landing/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PipeBackground } from '../components/PipeBackground'
import { uploadApi } from '@/lib/api'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/utils'

interface DemoForm {
  name: string
  email: string
  institutionType: string
  demoType: 'online' | 'offline' | ''
  details: string
  otherInfo: string
}

export function RequestDemoPage() {
  const [form, setForm] = useState<DemoForm>({
    name: '',
    email: '',
    institutionType: '',
    demoType: '',
    details: '',
    otherInfo: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof DemoForm, string>>>(
    {},
  )
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = <K extends keyof DemoForm>(k: K, v: DemoForm[K]) => {
    setForm((f) => ({
      ...f,
      [k]: v,
    }))
    // Clear error for this field while typing
    setErrors((e) => ({
      ...e,
      [k]: undefined,
    }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof DemoForm, string>> = {}

    if (!form.name.trim()) errs.name = 'Your name is required'
    if (!form.email.trim()) errs.email = 'Work email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Please enter a valid email address'

    if (!form.institutionType) errs.institutionType = 'Please select your institution type'
    if (!form.demoType) errs.demoType = 'Please choose a demo type'
    if (!form.details.trim())
      errs.details = 'Please tell us about your school / needs'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Scroll to first error field (only called after failed submit)
  const scrollToFirstError = () => {
    const firstErrorKey = Object.keys(errors)[0] as keyof DemoForm | undefined
    if (!firstErrorKey) return

    let id = ''
    if (firstErrorKey === 'name') id = 'name'
    else if (firstErrorKey === 'email') id = 'email'
    else if (firstErrorKey === 'institutionType') id = 'institutionType'
    else if (firstErrorKey === 'demoType') id = 'demoType' // we use the container
    else if (firstErrorKey === 'details') id = 'details'

    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const isValid = validate()

    if (!isValid) {
      // Only scroll when submit fails — not while typing
      scrollToFirstError()
      return
    }

    setSubmitting(true)

    try {
      await uploadApi.post('/request-demo', {
        subject: 'Demo request',
        ...form,
      })

      toast.success('Demo request sent successfully!')
      setSubmitted(true)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send demo request'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg"
          >
            <div className="w-20 h-20 rounded-full bg-brand-orange text-white flex items-center justify-center mx-auto mb-6">
              <Check size={40} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-ink-900 mb-3">
              Request received.
            </h1>
            <p className="text-ink-600 mb-8">
              Thanks, {form.name.split(' ')[0]} — our team will reach out within
              one working day to schedule your demo.
            </p>
            <Link to="/">
              <Button>Back to home</Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <PipeBackground variant="light" density="low" />
      </div>
      <Header />

      <main className="flex-1 pt-28 md:pt-36 pb-16 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-3">
              Request a demo
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-ink-900 tracking-tight mb-3">
              See Kakipi in action.
            </h1>
            <p className="text-ink-600 text-lg max-w-xl mx-auto">
              Tell us about your institution and we'll tailor a 30-minute
              walkthrough to exactly what you need.
            </p>
          </motion.div>

          <form
            onSubmit={onSubmit}
            className="bg-white rounded-3xl shadow-xl shadow-ink-900/5 border border-brand-orange/10 p-6 md:p-10 space-y-6"
          >
            {/* Name */}
            <div id="name" className="space-y-1.5">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Amina Njoroge"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div id="email" className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@school.ac.ke"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Institution Type */}
            <div id="institutionType" className="space-y-1.5">
              <Label htmlFor="institutionType">Institution type</Label>
              <Select
                value={form.institutionType}
                onValueChange={(v) => update('institutionType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preschool">Pre-school / ECD centre</SelectItem>
                  <SelectItem value="primary">Primary school</SelectItem>
                  <SelectItem value="secondary">Secondary / High school</SelectItem>
                  <SelectItem value="combined">Combined (K-12)</SelectItem>
                  <SelectItem value="tertiary">Tertiary / University</SelectItem>
                  <SelectItem value="vocational">Vocational / TVET</SelectItem>
                  <SelectItem value="network">Multi-campus network</SelectItem>
                  <SelectItem value="ministry">Ministry / District</SelectItem>
                </SelectContent>
              </Select>
              {errors.institutionType && (
                <p className="text-xs text-red-600 mt-1">{errors.institutionType}</p>
              )}
            </div>

            {/* Demo Type */}
            <div id="demoType" className="space-y-2">
              <Label>Demo type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DemoTypeOption
                  active={form.demoType === 'online'}
                  onClick={() => update('demoType', 'online')}
                  icon={<Monitor size={20} />}
                  title="Online"
                  desc="Video call · 30 minutes · Your team joins from anywhere."
                />
                <DemoTypeOption
                  active={form.demoType === 'offline'}
                  onClick={() => update('demoType', 'offline')}
                  icon={<UsersIcon size={20} />}
                  title="Offline"
                  desc="In-person · On-site visit available across Africa."
                />
              </div>
              {errors.demoType && (
                <p className="text-xs text-red-600 mt-1">{errors.demoType}</p>
              )}
            </div>

            {/* Details */}
            <div id="details" className="space-y-1.5">
              <Label htmlFor="details">
                Details · institutional structure · needs
              </Label>
              <Textarea
                id="details"
                value={form.details}
                onChange={(e) => update('details', e.target.value)}
                placeholder="Tell us about your campuses, grades, current tools, pain points and what success would look like…"
                rows={5}
              />
              {errors.details && (
                <p className="text-xs text-red-600 mt-1">{errors.details}</p>
              )}
            </div>

            {/* Other Info (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="otherInfo">
                Other important info{' '}
                <span className="text-ink-400 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="otherInfo"
                value={form.otherInfo}
                onChange={(e) => update('otherInfo', e.target.value)}
                placeholder="Preferred dates, language, accessibility needs, anything else…"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-brand-orange hover:bg-brand-orange/90"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending…
                </>
              ) : (
                <>
                  Request my demo <ArrowRight size={16} />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-ink-500">
              By submitting you agree to our{' '}
              <Link to="/privacy" className="text-brand-orange hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function DemoTypeOption({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        active
          ? 'border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/20'
          : 'border-ink-200 bg-white hover:border-ink-300'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            active ? 'bg-brand-orange text-white' : 'bg-ink-100 text-ink-600'
          }`}
        >
          {icon}
        </div>
        <span className="font-bold text-ink-900">{title}</span>
      </div>
      <p className="text-xs text-ink-500">{desc}</p>
    </button>
  )
}