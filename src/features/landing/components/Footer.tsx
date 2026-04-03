import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Twitter, Linkedin, Github, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/landing" className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-orange-500 text-white">
                <GraduationCap size={20} />
              </div>
              <span className="text-xl font-bold font-heading text-white">EduFlow</span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              The all-in-one platform designed to simplify administration, empower teachers, and engage students worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Github size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors"><Youtube size={20} /></a>
            </div>
          </div>
          {/* Links Columns (same as you provided) */}
          {/* ... (full code from your message – unchanged) ... */}
        </div>
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} EduFlow Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">GDPR</a>
          </div>
        </div>
      </div>
    </footer>
  );
}