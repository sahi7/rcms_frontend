import { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PipeBackground } from '@/app/components/PipeBackground'
import { Users, ClipboardCheck, BookOpen, BarChart3, MessageSquare, Calendar, CheckCircle2, PlayCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Pricing } from './components/Pricing';

// AnimatedCounter helper (kept inside feature)
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setCount(Math.floor(v)),
      });
      return controls.stop;
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white text-ink-900 overflow-x-hidden">
      {/* Reactive pipe background — orange fluid flows as user scrolls */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <PipeBackground variant="light" density="normal" />
      </div>
      <Header />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-brand-cream via-white to-white">
      <div className="absolute inset-0 bg-grid-ink opacity-60 pointer-events-none" />
      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {
              opacity: 0,
            },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: 10,
              },
              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-ink-200 shadow-sm mb-6"
          >
            <Sparkles size={14} className="text-brand-orange" />
            <span className="text-xs font-semibold text-ink-700">
              Trusted by 2,000+ African institutions
            </span>
          </motion.div>

          <motion.h1
            variants={{
              hidden: {
                opacity: 0,
                y: 20,
              },
              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-ink-900 tracking-tight leading-[1.05] mb-6"
          >
            One platform, from{' '}
            <span className="relative inline-block">
              <span className="relative z-10">enrollment</span>
              <motion.span
                initial={{
                  scaleX: 0,
                }}
                animate={{
                  scaleX: 1,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.6,
                }}
                style={{
                  originX: 0,
                }}
                className="absolute inset-x-0 bottom-1 h-3 bg-brand-orange/30 -z-0"
              />
            </span>{' '}
            to <span className="text-brand-orange">graduation</span>.
          </motion.h1>

          <motion.p
            variants={{
              hidden: {
                opacity: 0,
                y: 20,
              },
              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            className="text-lg md:text-xl text-ink-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Kakipi is the modern school management platform built for Africa —
            unifying admissions, attendance, grading, finance and family
            communication in one beautifully simple place.
          </motion.p>

          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                y: 20,
              },
              visible: {
                opacity: 1,
                y: 0,
              },
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Start free trial <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/request-demo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <PlayCircle size={18} className="text-brand-orange" /> Request a
                demo
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={{
              hidden: {
                opacity: 0,
              },
              visible: {
                opacity: 1,
              },
            }}
            className="mt-6 text-xs text-ink-500"
          >
            No credit card required · Free for up to 50 students · Setup in
            minutes
          </motion.p>
        </motion.div>

        <DashboardPreview />
      </div>
    </section>

      {/* TRUSTED BY SECTION */}
      <section className="py-10 border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
            Trusted by leading institutions worldwide
          </p>
          <motion.div
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            viewport={{
              once: true,
            }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale"
          >
            {[
              'Stanford Academy',
              'Brighton College',
              'Maple Leaf Schools',
              'Pacific Institute',
              'Horizon University',
            ].map((name, i) => (
              <div
                key={i}
                className="text-xl font-bold font-heading text-gray-400"
              >
                {name}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Everything You Need to Run Your School
            </h2>
            <p className="text-lg text-gray-600">
              A comprehensive suite of tools designed specifically for modern
              educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Student Information System',
                desc: 'Centralized student records, enrollment tracking, and demographic management.',
              },
              {
                icon: ClipboardCheck,
                title: 'Attendance Tracking',
                desc: 'Real-time attendance monitoring with automated notifications to parents.',
              },
              {
                icon: BookOpen,
                title: 'Gradebook & Assessments',
                desc: 'Flexible grading systems with customizable rubrics and report cards.',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                desc: 'Data-driven insights with visual reports on student and school performance.',
              },
              {
                icon: MessageSquare,
                title: 'Communication Hub',
                desc: 'Unified messaging between teachers, parents, and administrators.',
              },
              {
                icon: Calendar,
                title: 'Schedule Management',
                desc: 'Smart timetable creation with conflict detection and room allocation.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
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
                  amount: 0.2,
                }}
                transition={{
                  delay: i * 0.1,
                }}
                whileHover={{
                  y: -5,
                  transition: {
                    duration: 0.2,
                  },
                }}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM SHOWCASE */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              className="flex-1 space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 leading-tight">
                Powerful Analytics at Your Fingertips
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Make informed decisions with real-time data. EduFlow's analytics
                engine transforms complex school data into clear, actionable
                insights for administrators and teachers.
              </p>
              <ul className="space-y-4">
                {[
                  'Identify at-risk students early with predictive modeling',
                  'Track school-wide performance trends over time',
                  'Generate comprehensive reports for accreditation',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                Explore Analytics
              </Button>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 40,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              className="flex-1 relative"
            >
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>

              {/* Mock Card */}
              <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-900">
                    Performance Overview
                  </h4>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    This Term
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">
                      Avg Attendance
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      94.2%
                    </div>
                    <div className="text-xs text-green-600 mt-1 flex items-center">
                      ↑ 2.1% from last term
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Avg Grade</div>
                    <div className="text-2xl font-bold text-gray-900">B+</div>
                    <div className="text-xs text-green-600 mt-1 flex items-center">
                      ↑ 0.4% from last term
                    </div>
                  </div>
                </div>
                <div className="h-40 bg-gray-50 rounded-xl border border-gray-100 flex items-end p-4 gap-2">
                  {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-orange-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                      style={{
                        height: `${h}%`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
            className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[100px]"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              {
                value: 2000,
                suffix: '+',
                label: 'Schools Worldwide',
              },
              {
                value: 500,
                suffix: 'K+',
                label: 'Students Managed',
              },
              {
                value: 99.9,
                suffix: '%',
                label: 'Platform Uptime',
              },
              {
                value: 50,
                suffix: '+',
                label: 'Countries Served',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
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
              >
                <div className="text-4xl md:text-5xl font-extrabold text-white font-heading mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-orange-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <Pricing />

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Loved by Educators Worldwide
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  'EduFlow completely transformed how we manage our daily operations. The analytics dashboard alone saved us hundreds of hours.',
                author: 'Sarah Jenkins',
                role: 'Principal',
                school: 'Lincoln High School',
                color: 'bg-blue-500',
              },
              {
                quote:
                  "The most intuitive SIS we've ever used. Teachers adopted it immediately, and parent engagement has skyrocketed.",
                author: 'David Chen',
                role: 'IT Director',
                school: 'Westside Academy',
                color: 'bg-green-500',
              },
              {
                quote:
                  'Customer support is phenomenal. They helped us migrate 10 years of data seamlessly over a single weekend.',
                author: 'Maria Rodriguez',
                role: 'Superintendent',
                school: 'Valley School District',
                color: 'bg-purple-500',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
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
                className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-l-orange-500 border-y border-r border-gray-100"
              >
                <p className="text-gray-600 italic mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {testimonial.author
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.role}, {testimonial.school}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.h2
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
            className="text-3xl md:text-5xl font-bold font-heading text-white mb-6"
          >
            Ready to Transform Your School?
          </motion.h2>
          <motion.p
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
              delay: 0.1,
            }}
            className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of schools already using EduFlow to streamline
            operations and improve student outcomes.
          </motion.p>
          <motion.div
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
              delay: 0.2,
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/onboarding">
              <Button className="w-full sm:w-auto h-12 px-8 text-base bg-white text-orange-600 hover:bg-gray-50 shadow-lg">
                Start Free Trial
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 text-base border-white text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// ==================== DASHBOARD PREVIEW ====================
function DashboardPreview() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.5,
        duration: 0.8,
        ease: 'easeOut',
      }}
      className="mt-16 md:mt-24 mx-auto max-w-6xl relative"
    >
      <div className="absolute -inset-6 bg-gradient-to-tr from-brand-orange/10 via-transparent to-brand-amber/10 blur-2xl rounded-3xl" />

      <div className="relative rounded-2xl bg-white border border-ink-200 shadow-2xl shadow-ink-900/10 overflow-hidden">
        {/* Browser chrome */}
        <div className="h-10 bg-ink-50 border-b border-ink-100 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="mx-auto w-1/2 h-5 bg-white rounded-md border border-ink-200 flex items-center px-3">
            <span className="text-[10px] text-ink-400 font-mono">
              app.kakipi.africa/dashboard
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12">
          {/* Sidebar */}
          <aside className="hidden md:flex col-span-3 lg:col-span-2 border-r border-ink-100 bg-ink-50/50 p-4 flex-col gap-1">
            <div className="px-2 py-3 mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-ink-900 flex items-center justify-center">
                <div className="w-1.5 h-3 bg-white rounded-sm" />
              </div>
              <span className="text-sm font-extrabold text-ink-900 lowercase">
                kakipi
              </span>
            </div>
            {[
              'Dashboard',
              'Students',
              'Attendance',
              'Gradebook',
              'Finance',
              'Messages',
              'Timetable',
            ].map((l, i) => (
              <div
                key={l}
                className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 ${i === 1 ? 'bg-brand-orange/10 text-brand-orange' : 'text-ink-600'}`}
              >
                <div
                  className={`w-1 h-1 rounded-full ${i === 1 ? 'bg-brand-orange' : 'bg-ink-300'}`}
                />
                {l}
              </div>
            ))}
          </aside>

          {/* Main */}
          <main className="col-span-12 md:col-span-9 lg:col-span-10 p-5 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs text-ink-500 mb-1">
                  Good morning, Amina
                </div>
                <div className="text-lg md:text-xl font-bold text-ink-900">
                  Students overview
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-8 px-3 rounded-md border border-ink-200 text-xs text-ink-600 flex items-center">
                  This term
                </div>
                <div className="h-8 px-3 rounded-md bg-brand-orange text-white text-xs font-semibold flex items-center">
                  + Add student
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                {
                  label: 'Enrolled',
                  value: '1,284',
                  delta: '+4.2%',
                },
                {
                  label: 'Attendance',
                  value: '94.2%',
                  delta: '+2.1%',
                },
                {
                  label: 'Avg. grade',
                  value: 'B+',
                  delta: '+0.4',
                },
                {
                  label: 'Fees collected',
                  value: '₦82M',
                  delta: '+12%',
                },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl border border-ink-100 bg-white p-3 md:p-4"
                >
                  <div className="text-[10px] md:text-xs text-ink-500 mb-1">
                    {k.label}
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-ink-900">
                    {k.value}
                  </div>
                  <div className="text-[10px] md:text-xs text-green-600 font-semibold mt-0.5">
                    ↑ {k.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-xl border border-ink-100 p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-semibold text-ink-700">
                    Attendance trend
                  </div>
                  <div className="text-[10px] text-ink-400">Last 7 days</div>
                </div>
                <div className="h-32 md:h-40 relative">
                  <svg
                    viewBox="0 0 300 120"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#ea580c"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#ea580c"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,90 L40,70 L80,75 L120,50 L160,58 L200,35 L240,42 L300,20 L300,120 L0,120 Z"
                      fill="url(#areaG)"
                    />
                    <path
                      d="M0,90 L40,70 L80,75 L120,50 L160,58 L200,35 L240,42 L300,20"
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </div>
              <div className="rounded-xl border border-ink-100 p-4 bg-white">
                <div className="text-xs font-semibold text-ink-700 mb-3">
                  Today's schedule
                </div>
                <div className="space-y-2.5">
                  {[
                    {
                      t: '08:00',
                      s: 'Assembly · Grade 10',
                    },
                    {
                      t: '10:30',
                      s: 'Mathematics · Form 3B',
                    },
                    {
                      t: '13:00',
                      s: 'Staff standup',
                    },
                  ].map((e) => (
                    <div key={e.t} className="flex items-start gap-2">
                      <div className="text-[10px] font-mono text-brand-orange font-bold w-10">
                        {e.t}
                      </div>
                      <div className="text-[11px] text-ink-700">{e.s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  )
}