"use client";

import React, { useState } from 'react';
import { api } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  Award, 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Cpu, 
  MapPin, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface LearningStep {
  step: string;
  description: string;
  resource: string;
}

interface GapResult {
  existingSkills: string[];
  missingSkills: string[];
  recommendedTech: string[];
  learningPath: LearningStep[];
}

export default function SkillGapAnalysis() {
  const { toast } = useToast();
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GapResult | null>(null);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast('Please enter a target role', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/skills/gap', { targetRole });
      setResult(response.data);
      toast('Skill gap analysis generated!', 'success');
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.message || 'Failed to analyze skill gaps.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Skill Gap Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">Audit target role requirements versus your credentials and build learning roadmaps.</p>
      </div>

      {/* Input Form panel */}
      <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl max-w-2xl">
        <form onSubmit={handleRunAnalysis} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Target Career Role
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Frontend Developer, Backend Engineer..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850/60 text-white font-semibold text-xs tracking-wider uppercase transition-all shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Gap...
                  </>
                ) : (
                  'Analyze Skill Gap'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-slate-900 rounded-2xl border border-slate-900"></div>
            <div className="h-40 bg-slate-900 rounded-2xl border border-slate-900"></div>
            <div className="h-40 bg-slate-900 rounded-2xl border border-slate-900"></div>
          </div>
          <div className="h-96 bg-slate-900 rounded-2xl border border-slate-900"></div>
        </div>
      ) : result ? (
        <div className="space-y-8 animate-slide-in">
          
          {/* Skill Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Existing Skills */}
            <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Matches Found
              </h3>
              <p className="text-xxs text-slate-500">Skills on your profile that fit this role requirements</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {result.existingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-emerald-950/45 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" /> Missing Competencies
              </h3>
              <p className="text-xxs text-slate-500">Key technologies or credentials you need to target</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {result.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-rose-950/45 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Tools/Tech */}
            <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Recommended Extensions
              </h3>
              <p className="text-xxs text-slate-500">Supplementary stack libraries that will make your profile stand out</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {result.recommendedTech.map((tech, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-indigo-950/45 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Learning Roadmap timeline */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Suggested Learning Roadmap
            </h3>

            <div className="relative border-l border-slate-800 pl-6 space-y-8 ml-3">
              {result.learningPath.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Circle Indicator */}
                  <div className="absolute top-1.5 left-[-35px] w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <span className="text-xs text-indigo-400 font-bold">{idx + 1}</span>
                  </div>
                  
                  {/* Step Card details */}
                  <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-900 space-y-2.5">
                    <h4 className="font-bold text-white text-sm">{step.step}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-500">
                      <ExternalLink className="w-3 h-3 text-indigo-400" /> Reference: <span className="text-slate-300 font-semibold">{step.resource}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="h-80 flex flex-col items-center justify-center text-center p-8 rounded-2xl glass-card border border-slate-900 border-dashed space-y-3">
          <Award className="w-12 h-12 text-slate-600" />
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">Select Target Role to Analyze</h3>
            <p className="text-xs text-slate-400 max-w-sm">Type your targeted position above (e.g. "React Developer") and hit analyze to construct missing credentials lists and learning paths.</p>
          </div>
        </div>
      )}
    </div>
  );
}
