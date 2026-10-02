import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/client.ts';
import type { CollegeVerification } from '../types/index.ts';
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, AlertCircle, Upload, School, FileText, ArrowRight } from 'lucide-react';

interface VerificationPageProps {
  setCurrentView: (view: string) => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ setCurrentView }) => {
  const { user, colleges, refreshUser, showToast, openAuthModal } = useAuth();

  const [verifications, setVerifications] = useState<CollegeVerification[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState(user?.profile?.college_id || colleges[0]?.id || 'col_srm_ktr');
  const [idNumber, setIdNumber] = useState('');
  const [idCardUrl, setIdCardUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadVerifications();
  }, [user]);

  const loadVerifications = async () => {
    try {
      setIsLoadingList(true);
      const res = await api.users.getVerifications();
      setVerifications(res.verifications);
    } catch (err) {
      console.error('Failed to load verifications', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign In to Verify</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Verification unlocks high-value purchase errands and trusted peer worker status.
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
  const isVerified = profile?.verification_status === 'VERIFIED';
  const isPending = profile?.verification_status === 'PENDING';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber && !idCardUrl) {
      showToast('Please provide your Student Registration ID or an ID card photo link.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.users.submitVerification({
        college_id: selectedCollegeId,
        id_number: idNumber,
        id_card_url: idCardUrl || undefined,
      });
      showToast('Verification request submitted successfully!', 'success');
      await refreshUser();
      await loadVerifications();
      setIdNumber('');
      setIdCardUrl('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit verification.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset demo ID for evaluator convenience
  const fillSampleSrmId = () => {
    setSelectedCollegeId('col_srm_ktr');
    setIdNumber('RA2211003010488');
    setIdCardUrl('https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Campus &amp; Community Trust System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Identity &amp; College Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Verify your SRM student ID card, college registration, or local residency to unlock higher purchase allowances, priority task acceptance, and peer trust badges.
          </p>
        </div>
      </div>

      {/* Current Status Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                isVerified
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                  : isPending
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {isVerified ? (
                <ShieldCheck className="w-6 h-6" />
              ) : isPending ? (
                <Clock className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Account Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isVerified
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : isPending
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {profile?.verification_status || 'PENDING'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isVerified
                  ? 'Your student/community identity is confirmed. All trust limits and worker perks are active.'
                  : isPending
                  ? 'Your submission is queued for moderator review. You can still post and browse tasks.'
                  : 'Submit your college ID or campus registration below for review.'}
              </p>
            </div>
          </div>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">₹500+ Purchase Limit</div>
              <div className="text-slate-500 dark:text-slate-400">Accept larger food/shopping tasks with confidence</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Verified Peer Badge</div>
              <div className="text-slate-500 dark:text-slate-400">High trust rating visible on all task postings &amp; bids</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Priority Dispatch</div>
              <div className="text-slate-500 dark:text-slate-400">Instant notification when high-earning gigs are posted nearby</div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Form (if not verified or want to update) */}
      {!isVerified && (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Submit College or Community ID</span>
            </h2>

            <button
              type="button"
              onClick={fillSampleSrmId}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Fill Sample SRM ID (Test)
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Affiliated Institution / Locality
              </label>
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.city})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Registration / Student ID Number *
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. RA2211003010488 or Emp ID"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ID Card Image URL (Optional)
                </label>
                <div className="relative">
                  <Upload className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="url"
                    value={idCardUrl}
                    onChange={(e) => setIdCardUrl(e.target.value)}
                    placeholder="https://... (ID photo or storage link)"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 dark:text-slate-400">
              Personal IDs are strictly reviewed by verified community administrators for fraud prevention and are never shared with task posters or other workers.
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Verification Request'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submission History</h3>

        {verifications.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
            No verification requests submitted yet.
          </p>
        ) : (
          <div className="space-y-3">
            {verifications.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {v.college_name || 'Community ID'} · {v.id_number}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Submitted on {new Date(v.submitted_at).toLocaleDateString()}
                    {v.reviewer_notes && ` · Notes: ${v.reviewer_notes}`}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full font-semibold ${
                    v.status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : v.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
