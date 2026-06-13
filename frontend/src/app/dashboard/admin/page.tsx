"use client";

import React, { useEffect, useState } from 'react';
import { api, useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  FileEdit, 
  Trash2, 
  Loader2, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalResumes: number;
  totalCoverLetters: number;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface DashboardData {
  stats: Stats;
  recentUsers: UserItem[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast('Forbidden. Access restricted to administrator accounts.', 'error');
      router.push('/dashboard');
    }
  }, [user, router, toast]);

  const fetchAdminData = async () => {
    try {
      const [dashRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users')
      ]);
      setData(dashRes.data);
      setUserList(usersRes.data);
    } catch (err: any) {
      console.error(err);
      toast('Failed to load admin telemetry database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?._id) {
      toast('You cannot delete your own session admin account.', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This will erase all of their uploaded resumes, cover letters, and profile settings in a cascading database sweep.')) {
      return;
    }

    setDeleteLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast('User deleted successfully.', 'success');
      // Update local lists
      setUserList(prev => prev.filter(u => u._id !== userId));
      if (data) {
        setData({
          ...data,
          stats: {
            ...data.stats,
            totalUsers: data.stats.totalUsers - 1
          },
          recentUsers: data.recentUsers.filter(u => u._id !== userId)
        });
      }
    } catch (err: any) {
      console.error(err);
      toast(err.response?.data?.message || 'Failed to delete user account.', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-900"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-900 rounded-2xl border border-slate-900"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Administration</h1>
          <p className="text-slate-400 text-sm mt-1">Audit telemetry analytics, user registries, and cascading accounts clearing.</p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card border border-slate-900 flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Users</span>
            <h3 className="text-2xl font-black text-white">{data.stats.totalUsers}</h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-900 flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Processed Resumes</span>
            <h3 className="text-2xl font-black text-white">{data.stats.totalResumes}</h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-slate-900 flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cover Letters Drafted</span>
            <h3 className="text-2xl font-black text-white">{data.stats.totalCoverLetters}</h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <FileEdit className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Management Panel */}
      <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" /> Account Registry Directory
        </h3>
        
        {userList.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">Date Joined</th>
                  <th className="py-3 px-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {userList.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-900/30 text-slate-300">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{usr.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{usr.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize border ${
                        usr.role === 'admin' 
                          ? 'bg-rose-950/65 border-rose-500/20 text-rose-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(usr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {usr._id === user?._id ? (
                        <span className="text-[10px] text-slate-600 font-medium px-2 py-1 italic">Active Session</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          disabled={deleteLoading === usr._id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          {deleteLoading === usr._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5" /> <span>Delete Account</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            No registered users cataloged in database directory.
          </div>
        )}
      </div>

    </div>
  );
}
