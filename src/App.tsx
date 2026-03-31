import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User, db, onSnapshot, collection, doc, getDoc, setDoc, handleFirestoreError, OperationType } from './firebase';
import { LayoutDashboard, PlusCircle, BarChart3, Wallet, PieChart, Settings, LogOut, Menu, X, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ErrorBoundary from './components/ErrorBoundary';
import { cn, formatCurrency } from './lib/utils';

// --- Types ---
export interface UserSettings {
  startingCapital: number;
  monthlyBudget: number;
  savingsGoal: number;
}

export interface FantasyRecord {
  id: string;
  date: string;
  walletBalance: number;
  deposit: number;
  withdraw: number;
  contestEntry: number;
  contestWinning: number;
  affiliateIncome: number;
  uid: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  papaMoney: number;
  freelanceIncome: number;
  expenseAmount: number;
  category: 'Food' | 'Travel' | 'Recharge' | 'Shopping' | 'Other';
  notes?: string;
  uid: string;
}

interface AppContextType {
  user: User | null;
  settings: UserSettings | null;
  fantasyRecords: FantasyRecord[];
  expenseRecords: ExpenseRecord[];
  loading: boolean;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- Components ---

const Sidebar = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Add Fantasy Record', icon: PlusCircle, path: '/fantasy/add' },
    { name: 'Fantasy Reports', icon: BarChart3, path: '/fantasy/reports' },
    { name: 'Personal Finance', icon: Wallet, path: '/personal' },
    { name: 'Expense Reports', icon: PieChart, path: '/personal/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#1e293b] border border-slate-700 rounded-lg text-slate-300 shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#0f172a] border-r border-slate-800/50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <IndianRupee className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              S&M Finance
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? "text-cyan-400" : "group-hover:text-slate-200")} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <button 
            onClick={() => signOut(auth)}
            className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut size={20} className="group-hover:text-red-400" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const Auth = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#1e293b]/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            <IndianRupee className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">S&M Finance</h1>
          <p className="text-slate-400">Track your fantasy and personal finance with style.</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] group"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [fantasyRecords, setFantasyRecords] = useState<FantasyRecord[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) {
        setLoading(false);
        setSettings(null);
        setFantasyRecords([]);
        setExpenseRecords([]);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Fetch Settings
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'current');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as UserSettings);
      } else {
        setSettings(null);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}/settings/current`));

    // Fetch Fantasy Records
    const fantasyRef = collection(db, 'users', user.uid, 'fantasyRecords');
    const unsubFantasy = onSnapshot(fantasyRef, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FantasyRecord));
      setFantasyRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/fantasyRecords`));

    // Fetch Expense Records
    const expenseRef = collection(db, 'users', user.uid, 'expenseRecords');
    const unsubExpense = onSnapshot(expenseRef, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseRecord));
      setExpenseRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/expenseRecords`));

    return () => {
      unsubSettings();
      unsubFantasy();
      unsubExpense();
    };
  }, [user]);

  if (!authReady) return null;

  if (!user) return <Auth />;

  return (
    <ErrorBoundary>
      <AppContext.Provider value={{ user, settings, fantasyRecords, expenseRecords, loading, refreshData: () => {} }}>
        <Router>
          <div className="min-h-screen bg-[#0f172a] text-slate-200">
            <Sidebar />
            <main className="lg:ml-64 p-6 lg:p-10">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<DashboardView />} />
                  <Route path="/fantasy/add" element={<FantasyFormView />} />
                  <Route path="/fantasy/reports" element={<FantasyReportsView />} />
                  <Route path="/personal" element={<PersonalFinanceView />} />
                  <Route path="/personal/reports" element={<ExpenseReportsView />} />
                  <Route path="/settings" element={<SettingsView />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </Router>
      </AppContext.Provider>
    </ErrorBoundary>
  );
}

import DashboardView from './components/DashboardView';
import FantasyFormView from './components/FantasyFormView';
import FantasyReportsView from './components/FantasyReportsView';
import PersonalFinanceView from './components/PersonalFinanceView';
import ExpenseReportsView from './components/ExpenseReportsView';
import SettingsView from './components/SettingsView';

// --- Main App ---
