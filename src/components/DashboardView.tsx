import React, { useMemo } from 'react';
import { useAppContext } from '../App';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, Target, IndianRupee, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group"
  >
    <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-opacity group-hover:opacity-30", color)} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={cn("p-3 rounded-2xl border", color.replace('bg-', 'text-').replace('/20', '/30'), color.replace('bg-', 'bg-').replace('/20', '/10'))}>
        <Icon size={24} />
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg", trend > 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10")}>
          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

const DashboardView = () => {
  const { settings, fantasyRecords, expenseRecords, loading } = useAppContext();

  const fantasyStats = useMemo(() => {
    if (!fantasyRecords.length) return null;
    
    const latest = fantasyRecords[0];
    const totalEntry = fantasyRecords.reduce((acc, r) => acc + r.contestEntry, 0);
    const totalWin = fantasyRecords.reduce((acc, r) => acc + r.contestWinning, 0);
    const totalAffiliate = fantasyRecords.reduce((acc, r) => acc + r.affiliateIncome, 0);
    const totalWithdraw = fantasyRecords.reduce((acc, r) => acc + r.withdraw, 0);
    
    const contestProfit = totalWin - totalEntry;
    const totalMoney = latest.walletBalance + totalWithdraw + totalAffiliate;
    const overallProfit = settings ? totalMoney - settings.startingCapital : 0;
    const roi = totalEntry > 0 ? (overallProfit / totalEntry) * 100 : 0;
    const riskPercentage = latest.walletBalance > 0 ? (latest.contestEntry / latest.walletBalance) * 100 : 0;
    
    let riskLevel = 'Low';
    let riskColor = 'text-emerald-400';
    if (riskPercentage > 10) {
      riskLevel = 'High';
      riskColor = 'text-red-400';
    } else if (riskPercentage > 5) {
      riskLevel = 'Medium';
      riskColor = 'text-amber-400';
    }

    return {
      wallet: latest.walletBalance,
      totalMoney,
      overallProfit,
      roi,
      totalEntry,
      totalWin,
      contestProfit,
      totalAffiliate,
      riskLevel,
      riskColor,
      riskPercentage
    };
  }, [fantasyRecords, settings]);

  const personalStats = useMemo(() => {
    const totalPapa = expenseRecords.reduce((acc, r) => acc + r.papaMoney, 0);
    const totalFreelance = expenseRecords.reduce((acc, r) => acc + r.freelanceIncome, 0);
    const totalIncome = totalPapa + totalFreelance;
    const totalExpenses = expenseRecords.reduce((acc, r) => acc + r.expenseAmount, 0);
    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    return {
      totalPapa,
      totalFreelance,
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate
    };
  }, [expenseRecords]);

  const chartData = useMemo(() => {
    return fantasyRecords.slice(0, 7).reverse().map(r => ({
      date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      balance: r.walletBalance,
      profit: r.contestWinning - r.contestEntry
    }));
  }, [fantasyRecords]);

  const pieData = useMemo(() => {
    if (!fantasyStats) return [];
    return [
      { name: 'Contest', value: fantasyStats.totalWin },
      { name: 'Affiliate', value: fantasyStats.totalAffiliate }
    ];
  }, [fantasyStats]);

  const COLORS = ['#06b6d4', '#ec4899'];

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-10 pb-10">
      {/* Fantasy Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-2 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            Fantasy Finance Tracker
          </h2>
          {fantasyStats && (
            <div className="flex items-center gap-4">
              <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700", fantasyStats.riskColor)}>
                <AlertTriangle size={16} />
                <span className="text-sm font-bold uppercase tracking-wider">Risk: {fantasyStats.riskLevel}</span>
              </div>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", 
                    fantasyStats.riskLevel === 'Low' ? 'bg-emerald-500' : 
                    fantasyStats.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                  )} 
                  style={{ width: `${Math.min(fantasyStats.riskPercentage * 5, 100)}%` }} 
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Wallet Balance" 
            value={formatCurrency(fantasyStats?.wallet || 0)} 
            icon={Wallet} 
            color="bg-cyan-500/20" 
          />
          <StatCard 
            title="Total Money" 
            value={formatCurrency(fantasyStats?.totalMoney || 0)} 
            icon={IndianRupee} 
            color="bg-purple-500/20" 
            subtitle={`Starting: ${formatCurrency(settings?.startingCapital || 0)}`}
          />
          <StatCard 
            title="Overall Profit/Loss" 
            value={formatCurrency(fantasyStats?.overallProfit || 0)} 
            icon={TrendingUp} 
            color="bg-emerald-500/20" 
            trend={fantasyStats?.roi}
          />
          <StatCard 
            title="Affiliate Earnings" 
            value={formatCurrency(fantasyStats?.totalAffiliate || 0)} 
            icon={Target} 
            color="bg-pink-500/20" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Wallet & Profit Trend</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Balance</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Profit</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6">Income Distribution</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Contest Win</span>
                <span className="text-white font-bold">{formatCurrency(fantasyStats?.totalWin || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500" /> Affiliate</span>
                <span className="text-white font-bold">{formatCurrency(fantasyStats?.totalAffiliate || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-2 h-8 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            Personal Expense Tracker
          </h2>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-purple-400">
            <CheckCircle2 size={16} />
            <span className="text-sm font-bold uppercase tracking-wider">Savings Rate: {personalStats.savingsRate.toFixed(1)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Income" 
            value={formatCurrency(personalStats.totalIncome)} 
            icon={TrendingUp} 
            color="bg-emerald-500/20" 
            subtitle={`Papa: ${formatCurrency(personalStats.totalPapa)} | Freelance: ${formatCurrency(personalStats.totalFreelance)}`}
          />
          <StatCard 
            title="Total Expenses" 
            value={formatCurrency(personalStats.totalExpenses)} 
            icon={TrendingDown} 
            color="bg-red-500/20" 
            subtitle={`Budget: ${formatCurrency(settings?.monthlyBudget || 0)}`}
          />
          <StatCard 
            title="Total Savings" 
            value={formatCurrency(personalStats.totalSavings)} 
            icon={Wallet} 
            color="bg-purple-500/20" 
          />
          <StatCard 
            title="Savings Goal" 
            value={formatCurrency(settings?.savingsGoal || 0)} 
            icon={Target} 
            color="bg-cyan-500/20" 
            trend={settings?.savingsGoal ? (personalStats.totalSavings / settings.savingsGoal * 100) : 0}
          />
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
