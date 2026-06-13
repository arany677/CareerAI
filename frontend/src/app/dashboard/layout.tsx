"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Award, 
  Briefcase, 
  FileEdit, 
  User, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  Cpu,
  Loader2
} from 'lucide-react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, label, active, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <span className="text-slate-400 text-sm">Synchronizing account profile...</span>
      </div>
    );
  }

  if (!user) return null;

  const links = [
    { href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
    { href: '/dashboard/resume-analyzer', icon: <FileText className="w-4 h-4" />, label: 'Resume Analyzer' },
    { href: '/dashboard/skill-gap', icon: <Award className="w-4 h-4" />, label: 'Skill Gap Analysis' },
    { href: '/dashboard/jobs', icon: <Briefcase className="w-4 h-4" />, label: 'Job Recommendations' },
    { href: '/dashboard/cover-letter', icon: <FileEdit className="w-4 h-4" />, label: 'Cover Letter Generator' },
    { href: '/dashboard/profile', icon: <User className="w-4 h-4" />, label: 'Profile Settings' },
  ];

  if (user.role === 'admin') {
    links.push({
      href: '/dashboard/admin',
      icon: <ShieldAlert className="w-4 h-4" />,
      label: 'Admin Dashboard',
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-slate-900 bg-slate-950/60 backdrop-blur-xl">
        {/* Header Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-900">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-wide">CareerAI</span>
          </Link>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              icon={link.icon}
              label={link.label}
              active={pathname === link.href}
            />
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-900 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/40 border border-slate-900/60">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold truncate text-white">{user.name}</h4>
              <span className="text-xs text-indigo-400 capitalize font-medium">{user.role}</span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-300 text-xs font-semibold tracking-wider uppercase transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header - Mobile Trigger */}
        <header className="lg:hidden h-16 shrink-0 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1 rounded-md bg-gradient-to-tr from-indigo-600 to-violet-500 text-white">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white text-base">CareerAI</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Sidebar - Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-72 bg-slate-950 border-r border-slate-900 h-full flex flex-col p-6 relative">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-8">
                <Cpu className="w-5 h-5 text-indigo-500" />
                <span className="text-lg font-bold">CareerAI</span>
              </div>

              <nav className="flex-grow space-y-2">
                {links.map((link) => (
                  <SidebarLink
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    active={pathname === link.href}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{user.name}</h4>
                    <span className="text-xs text-indigo-400 capitalize">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-300 text-xs font-semibold tracking-wider uppercase transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Box */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 z-10">
          <div className="max-w-6xl mx-auto animate-slide-in">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
