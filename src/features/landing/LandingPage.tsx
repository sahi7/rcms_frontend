import { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, ClipboardCheck, BookOpen, BarChart3, MessageSquare, Calendar, CheckCircle2, PlayCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-white font-sans selection:bg-orange-100 selection:text-orange-900">
      <Header />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gray-50">
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          />
        </div>

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
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight font-heading mb-6 leading-tight"
            >
              The Modern Platform for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                School Excellence
              </span>
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
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              From admissions to alumni — manage every aspect of your
              institution with AI-powered tools trusted by 2,000+ schools
              worldwide.
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
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/onboarding">
                <Button className="w-full sm:w-auto h-12 px-8 text-base bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/25">
                  Get Started Free
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 text-base border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <PlayCircle className="mr-2 h-5 w-5 text-orange-500" /> Watch
                Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview Visual */}
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
              delay: 0.6,
              duration: 0.8,
              ease: 'easeOut',
            }}
            className="mt-16 md:mt-24 mx-auto max-w-5xl relative perspective-1000"
          >
            <div className="relative rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden transform rotate-x-12 -rotate-y-6 scale-100 md:scale-105 transition-transform duration-700 hover:rotate-x-0 hover:rotate-y-0">
              {/* Fake Browser Header */}
              <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="mx-auto w-1/2 h-5 bg-white rounded-md border border-gray-200"></div>
              </div>
              {/* Fake Dashboard Layout */}
              <div className="flex h-[400px] md:h-[500px]">
                {/* Sidebar */}
                <div className="w-48 md:w-64 bg-gray-50 border-r border-gray-200 p-4 hidden sm:block">
                  <div className="h-8 w-3/4 bg-gray-200 rounded mb-8"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-6 rounded ${i === 2 ? 'bg-orange-100 w-full' : 'bg-gray-200 w-5/6'}`}
                      ></div>
                    ))}
                  </div>
                </div>
                {/* Main Content */}
                <div className="flex-1 p-6 bg-white">
                  <div className="flex justify-between items-center mb-8">
                    <div className="h-8 w-48 bg-gray-200 rounded"></div>
                    <div className="h-8 w-24 bg-orange-500 rounded text-white"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between"
                      >
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-8 w-3/4 bg-gray-300 rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-48 bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="h-full w-full border-b border-l border-gray-300 relative">
                      {/* Fake chart line */}
                      <svg
                        className="absolute inset-0 h-full w-full"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 100"
                      >
                        <path
                          d="M0,100 L20,60 L40,80 L60,30 L80,50 L100,10"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="3"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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