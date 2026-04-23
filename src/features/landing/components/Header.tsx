import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/assets/Logo'
import { Button } from '@/components/ui/button'

const nav = [
  { to: '/#features', label: 'Features' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Top Header Bar */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/85 backdrop-blur-md border-b border-ink-100' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Logo size={30} />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm font-medium text-ink-700 hover:text-brand-orange transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/request-demo">
              <Button size="sm">Request demo</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 -mr-2 text-ink-900"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu – now OUTSIDE the header so it’s never affected by header transparency */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-white md:hidden"   // z-[999] ensures it's always on top
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-ink-100">
              <Logo size={30} />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col p-6 gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-lg font-medium text-ink-900 border-b border-ink-100"
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex flex-col gap-3 mt-6">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/request-demo" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Request demo</Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}