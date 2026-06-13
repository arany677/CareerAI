"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Cpu, FileText, Briefcase, Award, Zap, Compass, CheckCircle } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('careerai_token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/10 blur-[130px] pointer-events-none animate-pulse-slow"></div>

      {/* Sticky Responsive Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-wide">
              CareerAI
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/30 transition-all duration-200"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold hover:text-white text-slate-400 transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center gap-1 px-4.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/45 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide mb-8 animate-slide-in">
            <Zap className="w-3.5 h-3.5 fill-indigo-400/20" /> Next-Generation Career Accelerator
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-5xl mx-auto animate-slide-in">
            Supercharge Your Professional Journey with <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Gemini AI</span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light animate-slide-in">
            Upload your resume, audit ATS compatibility in seconds, map out targeted learning paths to close skill gaps, discover high-matching roles, and compose optimized cover letters.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-slide-in">
            <Link 
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-xl shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              Analyze Resume Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-300 hover:text-white font-semibold transition-all"
            >
              Explore Features
            </a>
          </div>

          {/* Visual Showcase Graphic */}
          <div className="mt-20 relative rounded-2xl overflow-hidden border border-slate-900 shadow-2xl bg-slate-950/30 max-w-5xl mx-auto p-2 glass-panel animate-slide-in">
            <div className="rounded-xl overflow-hidden bg-slate-900/40 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 text-left">
              <div className="flex-1 space-y-4">
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">ATS Audit Panel</span>
                <h3 className="text-2xl md:text-3xl font-bold text-white">Interactive Score Review</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our system evaluates resume layout structures, vocabulary parsing limits, keyword occurrences, and metrics density to return custom improvements and ATS scores.
                </p>
                <div className="flex gap-3">
                  <span className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400">PDF Extraction</span>
                  <span className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400">Gemini Parsing</span>
                  <span className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400">ATS Benchmarks</span>
                </div>
              </div>
              <div className="w-full md:w-80 p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-sm font-semibold text-slate-400">Resume Score</span>
                <div className="w-28 h-28 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">82<span className="text-sm font-normal text-slate-500">/100</span></span>
                </div>
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> High ATS Match Probability
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Complete Suite of AI Tools</h2>
            <p className="text-slate-400">Everything you need to level up your credentials and win elite job offers.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl glass-card glass-card-hover flex flex-col space-y-4">
              <div className="p-3 w-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Resume Analyzer</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scan your PDF resume to generate an instant scoring checklist detailing strengths, weaknesses, and optimization advice.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl glass-card glass-card-hover flex flex-col space-y-4">
              <div className="p-3 w-fit rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Skill Gap Analysis</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Select your target career role and compare it with your credentials to map missing skills and detailed guides to learn them.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl glass-card glass-card-hover flex flex-col space-y-4">
              <div className="p-3 w-fit rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Job Recommendations</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unlock matching job suggestions computed algorithmically against your cataloged strengths and interests with match badges.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl glass-card glass-card-hover flex flex-col space-y-4">
              <div className="p-3 w-fit rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Cover Letter AI</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate highly polished, company-tailored cover letters in seconds. Edit, copy, and download directly.
              </p>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900 bg-slate-950/20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400">Get audit results in three basic steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-900 text-center">
              <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Upload Credentials</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Drop your current resume PDF into the analyzer node or construct your professional background outline manually.
              </p>
            </div>
            
            <div className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-900 text-center">
              <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Run AI Diagnosis</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our AI inspects formatting quality, isolates keyword matches, computes gap vectors, and suggests optimizations.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-900 text-center">
              <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Execute Recommendations</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Follow learning tracks, apply to matching roles, generate customized documents, and monitor application success.
              </p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-slate-400">Discover how CareerAI helps builders land jobs at premier agencies.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-card flex flex-col space-y-4">
              <p className="text-slate-300 italic text-sm leading-relaxed">
                "The Skill Gap Analysis is what set this apart. It identified exactly what tools I was missing for Senior frontend listings, mapped out resources, and helped me structure my training."
              </p>
              <div>
                <h4 className="font-bold text-white text-sm">Elena Rostova</h4>
                <span className="text-xs text-indigo-400">React Architect at CloudCorp</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-card flex flex-col space-y-4">
              <p className="text-slate-300 italic text-sm leading-relaxed">
                "I went from getting zero replies to scheduling 4 interviews in a fortnight. The ATS scorecard showed my bullet descriptions lacked impact, and rewrite tips worked like magic."
              </p>
              <div>
                <h4 className="font-bold text-white text-sm">Devon Mckinney</h4>
                <span className="text-xs text-indigo-400">Full Stack Engineer at NetFlow</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-card flex flex-col space-y-4">
              <p className="text-slate-300 italic text-sm leading-relaxed">
                "I was skeptical of AI letters, but this cover letter generator drafts letters tailored to user backgrounds. It saved me hours of application customization work."
              </p>
              <div>
                <h4 className="font-bold text-white text-sm">Marcus Vance</h4>
                <span className="text-xs text-indigo-400">UI/UX Lead designer at PixelCraft</span>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="max-w-5xl mx-auto px-6 py-16 mb-20 text-center rounded-3xl border border-indigo-500/20 bg-indigo-950/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Accelerate Your Career?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-sm md:text-base">
            Upload your resume today and get access to our advanced career analysis, gap check maps, matching listings, and letter editors.
          </p>
          <Link 
            href={isLoggedIn ? "/dashboard" : "/register"}
            className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:scale-[1.01] transition-all"
          >
            Start Analyzing Free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-slate-300">CareerAI</span>
          </div>
          <p>© 2026 CareerAI Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
