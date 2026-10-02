import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  MapPin,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Utensils,
  Package,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  Building2,
  Lock,
} from 'lucide-react';

interface HomePageProps {
  setCurrentView: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentView }) => {
  const { user, openAuthModal, colleges, categories, setPersona } = useAuth();
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('col_srm_ktr');

  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId) || colleges[0];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-transparent dark:from-emerald-950/20 dark:via-slate-900 dark:to-transparent border-b border-slate-100 dark:border-slate-800 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Core Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pilot badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Hyperlocal Task &amp; Errand Network · SRM &amp; Beyond</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] text-balance">
                Get errands done in minutes. Earn money on your own schedule.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Post any micro-task—food delivery from Potheri, urgent printouts, campus parcel pickups, or technical help.
                Nearby students and community members accept and deliver with secure pay-after-delivery peace of mind.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    setPersona('customer');
                    if (!user) {
                      openAuthModal('register');
                    } else {
                      setCurrentView('tasks');
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Need Help? Post a Task</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setPersona('worker');
                    if (!user) {
                      openAuthModal('register');
                    } else {
                      setCurrentView('tasks');
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>I Want to Earn Money</span>
                </button>
              </div>

              {/* Micro Trust Stats */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Student &amp; Resident IDs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Pay-After-Delivery Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Avg. Match under 8 min</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-[4/3] sm:aspect-[16/10] lg:aspect-square">
                {/* Real generated high-fidelity asset with zero-broken fallback */}
                <img
                  src="/src/assets/images/campus_hero_errand_1790962768812.jpg"
                  alt="Student completing campus errand"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual container if image load fails
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Floating Live Card Overlay */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          Food Pickup · Potheri Canteen
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          1.2 km away · To Java Hostel Gate
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₹70 Fee
                      </div>
                      <div className="text-[10px] text-slate-400">
                        + ₹240 Food
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* College & Community Selection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Hyperlocal Hub: {selectedCollege?.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedCollege?.city}, {selectedCollege?.state} — Anyone from any college or residential locality can participate.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Errand Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Popular Micro-Tasks &amp; Errands
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Small real-world tasks your peers and neighbors handle daily
            </p>
          </div>
          <button
            onClick={() => setCurrentView('tasks')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => setCurrentView('tasks')}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 transition-colors">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  from ₹{cat.base_suggested_fee}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Critical Feature: Pay-After-Delivery Flow Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Risk · Fair Exchange</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Pay-After-Delivery: Safe for Customers &amp; Workers
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Customers never hand over cash upfront to strangers. If your task requires purchasing food or store items, the worker buys it with verified proof, delivers it directly to you, and payment is settled only after you confirm receipt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 relative z-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-1">Step 1</div>
              <h4 className="text-sm font-bold">Post with Budget</h4>
              <p className="text-xs text-slate-400 mt-1">Specify worker fee (e.g. ₹50) + estimated item cost (e.g. ₹250).</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-1">Step 2</div>
              <h4 className="text-sm font-bold">Worker Accepts</h4>
              <p className="text-xs text-slate-400 mt-1">Nearby student/worker accepts and heads to store/canteen.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-1">Step 3</div>
              <h4 className="text-sm font-bold">Delivery &amp; Receipt</h4>
              <p className="text-xs text-slate-400 mt-1">Worker delivers item to your hostel or gate and shares receipt.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-1">Step 4</div>
              <h4 className="text-sm font-bold">Confirm &amp; Settle</h4>
              <p className="text-xs text-slate-400 mt-1">Customer taps &ldquo;Received&rdquo;, settling ₹300 total (₹50 fee + ₹250 reimbursement).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built for Real Campus &amp; Community Trust
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Safety, verification, and accountability at every stage of every errand
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">College ID Verification</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Students from SRM and other colleges can submit their campus ID card or university email for official verification badges and higher purchase allowances.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Privacy-Preserving Locations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              No continuous background GPS tracking. Tasks only reveal approximate landmarks or campus gates until accepted and matched.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Dual Ratings &amp; Reviews</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Every completed task prompts two-way ratings. Good workers build peer reputations, and reliable customers get accepted faster.
            </p>
          </div>
        </div>
      </section>

      {/* Fast CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Ready to post your first task?</h3>
            <p className="text-sm text-emerald-100 mt-1 max-w-xl">
              Registration is completely open to everyone. No 100-user limits. Join the campus and community network today.
            </p>
          </div>
          <button
            onClick={() => openAuthModal('register')}
            className="px-6 py-3.5 bg-white text-emerald-800 font-bold text-sm rounded-2xl shadow-lg hover:bg-emerald-50 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      </section>
    </div>
  );
};
