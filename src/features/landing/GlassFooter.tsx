// src/components/layout/GlassFooter.tsx
import { Link } from "react-router-dom";

export default function GlassFooter() {
  return (
    <footer className="bg-slate-950 text-white/90 pt-20 pb-12">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-x-3 mb-6">
              <div className="w-10 h-10 bg-[#FF7A00] rounded-3xl flex items-center justify-center text-white text-3xl">G</div>
              <span className="text-3xl font-semibold tracking-tight">GlassFlow</span>
            </div>
            <p className="text-sm max-w-xs text-white/60">Modern school management. Beautifully simple. Powered by AI.</p>
            <p className="text-xs mt-8 text-white/40">© 2026 GlassFlow • All rights reserved</p>
          </div>

          <div>
            <div className="uppercase text-xs font-semibold tracking-widest mb-4 text-white/40">Product</div>
            <div className="space-y-3 text-sm">
              <Link to="/login" className="block hover:text-white">Features</Link>
              <Link to="#" className="block hover:text-white">Pricing</Link>
              <Link to="#" className="block hover:text-white">Demo</Link>
            </div>
          </div>

          <div>
            <div className="uppercase text-xs font-semibold tracking-widest mb-4 text-white/40">Company</div>
            <div className="space-y-3 text-sm">
              <Link to="#" className="block hover:text-white">About us</Link>
              <Link to="#" className="block hover:text-white">Careers</Link>
              <Link to="#" className="block hover:text-white">Blog</Link>
            </div>
          </div>

          <div>
            <div className="uppercase text-xs font-semibold tracking-widest mb-4 text-white/40">Resources</div>
            <div className="space-y-3 text-sm">
              <Link to="#" className="block hover:text-white">Help Center</Link>
              <Link to="#" className="block hover:text-white">Community</Link>
              <Link to="#" className="block hover:text-white">Contact sales</Link>
            </div>
          </div>

          <div className="md:text-right">
            <div className="uppercase text-xs font-semibold tracking-widest mb-4 text-white/40">Legal</div>
            <div className="space-y-3 text-sm">
              <Link to="#" className="block hover:text-white">Privacy</Link>
              <Link to="#" className="block hover:text-white">Terms</Link>
              <Link to="#" className="block hover:text-white">Security</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
          <p>Made for schools that want to feel like the future.</p>
          <p className="mt-4 md:mt-0 flex items-center gap-x-1">
            <span className="text-emerald-400">●</span> Trusted by 3,942 institutions worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}