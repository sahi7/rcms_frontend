import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Mail, MessageSquare, MapPin } from 'lucide-react'
import { Header } from '@/features/landing/components/Header'
import { Footer } from '@/features/landing/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PipeBackground } from '../components/PipeBackground'
interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}
export function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactForm, string>>
  >({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const update = <K extends keyof ContactForm>(k: K, v: ContactForm[K]) => {
    setForm((f) => ({
      ...f,
      [k]: v,
    }))
    setErrors((e) => ({
      ...e,
      [k]: undefined,
    }))
  }
  const validate = () => {
    const errs: Partial<Record<keyof ContactForm, string>> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.subject.trim()) errs.subject = 'Required'
    if (!form.message.trim()) errs.message = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })
    } catch {
      // handled by data layer
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <PipeBackground variant="light" density="low" />
      </div>
      <Header />

      <main className="flex-1 pt-28 md:pt-36 pb-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-center mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-3">
              Get in touch
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-ink-900 tracking-tight mb-3">
              Let's talk.
            </h1>
            <p className="text-ink-600 text-lg max-w-xl mx-auto">
              Questions, partnerships, press — whatever it is, we read every
              message.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <InfoCard
                icon={<Mail size={18} />}
                title="Email"
                lines={['hello@kakipi.africa', 'support@kakipi.africa']}
              />
              <InfoCard
                icon={<MessageSquare size={18} />}
                title="Sales"
                lines={['sales@kakipi.africa', '+254 (0) 700 000 000']}
              />
              <InfoCard
                icon={<MapPin size={18} />}
                title="Offices"
                lines={['Nairobi · Kenya', 'Lagos · Nigeria', 'Accra · Ghana']}
              />
            </div>

            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="bg-white rounded-3xl border border-ink-100 shadow-xl shadow-ink-900/5 p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-orange text-white flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-ink-900 mb-2">
                    Message sent.
                  </h2>
                  <p className="text-ink-600 mb-6">
                    We'll get back to you within one working day.
                  </p>
                  <Link to="/">
                    <Button variant="outline">Back to home</Button>
                  </Link>
                </motion.div>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="bg-white rounded-3xl border border-ink-100 shadow-xl shadow-ink-900/5 p-6 md:p-8 space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="Your name"
                        error={errors.name}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="you@school.ac.ke"
                        error={errors.email}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={form.subject}
                      onChange={(e) => update('subject', e.target.value)}
                      placeholder="What's this about?"
                      error={errors.subject}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      placeholder="Tell us more…"
                      error={errors.message}
                      rows={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{' '}
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
function InfoCard({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode
  title: string
  lines: string[]
}) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-5 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-1.5">
          {title}
        </div>
        {lines.map((l) => (
          <div key={l} className="text-sm font-semibold text-ink-900">
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}
