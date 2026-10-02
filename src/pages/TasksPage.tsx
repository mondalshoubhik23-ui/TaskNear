import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Compass,
  PlusCircle,
  Filter,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  Utensils,
  Package,
  ShoppingBag,
  Truck,
  FileText,
  Cpu,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface TasksPageProps {
  setCurrentView: (view: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ setCurrentView }) => {
  const { user, categories, persona, setPersona, openAuthModal } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterUrgent, setFilterUrgent] = useState<boolean>(false);

  // Initial foundational sample tasks illustrating Phase 2 marketplace behavior
  const sampleTasks = [
    {
      id: 'task_demo_1',
      title: 'Lunch pickup from Aavin / Canteen to Senbagam Hostel',
      category: 'Food Pickup',
      category_id: 'cat_food',
      icon: Utensils,
      worker_fee: 70,
      item_cost: 240,
      total: 310,
      distance: '1.1 km',
      area: 'SRM KTR Campus · Near Java Gate',
      time: 'Today by 1:30 PM',
      creator: 'Priya K.',
      creator_rating: 4.8,
      is_urgent: true,
      description: 'Need 2 meals picked up from Aavin kiosk near tech park and dropped at Senbagam hostel entrance.',
    },
    {
      id: 'task_demo_2',
      title: 'Lab Manual Photocopy & Spiral Binding',
      category: 'Printing / Academic',
      category_id: 'cat_printing',
      icon: FileText,
      worker_fee: 50,
      item_cost: 110,
      total: 160,
      distance: '600 m',
      area: 'SRM Tech Park Xerox Center',
      time: 'Today by 5:00 PM',
      creator: 'Rohan V.',
      creator_rating: 5.0,
      is_urgent: false,
      description: 'Need 45 pages printed and spiral bound from PDF. PDF will be sent on chat once accepted.',
    },
    {
      id: 'task_demo_3',
      title: 'Courier Parcel collection from Main Gate Post Office',
      category: 'Pickup / Delivery',
      category_id: 'cat_parcel',
      icon: Package,
      worker_fee: 80,
      item_cost: 0,
      total: 80,
      distance: '1.4 km',
      area: 'Potheri Post Office to Nelson Mandela Hostel',
      time: 'Before 6:00 PM',
      creator: 'Aditya S.',
      creator_rating: 4.9,
      is_urgent: false,
      description: 'Collect DTDC courier using OTP and hand over at Nelson Mandela hostel security desk.',
    },
    {
      id: 'task_demo_4',
      title: 'Heavy Luggage assistance for Hostel Room shifting',
      category: 'Moving / Helping',
      category_id: 'cat_moving',
      icon: Truck,
      worker_fee: 200,
      item_cost: 0,
      total: 200,
      distance: '800 m',
      area: 'Began Hostel to Kaveri Hostel',
      time: 'Tomorrow, 10:00 AM',
      creator: 'Karan M.',
      creator_rating: 4.7,
      is_urgent: false,
      description: 'Help moving two large suitcases and a trunk down to 1st floor of Kaveri hostel.',
    },
  ];

  const filteredTasks = sampleTasks.filter((t) => {
    if (selectedCategory !== 'all' && t.category_id !== selectedCategory) return false;
    if (filterUrgent && !t.is_urgent) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" />
            <span>Nearby Tasks &amp; Micro-Errands</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse active gigs nearby. Pay-after-delivery settlements guarantee worker fees and purchase reimbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!user) openAuthModal('register');
              else setPersona('customer');
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a New Task</span>
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const Icon = task.icon;
          return (
            <div
              key={task.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {task.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {task.title}
                    </h3>
                  </div>
                </div>

                {task.is_urgent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 shrink-0">
                    Urgent
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {task.description}
              </p>

              {/* Location & Time */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.area} ({task.distance})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.time}</span>
                </div>
              </div>

              {/* Pay-After-Delivery Settlement Breakdown */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500">Worker Payout</div>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ₹{task.worker_fee}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">
                      {task.item_cost > 0 ? `(+ ₹${task.item_cost} item reimbursement)` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Total Customer Budget</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    ₹{task.total}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">{task.creator}</span>
                  <span className="text-amber-500">★ {task.creator_rating}</span>
                </div>

                <button
                  onClick={() => {
                    if (!user) openAuthModal('login');
                    else alert('Task marketplace lifecycle is activated in Phase 2.');
                  }}
                  className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-xs hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-slate-950 transition-colors cursor-pointer"
                >
                  View &amp; Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
