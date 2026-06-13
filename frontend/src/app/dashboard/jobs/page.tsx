"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Router যুক্ত করা হয়েছে
import { api } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Briefcase,
  Loader2,
  ArrowUpRight,
  CheckCircle,
  HelpCircle,
  Building
} from 'lucide-react';

interface Job {
  title: string;
  company: string;
  requiredSkills: string[];
  matchPercentage: number;
  description: string;
}

export default function JobRecommendations() {
  const router = useRouter(); // Router ইনিশিয়ালাইজ করা হয়েছে
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs/recommend');
        setJobs(response.data);
      } catch (err: any) {
        console.error(err);
        toast('Failed to load job recommendations.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);

  // Apply বাটনের ফাংশন
  // handleApply ফাংশনটি এভাবে আপডেট করুন
  const handleApply = (job: Job) => {
    toast(`Preparing application for ${job.title}...`, 'info');

    const query = `?job=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`;

    // যদি আপনার সাইডবার লিঙ্কটি /cover-letters হয়, তবে এখানে 's' যোগ করুন
    // অথবা যদি এটি ড্যাশবোর্ডের ভেতরে থাকে তবে /dashboard/cover-letter দিন
    router.push('/dashboard/cover-letter' + query);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-slate-900 rounded-2xl border border-slate-900"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Recommended Job Roles</h1>
        <p className="text-slate-400 text-sm mt-1">Discover career roles matching your parsed resume skills and targeted interests.</p>
      </div>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl flex flex-col justify-between space-y-6 hover:border-indigo-500/20 hover:shadow-indigo-500/5 transition-all animate-slide-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >

              {/* Job Info Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{job.title}</h3>
                    <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 shrink-0 text-slate-500" /> {job.company}
                    </span>
                  </div>
                  {/* Match Score Badge */}
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold shrink-0 ${job.matchPercentage >= 75
                    ? 'bg-emerald-950/80 border-emerald-500/25 text-emerald-400'
                    : job.matchPercentage >= 50
                      ? 'bg-amber-950/80 border-amber-500/25 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                    {job.matchPercentage}% Match
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {job.description}
                </p>
              </div>

              {/* Requirements & Action Footer */}
              <div className="space-y-4 pt-4 border-t border-slate-900">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-850 text-[10px] text-slate-400 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleApply(job)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="h-80 flex flex-col items-center justify-center text-center p-8 rounded-2xl glass-card border border-slate-900 border-dashed space-y-3">
          <Briefcase className="w-12 h-12 text-slate-600" />
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">No Recommendations</h3>
            <p className="text-xs text-slate-400 max-w-sm">Please update your profile skills list or upload a PDF resume so the carrier engine can extract matching recommendations.</p>
          </div>
        </div>
      )}
    </div>
  );
}