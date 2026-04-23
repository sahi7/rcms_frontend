// src/components/Footer.tsx
import { Link } from 'react-router-dom'
import { Logo } from '@/assets/Logo'
import { Mail, MapPin } from 'lucide-react'
export function Footer() {
  return (
    <footer className="bg-ink-900 text-ink-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-ink-dark opacity-40 pointer-events-none" />
      <div className="container mx-auto px-6 py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <Logo variant="light" size={32} />
            <p className="mt-4 text-sm text-ink-400 max-w-xs leading-relaxed">
              One platform, from enrollment to graduation. Built for African
              schools, ready for the continent.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-ink-400">
                <Mail size={14} className="text-brand-orange" />
                <a
                  href="mailto:hello@kakipi.africa"
                  className="hover:text-white"
                >
                  hello@kakipi.africa
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink-400">
                <MapPin size={14} className="text-brand-orange" />
                <span>Douala · Lagos · Accra</span>
              </div>
            </div>
          </div>

          <FooterCol
            title="Product"
            links={[
              {
                to: '/#features',
                label: 'Features',
              },
              {
                to: '/#pricing',
                label: 'Pricing',
              },
              {
                to: '/request-demo',
                label: 'Request demo',
              },
              {
                to: '/login',
                label: 'Sign in',
              },
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              {
                to: '/about',
                label: 'About',
              },
              {
                to: '/contact',
                label: 'Contact',
              },
            ]}
          />

          <FooterCol
            title="Legal"
            links={[
              {
                to: '/privacy',
                label: 'Privacy policy',
              },
              {
                to: '/terms',
                label: 'Terms & conditions',
              },
            ]}
          />
        </div>

        <div className="mt-16 pt-8 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Kakipi. Made in Africa, for Africa.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="text-xs text-ink-400">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
function FooterCol({
  title,
  links,
}: {
  title: string
  links: {
    to: string
    label: string
  }[]
}) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            {l.to.startsWith('/#') ? (
              <a
                href={l.to}
                className="text-sm text-ink-400 hover:text-brand-orange transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                to={l.to}
                className="text-sm text-ink-400 hover:text-brand-orange transition-colors"
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
