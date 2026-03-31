import React, { useState } from 'react';
import { useAppContext } from '../App';
import { db, collection, addDoc, handleFirestoreError, OperationType } from '../firebase';
import { PlusCircle, Calendar, Wallet, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const FantasyFormView = () => {
  const { user } = useAppContext();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    walletBalance: 0,
    deposit: 0,
    withdraw: 0,
    contestEntry: 0,
    contestWinning: 0,
    affiliateIncome: 0,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const fantasyRef = collection(db, 'users', user.uid, 'fantasyRecords');
      await addDoc(fantasyRef, {
        ...formData,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });
      setMessage({ type: 'success', text: 'Fantasy record added successfully!' });
      // Reset form (except date)
      setFormData({
        ...formData,
        walletBalance: 0,
        deposit: 0,
        withdraw: 0,
        contestEntry: 0,
        contestWinning: 0,
        affiliateIncome: 0,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/fantasyRecords`);
      setMessage({ type: 'error', text: 'Failed to add fantasy record.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <PlusCircle size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Add Fantasy Record</h1>
          <p className="text-slate-400 text-sm">Log your daily fantasy finance activity.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <Calendar size={20} />
              <h2 className="font-semibold">Date</h2>
            </div>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              required
            />
          </div>

          {/* Wallet Balance */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-purple-400">
              <Wallet size={20} />
              <h2 className="font-semibold">Wallet Balance (₹)</h2>
            </div>
            <input
              type="number"
              value={formData.walletBalance}
              onChange={(e) => setFormData({ ...formData, walletBalance: Number(e.target.value) })}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="0"
              required
            />
          </div>

          {/* Deposit & Withdraw */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <TrendingUp size={20} />
              <h2 className="font-semibold">Deposit & Withdraw (₹)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Deposit</label>
                <input
                  type="number"
                  value={formData.deposit}
                  onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Withdraw</label>
                <input
                  type="number"
                  value={formData.withdraw}
                  onChange={(e) => setFormData({ ...formData, withdraw: Number(e.target.value) })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Contest Entry & Winning */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <TrendingDown size={20} />
              <h2 className="font-semibold">Contest Activity (₹)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Entry Amount</label>
                <input
                  type="number"
                  value={formData.contestEntry}
                  onChange={(e) => setFormData({ ...formData, contestEntry: Number(e.target.value) })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Winning Amount</label>
                <input
                  type="number"
                  value={formData.contestWinning}
                  onChange={(e) => setFormData({ ...formData, contestWinning: Number(e.target.value) })}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Affiliate Income */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl md:col-span-2">
            <div className="flex items-center gap-3 mb-4 text-pink-400">
              <Users size={20} />
              <h2 className="font-semibold">Affiliate Income (₹)</h2>
            </div>
            <input
              type="number"
              value={formData.affiliateIncome}
              onChange={(e) => setFormData({ ...formData, affiliateIncome: Number(e.target.value) })}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              placeholder="0"
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
          className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
        >
          <PlusCircle size={20} />
          {saving ? 'Adding...' : 'Add Record'}
        </button>
      </form>
    </motion.div>
  );
};

export default FantasyFormView;
