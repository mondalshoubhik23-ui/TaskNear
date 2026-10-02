import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/client.ts';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Star,
  CheckCircle,
  Briefcase,
  MapPin,
  Save,
  Plus,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

interface ProfilePageProps {
  setCurrentView: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setCurrentView }) => {
  const { user, refreshUser, toggleAvailability, showToast, colleges, categories, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Please sign in to view and manage your profile, skills, and availability.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const profile = user.profile;

  // Edit states
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(profile?.bio || '');
  const [collegeId, setCollegeId] = useState(profile?.college_id || 'col_srm_ktr');
  const [department, setDepartment] = useState(profile?.department || '');
  const [yearOfStudy, setYearOfStudy] = useState(profile?.year_of_study || '');
  const [approxAddress, setApproxAddress] = useState(profile?.approx_address || '');
  const [maxPurchaseLimit, setMaxPurchaseLimit] = useState(profile?.max_purchase_limit || 500);

  // Skills
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  // Preferred categories
  const [prefCategories, setPrefCategories] = useState<string[]>(profile?.preferred_categories || []);

  const [isSaving, setIsSaving] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const toggleCategory = (catId: string) => {
    if (prefCategories.includes(catId)) {
      setPrefCategories(prefCategories.filter((c) => c !== catId));
    } else {
      setPrefCategories([...prefCategories, catId]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.users.updateProfile({
        name,
        bio,
        college_id: collegeId,
        department,
        year_of_study: yearOfStudy,
        approx_address: approxAddress,
        max_purchase_limit: Number(maxPurchaseLimit),
        skills,
        preferred_categories: prefCategories,
      });
      await refreshUser();
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const isVerified = profile?.verification_status === 'VERIFIED';
  const isPending = profile?.verification_status === 'PENDING';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Member
                  </span>
                ) : isPending ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    Verification Pending
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentView('verification')}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Get Verified ID
                  </button>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>{user.email}</span>
                <span aria-hidden="true">·</span>
                <span>{profile?.college?.name || 'Local Community Member'}</span>
                {profile?.department && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{profile.department}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Availability Switch */}
          <div className="w-full sm:w-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between sm:justify-start gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Worker Availability</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {profile?.is_available ? 'Accepting nearby errands' : 'Temporarily offline'}
              </div>
            </div>

            <button
              onClick={toggleAvailability}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                profile?.is_available ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={profile?.is_available}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  profile?.is_available ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Dual Persona Metrics: Customer + Worker in One Account */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tasks Completed</div>
            <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              {profile?.tasks_completed || 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tasks Posted</div>
            <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
              {profile?.tasks_posted || 0}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Peer Rating</div>
            <div className="text-xl font-black text-amber-500 tabular-nums mt-0.5 flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-500" />
              <span>{profile?.rating_avg?.toFixed(1) || '5.0'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Purchase Cap</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              ₹{profile?.max_purchase_limit || 500}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Profile &amp; Errand Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                College or Community
              </label>
              <select
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Bio / What can you help with?
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. 3rd year CSE student at SRM. Available for food pickup from Potheri, quick printing, or tech help."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Biotechnology"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Year / Role
              </label>
              <input
                type="text"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                placeholder="e.g. 3rd Year"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Purchase Limit (₹)
              </label>
              <input
                type="number"
                min={100}
                max={5000}
                step={50}
                value={maxPurchaseLimit}
                onChange={(e) => setMaxPurchaseLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Approximate Campus/Community Area (Privacy-Safe)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={approxAddress}
                onChange={(e) => setApproxAddress(e.target.value)}
                placeholder="e.g. Java Hostel Gate, SRM KTR"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Exact room/door numbers are never shown publicly. Only approximate landmarks for matching.
            </p>
          </div>

          {/* Skills Management */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Skills &amp; Capabilities
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. Two-wheeler delivery, C++ debugging, Moving assistance)"
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Preferred Categories */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Preferred Errand Categories
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = prefCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
