import { Link } from 'react-router-dom'
import { Header } from '@/features/landing/components/Header'
import { Footer } from '@/features/landing/components/Footer'
import { PipeBackground } from '../components/PipeBackground'
import { LegalBody } from './PrivacyPage'
export function TermsPage() {
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
            Terms & Conditions
          </h1>
          <p className="text-ink-500 mb-10">Last updated: April 2026</p>

          <LegalBody
            sections={[
              {
                h: '1. Agreement',
                p: 'By creating an account or using the Kakipi platform, you agree to these Terms on behalf of yourself and the institution you represent. If you do not agree, please do not use the service.',
              },
              {
                h: '2. The service',
                p: 'Kakipi provides a cloud-based school management platform. We work hard to keep the platform available 24/7 with 99.9%+ uptime, but we do not guarantee uninterrupted service and may perform planned maintenance with reasonable notice.',
              },
              {
                h: '3. Your responsibilities',
                p: 'You are responsible for keeping your credentials secure, for the accuracy of the data you upload, and for using the platform in line with applicable law — including child-protection and data-protection laws in your jurisdiction.',
              },
              {
                h: '4. Acceptable use',
                p: 'Do not use Kakipi to upload unlawful, harmful or infringing content, to attempt to gain unauthorized access, or to disrupt the platform for other users. We may suspend accounts that violate these rules.',
              },
              {
                h: '5. Fees & billing',
                p: 'Paid plans are billed monthly or annually in advance. You can cancel at any time; your subscription remains active until the end of the current billing period. Africa-region tax (VAT/WHT) is added where required.',
              },
              {
                h: '6. Your data',
                p: 'You retain full ownership of all data you upload. We only process it to provide the service, under the terms of our Privacy Policy. You can export your data at any time.',
              },
              {
                h: '7. Intellectual property',
                p: "Kakipi, its logo, design and software are our intellectual property. We grant you a limited, non-exclusive, non-transferable license to use the platform for your institution's internal purposes.",
              },
              {
                h: '8. Liability',
                p: 'To the maximum extent permitted by law, our aggregate liability is limited to the fees paid to us in the twelve months preceding the claim. We are not liable for indirect or consequential losses.',
              },
              {
                h: '9. Changes',
                p: 'We may update these Terms. We will notify you of material changes by email and/or in-product notice at least 30 days before they take effect.',
              },
              {
                h: '10. Governing law',
                p: 'These Terms are governed by the laws of the Republic of Kenya. Disputes are subject to the exclusive jurisdiction of the courts of Nairobi, without prejudice to mandatory consumer-protection rights in your country of residence.',
              },
            ]}
          />

          <p className="text-sm text-ink-500 mt-12">
            See also our{' '}
            <Link
              to="/privacy"
              className="text-brand-orange hover:underline font-semibold"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </div>
  )
}
