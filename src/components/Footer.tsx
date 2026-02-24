import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white/70 py-16 px-6 md:px-12 border-t border-white/10 font-sans text-sm z-20 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-medium uppercase tracking-wider mb-2">Features</h4>
          <a href="#" className="hover:text-white transition-colors">Tracking</a>
          <a href="#" className="hover:text-white transition-colors">Budgeting</a>
          <a href="#" className="hover:text-white transition-colors">Planning</a>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-medium uppercase tracking-wider mb-2">Tools</h4>
          <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          <a href="#" className="hover:text-white transition-colors">Dashboard</a>
          <a href="#" className="hover:text-white transition-colors">Reports</a>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-medium uppercase tracking-wider mb-2">Company</h4>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Careers</a>
          <a href="#" className="hover:text-white transition-colors">Press</a>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-medium uppercase tracking-wider mb-2">Support</h4>
          <a href="#" className="hover:text-white transition-colors">Help Center</a>
          <a href="#" className="hover:text-white transition-colors">Privacy & Security</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-4">
        <div className="flex items-center gap-3 justify-center"><img src="/trinit_logo.jpg" alt="Trinit" className="w-8 h-8 rounded-full object-cover" /><div className="font-antonio text-2xl text-white tracking-widest uppercase">Trinit</div></div>
        <div className="uppercase tracking-wider">Copyright © {new Date().getFullYear()} Trinit, Inc. All rights reserved.</div>
      </div>
    </footer>
  );
}
