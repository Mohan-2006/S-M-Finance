import React, { useMemo } from 'react';
import { useAppContext } from '../App';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, Wallet, Calendar, ShoppingBag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

const ExpenseReportsView = () => {
  const { expenseRecords, loading } = useAppContext();

  const chartData = useMemo(() => {
    return expenseRecords.slice().reverse().map(r => ({
      date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      income: r.papaMoney + r.freelanceIncome,
      expense: r.expenseAmount,
      savings: (r.papaMoney + r.freelanceIncome) - r.expenseAmount
    }));
  }, [expenseRecords]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenseRecords.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + r.expenseAmount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenseRecords]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (expenseRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <PieChartIcon size={64} className="mb-4 opacity-20" />
        <p>No expense records found. Add some records to see reports.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/30">
          <PieChartIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Expense Reports</h1>
          <p className="text-slate-400 text-sm">Detailed analysis of your personal income and expenses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expense Chart */}
        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ShoppingBag size={20} className="text-pink-400" />
            Expense by Category
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Savings Trend */}
        <div className="lg:col-span-2 bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Wallet size={20} className="text-purple-400" />
            Savings Trend
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                itemStyle={{ color: '#a855f7' }}
              />
              <Area type="monotone" dataKey="savings" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseReportsView;
