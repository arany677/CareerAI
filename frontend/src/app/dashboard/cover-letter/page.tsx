"use client";

import React, { useState, useEffect, Suspense } from 'react'; // Suspense যুক্ত করা হয়েছে
import { useSearchParams } from 'next/navigation'; // searchParams ধরার জন্য যুক্ত করা হয়েছে
import { api } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  FileEdit,
  Loader2,
  Copy,
  Check,
  Download,
  Trash2,
  Clock,
  Sparkles,
  Building,
  Briefcase
} from 'lucide-react';

interface LetterItem {
  _id: string;
  companyName: string;
  position: string;
  generatedLetter: string;
  createdAt: string;
}

// মূল কন্টেন্টকে আলাদা ফাংশনে নেওয়া হয়েছে searchParams ব্যবহারের সুবিধার জন্য
function CoverLetterContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams(); // URL থেকে ডাটা পড়ার জন্য

  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [experienceDetails, setExperienceDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const [letterText, setLetterText] = useState('');
  const [copied, setCopied] = useState(false);
  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // URL থেকে ডাটা নিয়ে ইনপুট ফিল্ডে বসানোর জন্য useEffect
  useEffect(() => {
    const jobQuery = searchParams.get('job');
    const companyQuery = searchParams.get('company');

    if (jobQuery) setPosition(jobQuery);
    if (companyQuery) setCompanyName(companyQuery);
  }, [searchParams]);

  const fetchLetters = async () => {
    try {
      const response = await api.get('/cover-letters/history');
      setLetters(response.data);
    } catch (err: any) {
      console.error(err);
      toast('Failed to load letter history logs.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !position) {
      toast('Please enter company name and position', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/cover-letters/generate', {
        companyName,
        position,
        experienceDetails
      });
      setLetterText(response.data.generatedLetter);
      toast('Cover letter generated successfully!', 'success');
      fetchLetters(); // Refresh list
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.message || 'Failed to generate cover letter.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast('Pop-up blocked! Please allow popups to compile PDF.', 'error');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter - ${companyName} (${position})</title>
          <style>
            body {
              font-family: Georgia, serif;
              line-height: 1.6;
              color: #111;
              padding: 2.5cm;
              max-width: 21cm;
              margin: 0 auto;
            }
            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family: inherit;
              font-size: 11pt;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <pre>${letterText}</pre>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this cover letter?')) return;

    try {
      await api.delete(`/cover-letters/${id}`);
      toast('Cover letter deleted.', 'success');
      setLetters(prev => prev.filter(l => l._id !== id));
      if (letterText === letters.find(l => l._id === id)?.generatedLetter) {
        setLetterText('');
      }
    } catch (err: any) {
      console.error(err);
      toast('Failed to delete cover letter.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">AI Cover Letter Generator</h1>
        <p className="text-slate-400 text-sm mt-1">Compose highly tailored, professional-grade cover letters matching your strengths.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Creation Form & History list */}
        <div className="space-y-6 lg:col-span-1">

          {/* Creator Form */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Letter Builder
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Building className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Job Position
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Frontend Architect"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex justify-between">
                  <span>Custom Experience Details</span>
                  <span className="text-slate-600 font-normal">Optional</span>
                </label>
                <textarea
                  value={experienceDetails}
                  onChange={(e) => setExperienceDetails(e.target.value)}
                  placeholder="Summarize specific milestones or projects you'd like to highlight..."
                  className="w-full p-3.5 rounded-xl glass-input text-xs min-h-[100px] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-850/60 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Drafting Letter...
                  </>
                ) : (
                  'Generate Letter'
                )}
              </button>
            </form>
          </div>

          {/* Archive list */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4 flex flex-col max-h-[350px]">
            <h3 className="text-base font-bold text-white">Document Archive</h3>

            {historyLoading ? (
              <div className="flex-grow flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              </div>
            ) : letters.length > 0 ? (
              <div className="flex-grow overflow-y-auto space-y-2.5 pr-1">
                {letters.map((item) => (
                  <div
                    key={item._id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${letterText === item.generatedLetter
                        ? 'bg-slate-900 border-indigo-500/35 text-white'
                        : 'bg-slate-950/45 border-slate-900 text-slate-400'
                      }`}
                  >
                    <button
                      onClick={() => setLetterText(item.generatedLetter)}
                      className="flex-1 text-left min-w-0 mr-2"
                    >
                      <h4 className="text-xs font-semibold text-white truncate">{item.position}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{item.companyName}</p>
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No archived letters found.
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Document Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          {letterText ? (
            <div className="space-y-4 flex flex-col h-full animate-slide-in">

              {/* Tool bar buttons */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/50 border border-slate-900">
                <span className="text-xs font-bold text-slate-400 px-3">Document Draft</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Text Area Frame */}
              <div className="flex-1 min-h-[450px] flex">
                <textarea
                  value={letterText}
                  onChange={(e) => setLetterText(e.target.value)}
                  className="w-full h-full p-8 rounded-2xl glass-card border border-slate-900 text-sm leading-relaxed text-slate-300 focus:outline-none focus:border-indigo-500/20 font-serif resize-y"
                  style={{ minHeight: '450px' }}
                />
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[450px] flex flex-col items-center justify-center text-center p-8 rounded-2xl glass-card border border-slate-900 border-dashed space-y-3">
              <FileEdit className="w-12 h-12 text-slate-600" />
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Write Cover Letter</h3>
                <p className="text-xs text-slate-400 max-w-sm">Provide details in the sidebar form and trigger the builder to construct a formal, company-customized cover letter draft.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Next.js-এ useSearchParams ব্যবহারের জন্য Suspense প্রয়োজন হয়
export default function CoverLetterGenerator() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoverLetterContent />
    </Suspense>
  );
}