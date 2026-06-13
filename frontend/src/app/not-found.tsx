import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 overflow-hidden">
      
      {/* Glow Decorators */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] top-1/3 left-1/4 pointer-events-none"></div>

      <div className="max-w-md w-full text-center z-10 space-y-8 animate-slide-in">
        
        {/* Logo */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5 text-indigo-500" /> CareerAI Engine
        </div>

        {/* Big 404 Panel */}
        <div className="p-8 rounded-2xl glass-card border border-slate-900 shadow-2xl space-y-4 relative">
          <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xxs font-extrabold tracking-widest uppercase">
            Error Code 404
          </div>
          
          <h1 className="text-7xl font-black text-white bg-gradient-to-b from-white to-slate-600 bg-clip-text text-transparent">404</h1>
          <h2 className="text-lg font-bold text-white">Route Node Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            The career directory node or workspace endpoint you are seeking does not exist or has been relocated.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" /> <span>Dashboard</span>
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> <span>Landing Page</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
