import React, { useState } from 'react';
import { useAppContext } from '../App';
import { db, collection, addDoc, handleFirestoreError, OperationType } from '../firebase';
import { Wallet, Calendar, User, Briefcase, ShoppingBag, FileText, PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const PersonalFinanceView = () => {
  const { user } = useAppContext();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    papaMoney: 0,
    freelanceIncome: 0,
    expenseAmount: 0,
    category: 'Other' as 'Food' | 'Travel' | 'Recharge' | 'Shopping' | 'Other',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const expenseRef = collection(db, 'users', user.uid, 'expenseRecords');
      await addDoc(expenseRef, {
        ...formData,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });
      setMessage({ type: 'success', text: 'Personal record added successfully!' });
      // Reset form (except date)
      setFormData({
        ...formData,
        papaMoney: 0,
        freelanceIncome: 0,
        expenseAmount: 0,
        category: 'Other',
        notes: '',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/expenseRecords`);
      setMessage({ type: 'error', text: 'Failed to add personal record.' });
    } finally {
      setSaving(false);
    }
  };

  const categories = ['Food', 'Travel', 'Recharge', 'Shopping', 'Other'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Wallet size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Personal Finance</h1>
          <p className="text-slate-400 text-sm">Track your personal income and daily expenses.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-purple-400">
              <Calendar size={20} />
              <h2 className="font-semibold">Date</h2>
            </div>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              required
            />
          </div>

          {/* Income Sources */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <TrendingUp size={20} />
              <h2 className="font-semibold">Income Sources (₹)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1 flex items-center gap-2">
                  <User size={12} /> Money from Papa
                </label>
                <input
                  type="number"
                  value={formData.papaMoney}
                  onChange={(e) => setFormData({ ...formData, papaMoney: Number(e.target.value) })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 flex items-center gap-2">
                  <Briefcase size={12} /> Freelance Income
                </label>
                <input
                  type="number"
                  value={formData.freelanceIncome}
                  onChange={(e) => setFormData({ ...formData, freelanceIncome: Number(e.target.value) })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Expense Details */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <ShoppingBag size={20} />
              <h2 className="font-semibold">Expense Details (₹)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Expense Amount</label>
                <input
                  type="number"
                  value={formData.expenseAmount}
                  onChange={(e) => setFormData({ ...formData, expenseAmount: Number(e.target.value) })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-slate-400">
              <FileText size={20} />
              <h2 className="font-semibold">Notes</h2>
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-slate-500 outline-none transition-all h-[108px] resize-none"
              placeholder="Add any details..."
            />
          </div>
        </div>

        {message && (
          <div className={cn(
            "p-4 rounded-xl border text-sm font-medium",
            message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
          )}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
        >
          <PlusCircle size={20} />
          {saving ? 'Adding...' : 'Add Record'}
        </button>
      </form>
    </motion.div>
  );
};

const TrendingUp = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

export default PersonalFinanceView;
