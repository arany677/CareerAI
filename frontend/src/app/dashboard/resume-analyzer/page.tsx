"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Loader2, 
  AlertCircle,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';

interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  atsCompatibility: string;
}

interface ResumeItem {
  _id: string;
  resumeFile: string;
  resumeScore: number;
  analysisResult: AnalysisResult;
  uploadedAt: string;
}

export default function ResumeAnalyzer() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeItem | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/resumes/history');
      setResumes(response.data);
      if (response.data.length > 0 && !selectedResume) {
        setSelectedResume(response.data[0]);
      }
    } catch (err: any) {
      console.error(err);
      toast('Failed to load upload history logs.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast('Only PDF files are supported', 'error');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast('Please select a PDF file first', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    try {
      const response = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast('Resume uploaded and analyzed successfully!', 'success');
      setFile(null);
      // Refresh list
      const updatedHistory = await api.get('/resumes/history');
      setResumes(updatedHistory.data);
      setSelectedResume(response.data);
    } catch (error: any) {
      console.error(error);
      toast(error.response?.data?.message || 'Failed to upload/analyze resume. Please check file format.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">AI Resume Analyzer</h1>
        <p className="text-slate-400 text-sm mt-1">Audit ATS performance, score layout metrics, and identify critical improvements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload Zone & History Logs */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* File Upload Zone */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Upload Resume</h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <label className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 hover:border-indigo-500/40 rounded-xl bg-slate-950/45 cursor-pointer transition-colors relative group">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <div className="text-center space-y-2">
                  <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:scale-105 transition-all w-fit mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-300">
                      {file ? file.name : 'Select PDF Resume'}
                    </span>
                    <p className="text-xxs text-slate-500">Max size 10MB (PDF Only)</p>
                  </div>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 border border-transparent disabled:border-slate-850/60 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Credentials...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            </form>
          </div>

          {/* History Lists */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4 flex flex-col max-h-[400px]">
            <h3 className="text-base font-bold text-white">Analysis History</h3>
            
            {historyLoading ? (
              <div className="flex-1 flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
            ) : resumes.length > 0 ? (
              <div className="flex-grow overflow-y-auto space-y-2.5 pr-1">
                {resumes.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedResume(item)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      selectedResume?._id === item._id
                        ? 'bg-slate-900 border-indigo-500/35 text-white'
                        : 'bg-slate-950/45 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                      <div className="truncate">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {item.resumeFile.split('-').slice(1).join('-') || 'Resume PDF'}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
                      item.resumeScore >= 80 
                        ? 'bg-emerald-950/65 border-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-950/65 border-amber-500/20 text-amber-400'
                    }`}>
                      {item.resumeScore}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No resume upload history logs found.
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Detailed AI Diagnostics */}
        <div className="lg:col-span-2 space-y-6">
          {selectedResume ? (
            <div className="space-y-6 animate-slide-in">
              
              {/* Scorecard Summary Panel */}
              <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-indigo-950/10 via-slate-950/10 to-transparent">
                <div className="shrink-0 relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 bg-slate-950">
                  <span className="text-4xl font-black text-white">
                    {selectedResume.resumeScore}
                    <span className="text-sm font-normal text-slate-500">/100</span>
                  </span>
                </div>
                
                <div className="space-y-3 text-center md:text-left flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Analysis Summary</span>
                  <h2 className="text-2xl font-bold text-white">ATS Scoring Breakdown</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {selectedResume.analysisResult.atsCompatibility}
                  </p>
                </div>
              </div>

              {/* Strengths & Weaknesses Grids */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Strengths Card */}
                <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Strengths Identified
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-400">
                    {selectedResume.analysisResult.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses Card */}
                <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400" /> Areas of Improvement
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-400">
                    {selectedResume.analysisResult.weaknesses.map((weak, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Actionable Improvement Suggestions */}
              <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" /> Recommended Action Items
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedResume.analysisResult.suggestions.map((sug, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-2xl glass-card border border-slate-900 border-dashed space-y-4">
              <AlertCircle className="w-12 h-12 text-slate-600" />
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Select or Upload Resume</h3>
                <p className="text-xs text-slate-400 max-w-sm">Please select an analysis from your history sidebar or drop a new PDF resume above to compile AI diagnostic feedback.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
