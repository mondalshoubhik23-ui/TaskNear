import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/client.ts';
import type { AdminStats, CollegeVerification } from '../types/index.ts';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  RefreshCw,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface AdminPageProps {
  setCurrentView: (view: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ setCurrentView }) => {
  const { user, showToast, login } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<CollegeVerification[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'audit'>('verifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, verRes, logsRes] = await Promise.allSettled([
        api.admin.getStats(),
        api.admin.getUsers({ search: searchQuery }),
        api.admin.getVerifications(),
        api.admin.getAuditLogs(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.users);
      if (verRes.status === 'fulfilled') setVerifications(verRes.value.verifications);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value.logs);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const notes = reviewNotes[id] || (action === 'APPROVE' ? 'Approved by admin' : 'Rejected');
      await api.admin.reviewVerification(id, action, notes);
      showToast(`Verification ${action === 'APPROVE' ? 'approved' : 'rejected'}!`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Review failed.', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.admin.updateUserStatus(userId, nextStatus as any);
      showToast(`User status changed to ${nextStatus}`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <Lock className="w-12 h-12 text-purple-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The Admin Portal is restricted to verified platform moderators. You can switch to the seeded demo administrator account with 1 click:
        </p>
        <button
          onClick={async () => {
            await login({ email: 'admin@taskhop.local', password: 'Admin@123456' });
          }}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md"
        >
          Sign In as Seeded Administrator
        </button>
      </div>
    );
  }

  const pendingVerifications = verifications.filter((v) => v.status === 'PENDING');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TaskHop Admin &amp; Trust Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Moderation Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review student verification queue, manage user accounts, and monitor trust metrics.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Users</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
            {stats?.totalUsers || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Verified IDs</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {stats?.verifiedUsers || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pending Approvals</div>
          <div className="text-2xl font-black text-amber-500 tabular-nums mt-1">
            {stats?.pendingVerifications || pendingVerifications.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Available Workers</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums mt-1">
            {stats?.availableWorkers || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Campus Hubs</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums mt-1">
            {stats?.totalColleges || 6}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Verification Queue ({pendingVerifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">All Caught Up!</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                There are no pending identity verification requests in the review queue.
              </p>
            </div>
          ) : (
            pendingVerifications.map((ver) => (
              <div
                key={ver.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{ver.user_name}</span>
                      <span className="text-xs text-slate-500">({ver.user_email})</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Affiliation: <strong>{ver.college_name || 'Community'}</strong> · ID / Reg No:{' '}
                      <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                        {ver.id_number || 'N/A'}
                      </code>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Submitted: {new Date(ver.submitted_at).toLocaleString()}
                  </div>
                </div>

                {ver.id_card_url && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Submitted ID Card / Proof:
                    </span>
                    <a
                      href={ver.id_card_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline break-all"
                    >
                      {ver.id_card_url}
                    </a>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={reviewNotes[ver.id] || ''}
                    onChange={(e) => setReviewNotes({ ...reviewNotes, [ver.id]: e.target.value })}
                    placeholder="Review notes or rejection reason (optional)"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleReview(ver.id, 'APPROVE')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve ID</span>
                    </button>
                    <button
                      onClick={() => handleReview(ver.id, 'REJECT')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: User Directory */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
              />
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Search
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">College / Area</th>
                  <th className="py-3 px-2">Verification</th>
                  <th className="py-3 px-2">Tasks (Comp/Post)</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div>{u.college_code || 'General'}</div>
                      <div className="text-[11px] text-slate-400">{u.department || '—'}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          u.verification_status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {u.verification_status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-2 tabular-nums">
                      {u.tasks_completed || 0} / {u.tasks_posted || 0}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          u.account_status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {u.account_status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.account_status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                            u.account_status === 'active'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.account_status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security &amp; Action Trail</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                    {log.action}
                  </span>
                  <span className="text-slate-500 ml-2">on {log.entity_type}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
