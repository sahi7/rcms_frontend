import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Heart, Globe2, Sparkles, ArrowRight } from 'lucide-react'
import { Header } from '@/features/landing/components/Header'
import { Footer } from '@/features/landing/components/Footer'
import { Button } from '@/components/ui/button'
import { PipeBackground } from '../components/PipeBackground'
export function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-70">
        <PipeBackground variant="light" density="normal" />
      </div>
      <Header />

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="pt-32 md:pt-40 pb-20 px-6 bg-gradient-to-b from-brand-cream via-white to-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.p
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="text-xs font-bold uppercase tracking-widest text-brand-orange mb-3"
            >
              About kakipi
            </motion.p>
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="text-4xl md:text-6xl font-extrabold text-ink-900 tracking-tight leading-tight mb-6"
            >
              Built in Africa. <br /> Built{' '}
              <span className="text-brand-orange">for</span> Africa.
            </motion.h1>
            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="text-lg md:text-xl text-ink-600 max-w-2xl mx-auto leading-relaxed"
            >
              Kakipi exists because African schools deserve software that
              understands them — the languages, the curricula, the mobile-money
              rails, the realities. One platform, from enrollment to graduation.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Compass,
                title: 'Our mission',
                body: 'Give every African school the operating system it needs to run beautifully — no matter its size, location or budget.',
              },
              {
                icon: Heart,
                title: 'Our promise',
                body: 'We build with schools, not just for them. Every feature starts with a conversation in a real staffroom.',
              },
              {
                icon: Globe2,
                title: 'Our reach',
                body: 'From Cape Town to Cairo, Lagos to Kigali — already trusted by 2,000+ institutions across 24 African countries.',
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: i * 0.1,
                }}
                className="bg-white rounded-3xl border border-ink-100 shadow-sm p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mb-5">
                  <c.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-ink-900 mb-2">
                  {c.title}
                </h3>
                <p className="text-ink-600 leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6 bg-ink-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-ink-dark opacity-40" />
          <div className="max-w-5xl mx-auto relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-3 text-brand-orange">
                <Sparkles size={14} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  What we believe
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Good software for schools is{' '}
                <span className="text-brand-orange">quiet software</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  t: 'Clarity over cleverness',
                  b: "The best feature is the one that disappears. If a teacher can't use it on day one, we haven't shipped it yet.",
                },
                {
                  t: 'African context first',
                  b: 'KNEC, WAEC, NECO, M-Pesa, Flutterwave, Airtel Money, French, Swahili, Yoruba — not afterthoughts. Defaults.',
                },
                {
                  t: 'Data stays yours',
                  b: 'You own your data. Full exports, anytime, no lock-in. Servers in the region where you operate.',
                },
                {
                  t: 'We show up',
                  b: 'Real humans, real timezone. Our support team has been in your shoes — many were teachers themselves.',
                },
              ].map((v) => (
                <div
                  key={v.t}
                  className="rounded-2xl border border-ink-800 p-6 bg-ink-800/40"
                >
                  <h4 className="font-bold text-white mb-1">{v.t}</h4>
                  <p className="text-ink-300 text-sm leading-relaxed">{v.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-ink-900 tracking-tight mb-4">
              Want to meet the team?
            </h2>
            <p className="text-ink-600 text-lg mb-8">
              Book a call — we love talking about schools almost as much as we
              love building for them.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/request-demo">
                <Button size="lg">
                  Request a demo <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
