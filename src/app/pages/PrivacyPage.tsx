import { Link } from 'react-router-dom'
import { Header } from '@/features/landing/components/Header'
import { Footer } from '@/features/landing/components/Footer'
import { PipeBackground } from '../components/PipeBackground'
export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <PipeBackground variant="light" density="low" />
      </div>
      <Header />
      <main className="flex-1 pt-28 md:pt-36 pb-16 px-6 relative z-10">
        <article className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-3">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-ink-900 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-ink-500 mb-10">Last updated: April 2026</p>

          <LegalBody
            sections={[
              {
                h: '1. Who we are',
                p: 'Kakipi ("we", "our", "us") is a school management platform operated for educational institutions across Africa. This policy explains how we collect, use and protect your personal data when you use kakipi.africa and our services.',
              },
              {
                h: '2. What we collect',
                p: 'We collect only what we need to run your school software well: contact details (name, email, phone), account credentials, school records you enter or upload (student, staff, academic, financial data), and standard product telemetry (device, browser, pages visited).',
              },
              {
                h: '3. How we use it',
                p: 'To provide and improve the service, to communicate with you about your account, to keep the platform secure, and to comply with our legal obligations. We never sell your data. We never train third-party AI models on your school data without explicit opt-in.',
              },
              {
                h: '4. Who sees it',
                p: 'Only you and people you explicitly authorize inside your institution. A small set of vetted sub-processors (hosting, payments, messaging) help us run the service under strict data-protection agreements.',
              },
              {
                h: '5. Where it lives',
                p: 'Data is hosted in regional cloud regions wherever possible (South Africa, Kenya, Nigeria). You can request a full export or deletion at any time by emailing privacy@kakipi.africa.',
              },
              {
                h: '6. Your rights',
                p: 'You have the right to access, correct, export and delete your personal data. For learners under 18, these rights are exercised by a parent or guardian.',
              },
              {
                h: '7. Security',
                p: 'All traffic is encrypted (TLS 1.3). Data at rest is encrypted (AES-256). We run daily backups and keep audit logs. We disclose any material incident to affected customers promptly.',
              },
              {
                h: '8. Contact',
                p: 'Questions? Email privacy@kakipi.africa or use our contact form.',
              },
            ]}
          />

          <p className="text-sm text-ink-500 mt-12">
            See also our{' '}
            <Link
              to="/terms"
              className="text-brand-orange hover:underline font-semibold"
            >
              Terms & Conditions
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </div>
  )
}
export function LegalBody({
  sections,
}: {
  sections: {
    h: string
    p: string
  }[]
}) {
  return (
    <div className="prose prose-ink max-w-none space-y-8">
      {sections.map((s) => (
        <section key={s.h}>
          <h2 className="text-xl font-bold text-ink-900 mb-2">{s.h}</h2>
          <p className="text-ink-600 leading-relaxed">{s.p}</p>
        </section>
      ))}
    </div>
  )
}
