// src/features/landing/LandingPage.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  PlayCircle,
  Check,
} from "lucide-react";
import GlassHeader from "@/features/landing/GlassHeader";
import GlassFooter from "@/features/landing/GlassFooter";
import PricingSection from "./components/PricingSection";

export default function LandingPage() {
  // Animation variants – fixed typing
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-[#f1f3f5] overflow-x-hidden">
      <GlassHeader />

      {/* HERO – Maestro level */}
      <header className="relative pt-20 md:pt-28 pb-16 md:pb-24">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            {/* Left text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-7"
            >
              <div className="inline-flex items-center gap-x-2 glass px-6 py-2 rounded-3xl text-sm font-medium mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A00] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF7A00]"></span>
                </span>
                NEW AI STUDIO • Classe365 inspired
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-[82px] font-semibold tracking-[-2px] leading-none mb-6">
                The most beautiful<br />
                school OS on earth.
              </h1>

              <p className="text-2xl text-slate-600 max-w-xl mb-10">
                Admissions • Academics • Finance • AI reports.<br />
                One elegant platform. Zero spreadsheets.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="btn-hover px-10 py-6 bg-[#FF7A00] text-white rounded-3xl font-semibold text-xl flex items-center gap-x-3"
                >
                  Get started free
                  <ArrowRight className="w-6 h-6" />
                </Link>

                <button
                  onClick={() => window.open("https://www.youtube.com/watch?v=dQw4w9wgxcQ", "_blank")}
                  className="flex items-center gap-x-3 px-8 py-6 glass rounded-3xl font-medium text-slate-700 hover:text-slate-900"
                >
                  <PlayCircle className="w-8 h-8 text-[#FF7A00]" />
                  <span className="text-lg">Watch 90-second demo</span>
                </button>
              </div>

              <div className="mt-12 flex items-center gap-x-8 text-sm">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 glass rounded-2xl border-2 border-white flex items-center justify-center text-xs font-bold">S{i}</div>
                  ))}
                </div>
                <div>
                  <div className="font-medium">Trusted by 3,942 schools</div>
                  <div className="text-xs text-slate-500">in 47 countries • 4.98/5 average rating</div>
                </div>
              </div>
            </motion.div>

            {/* Right animated mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="md:col-span-5 relative"
            >
              <div className="glass rounded-3xl p-4 shadow-2xl border border-white/40">
                <div className="bg-white rounded-2xl overflow-hidden aspect-[16/10] relative">
                  {/* Fake dashboard header */}
                  <div className="h-14 bg-slate-900 flex items-center px-6 text-white text-sm font-medium">
                    <div className="flex-1">Dashboard • Spring Semester 2026</div>
                    <div className="flex items-center gap-x-2 text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      312 online
                    </div>
                  </div>

                  {/* Dynamic content inside mock */}
                  <div className="p-6 grid grid-cols-3 gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="glass-light rounded-2xl p-4 text-center"
                    >
                      <div className="text-[#FF7A00] text-3xl">98</div>
                      <div className="text-xs uppercase tracking-widest">Attendance today</div>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="glass-light rounded-2xl p-4 flex flex-col justify-center"
                    >
                      <div className="text-xs font-medium">Fees collected</div>
                      <div className="text-3xl font-semibold text-emerald-600">₦4.8M</div>
                    </motion.div>

                    <motion.div
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="glass-light rounded-2xl p-4 flex items-end gap-x-1"
                    >
                      {[60, 85, 45, 92, 78].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#FF7A00] rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -top-6 -right-6 glass px-5 py-3 rounded-3xl shadow-xl flex items-center gap-x-2 text-sm font-semibold"
              >
                <Check className="w-5 h-5 text-emerald-500" />
                AI report generated
              </motion.div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* TRUST BAR */}
      <div className="py-8 border-b bg-white/60">
        <div className="max-w-screen-2xl mx-auto px-6 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-75 text-slate-400 text-sm font-medium">
          <div>Classe365 • Inspired</div>
          <div>Fedena</div>
          <div>Blackbaud</div>
          <div>PowerSchool</div>
          <div>Veracross</div>
        </div>
      </div>

      {/* FEATURES – Dynamic animated cards */}
      <section id="features" className="max-w-screen-2xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={container}
          className="text-center mb-16"
        >
          <motion.h2 variants={item} className="text-5xl font-semibold tracking-tight">
            Everything. Beautifully connected.
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Users, title: "Student CRM + Admissions", desc: "Pipeline management, application tracking, automated offers, and parent onboarding portal.", color: "#FF7A00" },
            { icon: BookOpen, title: "Academics & LMS", desc: "Timetable, assignments, live classes, gradebook with AI comment suggestions.", color: "#10b981" },
            { icon: DollarSign, title: "Finance & Fees", desc: "Instant invoicing, multiple payment gateways, scholarship automation, real-time ledger.", color: "#3b82f6" },
            { icon: BarChart3, title: "AI Analytics Studio", desc: "Predictive insights, dropout risk, performance heatmaps, one-click executive reports.", color: "#8b5cf6" },
            { icon: ShieldCheck, title: "Attendance & Discipline", desc: "Biometric + mobile check-in, behaviour tracking, instant parent notifications.", color: "#ec4899" },
            { icon: GraduationCap, title: "Alumni & Community", desc: "Digital yearbooks, donation campaigns, lifelong networking portal.", color: "#f59e0b" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.04, y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="glass-light rounded-3xl p-8 group cursor-pointer relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <feature.icon className="w-12 h-12" style={{ color: feature.color }} />
                <span className="text-xs font-mono bg-white/60 px-3 py-1 rounded-3xl group-hover:bg-[#FF7A00] group-hover:text-white transition-colors">0{index + 1}</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-600">{feature.desc}</p>

              <motion.div
                className="absolute bottom-0 left-8 h-1 bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent"
                initial={{ width: "0%" }}
                whileInView={{ width: "60%" }}
                viewport={{ once: true }}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white/70 py-24">
        <div className="max-w-screen-2xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl font-semibold tracking-tight text-center mb-16"
          >
            From day one to graduation in 4 clicks
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-[#FF7A00]/30 to-transparent" />
            {["Admit", "Teach", "Track", "Graduate"].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-3xl p-8 text-center relative z-10"
              >
                <div className="w-12 h-12 mx-auto mb-6 bg-[#FF7A00] text-white rounded-2xl flex items-center justify-center text-3xl font-bold">
                  {i + 1}
                </div>
                <h4 className="font-semibold text-2xl mb-2">{step}</h4>
                <p className="text-slate-500">Instant workflow automation</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI STUDIO */}
      <section id="ai" className="max-w-screen-2xl mx-auto px-6 py-24 bg-gradient-to-br from-[#FF7A00]/5 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            whileHover={{ rotate: 5 }}
            className="inline-flex px-6 py-2 bg-white/70 rounded-3xl text-[#FF7A00] font-medium mb-8 items-center gap-x-2"
          >
            ✨ AI STUDIO
          </motion.div>
          <h2 className="text-5xl font-semibold tracking-tight mb-6">Your school’s personal AI co-pilot</h2>
          <p className="text-xl text-slate-600">Auto-generates report comments, predicts student performance, answers parent queries instantly.</p>
        </div>
      </section>

      {/* ←←← PRICING SECTION →→→ */}
      <PricingSection />

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-6">
          <h2 className="text-5xl font-semibold tracking-tight text-center mb-12">Real schools. Real magic.</h2>
          <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {[
              { quote: "GlassFlow is the Classe365 killer we’ve been waiting for. Everything just feels premium.", school: "King’s College Lagos" },
              { quote: "The AI attendance + parent portal alone saved us 18 hours every week.", school: "International School Abuja" },
              { quote: "Our finance team went from Excel hell to one-click reports.", school: "Elite Academy Douala" },
            ].map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className="glass-light min-w-[380px] snap-center rounded-3xl p-10"
              >
                <p className="text-2xl italic">“{t.quote}”</p>
                <div className="mt-10 text-sm font-medium">{t.school}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="max-w-screen-2xl mx-auto px-6 py-16 bg-slate-900 text-white rounded-t-[3rem]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center max-w-xl mx-auto"
        >
          <h2 className="text-5xl font-semibold tracking-tight mb-6">Ready to run the most beautiful school in your city?</h2>
          <Link
            to="/login"
            className="inline-flex px-12 py-7 bg-[#FF7A00] rounded-3xl text-2xl font-semibold items-center gap-x-4 hover:scale-105 transition-transform"
          >
            Launch your free school OS
            <ArrowRight className="w-7 h-7" />
          </Link>
        </motion.div>
      </div>

      <GlassFooter />

      {/* Global styles for glass + hover effects */}
      <style>{`
        .glass { 
          background: rgba(255,255,255,0.72); 
          backdrop-filter: blur(14px); 
          border: 1px solid rgba(255,255,255,0.45); 
        }
        .glass-light { 
          background: rgba(255,255,255,0.65); 
          backdrop-filter: blur(10px); 
        }
        .nav-link { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .nav-link:hover { color: #FF7A00; transform: translateY(-1px); }
        .btn-hover:hover { 
          transform: scale(1.06) translateY(-2px); 
          box-shadow: 0 20px 25px -5px rgb(255 122 0 / 0.3); 
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}