import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { db, doc, setDoc, handleFirestoreError, OperationType } from '../firebase';
import { Save, Settings as SettingsIcon, Target, Wallet, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const SettingsView = () => {
  const { user, settings, loading } = useAppContext();
  const [formData, setFormData] = useState({
    startingCapital: 0,
    monthlyBudget: 0,
    savingsGoal: 0,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({
        startingCapital: settings.startingCapital,
        monthlyBudget: settings.monthlyBudget,
        savingsGoal: settings.savingsGoal,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'current');
      await setDoc(settingsRef, formData);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/settings/current`);
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/30">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">App Settings</h1>
          <p className="text-slate-400 text-sm">Configure your financial goals and starting points.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starting Capital */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <Landmark size={20} />
              <h2 className="font-semibold">Fantasy Finance</h2>
            </div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Starting Capital (₹)</label>
            <input
              type="number"
              value={formData.startingCapital}
              onChange={(e) => setFormData({ ...formData, startingCapital: Number(e.target.value) })}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              placeholder="Enter starting capital"
              required
            />
          </div>

          {/* Monthly Budget */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-purple-400">
              <Wallet size={20} />
              <h2 className="font-semibold">Personal Finance</h2>
            </div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Monthly Budget (₹)</label>
            <input
              type="number"
              value={formData.monthlyBudget}
              onChange={(e) => setFormData({ ...formData, monthlyBudget: Number(e.target.value) })}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              placeholder="Enter monthly budget"
              required
            />
          </div>

          {/* Savings Goal */}
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl md:col-span-2">
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Target size={20} />
              <h2 className="font-semibold">Savings Goal</h2>
            </div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Monthly Savings Goal (₹)</label>
            <input
              type="number"
              value={formData.savingsGoal}
              onChange={(e) => setFormData({ ...formData, savingsGoal: Number(e.target.value) })}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Enter savings goal"
              required
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
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </motion.div>
  );
};

export default SettingsView;
