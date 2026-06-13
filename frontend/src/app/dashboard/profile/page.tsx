"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  User, 
  Award, 
  Briefcase, 
  BookOpen, 
  Lock, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Profile forms states
  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.profile.targetRole || '');
  const [skills, setSkills] = useState<string[]>(user?.profile.skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  // Experience list states
  const [experienceList, setExperienceList] = useState<any[]>(user?.profile.experience || []);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  // Education list states
  const [educationList, setEducationList] = useState<any[]>(user?.profile.education || []);
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [year, setYear] = useState('');

  // Password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.some(s => s.toLowerCase() === newSkill.trim().toLowerCase())) {
      toast('Skill already listed', 'info');
      return;
    }
    setSkills(prev => [...prev, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position || !duration) {
      toast('Please enter company, position, and duration', 'error');
      return;
    }
    const newExp = { company, position, duration, description };
    setExperienceList(prev => [...prev, newExp]);
    setCompany('');
    setPosition('');
    setDuration('');
    setDescription('');
  };

  const handleRemoveExperience = (idx: number) => {
    setExperienceList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !degree || !fieldOfStudy || !year) {
      toast('Please fill all education fields', 'error');
      return;
    }
    const newEd = { school, degree, fieldOfStudy, year };
    setEducationList(prev => [...prev, newEd]);
    setSchool('');
    setDegree('');
    setFieldOfStudy('');
    setYear('');
  };

  const handleRemoveEducation = (idx: number) => {
    setEducationList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const profilePayload: any = {
      targetRole,
      skills,
      experience: experienceList,
      education: educationList
    };

    if (password) {
      if (password !== confirmPassword) {
        toast('Passwords do not match', 'error');
        setLoading(false);
        return;
      }
      profilePayload.password = password;
    }

    try {
      await updateProfile(profilePayload);
      toast('Profile updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to update profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your credentials, skills, experience, and password credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Core Settings, Password & Skills */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Base Info & Target Role */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> Account Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  disabled
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs opacity-60 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs opacity-60 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Target Career Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior React Developer"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Password Security Panel */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Update Password
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Skills Keywords Panel */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" /> Professional Skills
            </h3>

            {/* Form to append skill */}
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g. Next.js"
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="submit"
                className="px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white transition-all flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {skills.map((skill, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/45 border border-indigo-500/25 text-indigo-300 text-[10px] font-semibold"
                >
                  {skill}
                  <button 
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-white"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Columns: Experience & Education Timeline listings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Work Experience */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Work History
            </h3>

            {/* Experience input items */}
            <div className="grid md:grid-cols-3 gap-3">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company Name"
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Position Role"
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (e.g. 2024 - Present)"
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            
            <div className="flex gap-3 items-end">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job description summary of responsibilities & accomplishments..."
                className="flex-grow p-3 rounded-xl glass-input text-xs min-h-[60px] resize-none"
              />
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs transition-all shrink-0 h-fit cursor-pointer"
              >
                Add Job
              </button>
            </div>

            {/* Added list */}
            {experienceList.length > 0 && (
              <div className="pt-4 border-t border-slate-900 space-y-3">
                {experienceList.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-start p-4 rounded-xl bg-slate-900/40 border border-slate-900">
                    <div>
                      <h4 className="font-bold text-white text-xs">{exp.position}</h4>
                      <p className="text-[10px] text-indigo-400">{exp.company} | {exp.duration}</p>
                      {exp.description && <p className="text-[10px] text-slate-400 mt-2 font-light leading-relaxed">{exp.description}</p>}
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education timeline */}
          <div className="p-6 rounded-2xl glass-card border border-slate-900 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Education History
            </h3>

            {/* Education fields */}
            <div className="grid md:grid-cols-4 gap-3">
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="School Name"
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="Degree (e.g. BS)"
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="Field of Study"
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Graduation Year"
                className="px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                Add Education
              </button>
            </div>

            {/* Added list */}
            {educationList.length > 0 && (
              <div className="pt-4 border-t border-slate-900 space-y-3">
                {educationList.map((ed, idx) => (
                  <div key={idx} className="flex justify-between items-start p-4 rounded-xl bg-slate-900/40 border border-slate-900">
                    <div>
                      <h4 className="font-bold text-white text-xs">{ed.degree} in {ed.fieldOfStudy}</h4>
                      <p className="text-[10px] text-indigo-400">{ed.school} | Graduated {ed.year}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Primary Save Changes trigger */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-650 text-white font-semibold text-xs tracking-wider uppercase shadow-xl shadow-indigo-600/10 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save Profile changes
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
