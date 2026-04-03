// src/components/layout/GlassHeader.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function GlassHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[9999] glass border-b border-white/30 bg-white/75 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-x-3 group">
          <div className="w-9 h-9 bg-[#FF7A00] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner transition-transform group-active:scale-95">
            G
          </div>
          <div>
            <span className="text-2xl font-semibold tracking-[-1px]">GlassFlow</span>
            <span className="text-xs ml-1.5 font-medium text-slate-400">School</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-x-9 text-sm font-medium">
          <button 
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} 
            className="nav-link hover:text-[#FF7A00]"
          >
            Features
          </button>
          <button 
            onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} 
            className="nav-link hover:text-[#FF7A00]"
          >
            How it Works
          </button>
          <button 
            onClick={() => document.getElementById("ai")?.scrollIntoView({ behavior: "smooth" })} 
            className="nav-link hover:text-[#FF7A00]"
          >
            AI Studio
          </button>
          <button 
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} 
            className="nav-link hover:text-[#FF7A00]"
          >
            Pricing
          </button>
          <button 
            onClick={() => document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })} 
            className="nav-link hover:text-[#FF7A00]"
          >
            Stories
          </button>

        </div>

        <div className="flex items-center gap-x-4">
          <Link
            to="/onboarding"
            className="hidden sm:flex px-7 py-3.5 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white rounded-3xl font-semibold text-sm btn-hover transition-all shadow-inner"
          >
            Start 14-day free trial
          </Link>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden w-11 h-11 glass flex items-center justify-center rounded-3xl text-slate-700"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu – glass overlay */}
      {isMobileOpen && (
        <div className="md:hidden glass border-t px-6 py-8 flex flex-col gap-y-6 text-base font-medium">
          <button 
            onClick={() => { 
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); 
              setIsMobileOpen(false); 
            }} 
            className="py-3 text-left"
          >
            Features
          </button>
          <button 
            onClick={() => { 
              document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }); 
              setIsMobileOpen(false); 
            }} 
            className="py-3 text-left"
          >
            How it Works
          </button>
          <button 
            onClick={() => { 
              document.getElementById("ai")?.scrollIntoView({ behavior: "smooth" }); 
              setIsMobileOpen(false); 
            }} 
            className="py-3 text-left"
          >
            AI Studio
          </button>
          <button 
            onClick={() => { 
              document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" }); 
              setIsMobileOpen(false); 
            }} 
            className="py-3 text-left"
          >
            Stories
          </button>
          <Link 
            to="/login" 
            className="py-3" 
            onClick={() => setIsMobileOpen(false)}
          >
            Login
          </Link>
          <Link 
            to="/login" 
            className="mt-4 w-full py-5 bg-[#FF7A00] text-white rounded-3xl text-center font-semibold"
            onClick={() => setIsMobileOpen(false)}
          >
            Start free trial
          </Link>
        </div>
      )}
    </nav>
  );
}