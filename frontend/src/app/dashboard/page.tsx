"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, api } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  FileText, 
  FileEdit, 
  Briefcase, 
  CheckSquare, 
  ArrowRight, 
  Clock, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface ResumeItem {
  _id: string;
  resumeScore: number;
  uploadedAt: string;
}

interface CoverLetterItem {
  _id: string;
  companyName: string;
  position: string;
  createdAt: string;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumesRes, lettersRes] = await Promise.all([
          api.get('/resumes/history'),
          api.get('/cover-letters/history')
        ]);
        setResumes(resumesRes.data);
        setCoverLetters(lettersRes.data);
      } catch (err: any) {
        console.error(err);
        toast('Failed to load dashboard data logs.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let percentage = 0;
    
    if (user.profile.targetRole) percentage += 10;
    if (user.profile.skills && user.profile.skills.length > 0) percentage += 20;
    if (user.profile.experience && user.profile.experience.length > 0) percentage += 35;
    if (user.profile.education && user.profile.education.length > 0) percentage += 35;
    
    return percentage;
  };

  const profilePct = calculateProfileCompletion();
  const latestResume = resumes[0];

  const statCards = [
    {
      title: 'Total Resume Analyses',
      value: resumes.length,
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/10 to-indigo-500/0 border-indigo-500/10',
      href: '/dashboard/resume-analyzer'
    },
    {
      title: 'Generated Cover Letters',
      value: coverLetters.length,
      icon: <FileEdit className="w-5 h-5 text-violet-400" />,
      color: 'from-violet-500/10 to-violet-500/0 border-violet-500/10',
      href: '/dashboard/cover-letter'
    },
    {
      title: 'Recommended Jobs',
      value: 6, // Baseline matching roles count
      icon: <Briefcase className="w-5 h-5 text-fuchsia-400" />,
      color: 'from-fuchsia-500/10 to-fuchsia-500/0 border-fuchsia-500/10',
      href: '/dashboard/jobs'
    },
    {
      title: 'Profile Completion',
      value: `${profilePct}%`,
      icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/10 to-emerald-500/0 border-emerald-500/10',
      href: '/dashboard/profile'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-900"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-900 rounded-2xl border border-slate-900 lg:col-span-2"></div>
          <div className="h-96 bg-slate-900 rounded-2xl border border-slate-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Hello, {user?.name || 'User'}</h1>
        <p className="text-slate-400 text-sm mt-1">Here is a summary of your professional audits and dashboard history.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Link 
            key={idx} 
            href={card.href}
            className={`p-6 rounded-2xl bg-gradient-to-b ${card.color} border bg-slate-950/45 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-start justify-between group`}
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.title}</span>
              <h3 className="text-2xl font-extrabold text-white">{card.value}</h3>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition-colors">
              {card.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Primary Section columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latest Resume Scorecard Card */}
        <div className="p-6 rounded-2xl glass-card border border-slate-900 lg:col-span-2 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Latest ATS Evaluation</h3>
              {latestResume && (
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 
                  {new Date(latestResume.uploadedAt).toLocaleDateString('en-US')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">Status feedback on your last uploaded resume file</p>
          </div>

          {latestResume ? (
            <div className="flex flex-col sm:flex-row items-center gap-8 p-4 rounded-xl bg-slate-900/40 border border-slate-900/80">
              <div className="shrink-0 relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-indigo-500/25 border-t-indigo-500 bg-slate-950">
                <span className="text-3xl font-black text-white">{latestResume.resumeScore}<span className="text-xs font-normal text-slate-500">/100</span></span>
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> ATS Compatibility Score
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your resume has moderate ATS compatibility. Complete the Skill Gap Analysis and add key role terms to drive this score above 85.
                </p>
                <Link 
                  href="/dashboard/resume-analyzer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  View Details & Audit Recommendations <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 rounded-xl bg-slate-900/45 border border-slate-900/60 border-dashed space-y-4">
              <FileText className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-semibold text-white text-sm">No Resume Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload a PDF copy of your resume to receive AI feedback, scoring logs, and optimization guidelines.</p>
              </div>
              <Link
                href="/dashboard/resume-analyzer"
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all"
              >
                Upload Resume
              </Link>
            </div>
          )}

          {/* Quick recommendations guides link */}
          <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-slate-400">Complete your profile to unlock customized recommendations.</span>
            <Link 
              href="/dashboard/profile"
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold group"
            >
              Update Profile Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Quick Launchpad Action panel */}
        <div className="p-6 rounded-2xl glass-card border border-slate-900 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Quick Tools</h3>
            <p className="text-sm text-slate-400 mt-1">Jump directly to specialized modules</p>
          </div>

          <div className="space-y-3">
            <Link 
              href="/dashboard/skill-gap"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-900/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">Skill Gap Finder</h4>
                  <p className="text-slate-500 text-xxs mt-0.5">Find missing core technology skills</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </Link>

            <Link 
              href="/dashboard/cover-letter"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-900/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <FileEdit className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">Cover Letter AI</h4>
                  <p className="text-slate-500 text-xxs mt-0.5">Draft tailored job cover letters</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </Link>

            <Link 
              href="/dashboard/jobs"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-900/80 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">Career Matcher</h4>
                  <p className="text-slate-500 text-xxs mt-0.5">Find jobs matching your skills</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
