import React, { useState, useEffect } from 'react';
import { FinancialState, Debt, Investment, Expense } from './types';
import { fetchFinancialData, saveDebt, deleteDebt, saveInvestment, deleteInvestment, saveExpense, deleteExpense, saveIncomeSource, deleteIncomeSource } from './api';
import { Dashboard } from './components/Dashboard';
import { DebtManager } from './components/DebtManager';
import { InvestmentTracker } from './components/InvestmentTracker';
import { ExpenseTracker } from './components/ExpenseTracker';
import { FinancialCalendar } from './components/FinancialCalendar';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { LayoutDashboard, CreditCard, TrendingUp, Receipt, Calendar, Wallet, Settings as SettingsIcon, BarChart3, Brain, X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getFinancialOverview } from './services/geminiService';
import Markdown from 'react-markdown';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'debts' | 'investments' | 'expenses' | 'calendar' | 'reports' | 'settings' | 'about'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showGlobalAI, setShowGlobalAI] = useState(false);
  const [globalAIResult, setGlobalAIResult] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [state, setState] = useState<FinancialState>({
    debts: [],
    investments: [],
    expenses: [],
    incomeSources: []
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const hasData = state.debts.length > 0 || state.investments.length > 0 || state.expenses.length > 0;

  const loadData = async () => {
    try {
      const data = await fetchFinancialData();
      setState(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    }
  }, [theme]);

  const handleSaveDebt = async (debt: Debt) => {
    await saveDebt(debt);
    loadData();
  };

  const handleDeleteDebt = async (id: string) => {
    await deleteDebt(id);
    loadData();
  };

  const handleSaveInvestment = async (inv: Investment) => {
    await saveInvestment(inv);
    loadData();
  };

  const handleDeleteInvestment = async (id: string) => {
    await deleteInvestment(id);
    loadData();
  };

  const handleSaveExpense = async (exp: Expense) => {
    await saveExpense(exp);
    loadData();
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    loadData();
  };

  const handleSaveIncomeSource = async (source: any) => {
    await saveIncomeSource(source);
    loadData();
  };

  const handleDeleteIncomeSource = async (id: string) => {
    await deleteIncomeSource(id);
    loadData();
  };

  const handleGlobalAIAnalysis = async () => {
    setShowGlobalAI(true);
    if (globalAIResult) return;
    setLoadingAI(true);
    try {
      const result = await getFinancialOverview(state);
      setGlobalAIResult(result || "No analysis available.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading your financial world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col p-4 fixed h-full transition-all duration-300 z-50`}>
        <div className="flex flex-col mb-12">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-black rounded-xl flex-shrink-0 flex items-center justify-center">
                <Wallet className="text-white" size={24} />
              </div>
              {!isSidebarCollapsed && <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">FinFlow</h1>}
            </div>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            >
              {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          
          <div className={`px-2 transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Net Worth</p>
              <p className="text-lg font-bold">
                ${(state.investments.reduce((a, b) => a + (Number(b.amount) || 0), 0) - state.debts.reduce((a, b) => a + (Number(b.amount) || 0), 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'debts'} onClick={() => setActiveTab('debts')} icon={<CreditCard size={20} />} label="Debts" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'investments'} onClick={() => setActiveTab('investments')} icon={<TrendingUp size={20} />} label="Investments" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Receipt size={20} />} label="Expenses" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<Calendar size={20} />} label="Calendar" collapsed={isSidebarCollapsed} />
          <NavButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 size={20} />} label="Reports" collapsed={isSidebarCollapsed} />
          
          <div className={`pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : 'px-2'}`}>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-black text-white' : 'text-slate-400 hover:bg-slate-100'}`}
              title="Settings"
            >
              <SettingsIcon size={20} />
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`p-2 rounded-xl transition-all ${activeTab === 'about' ? 'bg-black text-white' : 'text-slate-400 hover:bg-slate-100'}`}
              title="About"
            >
              <Info size={20} />
            </button>
          </div>
        </nav>

        <button 
          onClick={handleGlobalAIAnalysis}
          disabled={!hasData}
          className={`mt-4 flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
            !hasData 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
          title={!hasData ? "Input data for analysis" : "AI Analysis"}
        >
          <Brain size={20} />
          {!isSidebarCollapsed && <span>AI Analysis</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} p-10 transition-all duration-300`}>
        <AnimatePresence mode="wait" initial={animationsEnabled}>
          <motion.div
            key={activeTab}
            initial={animationsEnabled ? { opacity: 0, y: 10 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            exit={animationsEnabled ? { opacity: 0, y: -10 } : undefined}
            transition={{ duration: animationsEnabled ? 0.2 : 0 }}
          >
            {activeTab === 'dashboard' && <Dashboard {...state} />}
            {activeTab === 'debts' && <DebtManager state={state} onSave={handleSaveDebt} onDelete={handleDeleteDebt} />}
            {activeTab === 'investments' && <InvestmentTracker state={state} onSave={handleSaveInvestment} onDelete={handleDeleteInvestment} />}
            {activeTab === 'expenses' && <ExpenseTracker state={state} onSave={handleSaveExpense} onDelete={handleDeleteExpense} onSaveIncomeSource={handleSaveIncomeSource} onDeleteIncomeSource={handleDeleteIncomeSource} />}
            {activeTab === 'calendar' && <FinancialCalendar state={state} />}
            {activeTab === 'reports' && <Reports state={state} />}
            {activeTab === 'settings' && <Settings theme={theme} setTheme={setTheme} animationsEnabled={animationsEnabled} setAnimationsEnabled={setAnimationsEnabled} />}
            {activeTab === 'about' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Info className="text-slate-400" size={28} />
                  <h2 className="text-2xl font-bold">About FinFlow</h2>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 prose prose-slate max-w-none">
                  <p className="text-lg text-slate-600">
                    FinFlow is your personal financial command center, designed to help you track assets, manage liabilities, and optimize your path to financial freedom.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    <div>
                      <h3 className="font-bold text-slate-900">Our Mission</h3>
                      <p className="text-slate-500">To provide clarity and actionable insights into personal finance through intuitive design and intelligent analysis.</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Privacy First</h3>
                      <p className="text-slate-500">Your financial data is yours alone. We prioritize security and privacy in every feature we build.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global AI Modal */}
      <AnimatePresence initial={animationsEnabled}>
        {showGlobalAI && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <motion.div 
              initial={animationsEnabled ? { scale: 0.9, opacity: 0 } : undefined}
              animate={{ scale: 1, opacity: 1 }}
              exit={animationsEnabled ? { scale: 0.9, opacity: 0 } : undefined}
              className="bg-white rounded-3xl p-8 w-full max-w-3xl shadow-2xl max-h-[80vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setShowGlobalAI(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                  <Brain className="text-indigo-600" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Financial Overview</h2>
                  <p className="text-slate-500">Intelligent performance analysis across all your accounts</p>
                </div>
              </div>

              {loadingAI ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-500 font-medium animate-pulse">Gemini is analyzing your financial patterns...</p>
                </div>
              ) : (
                <div className="prose prose-indigo max-w-none">
                  <Markdown>{globalAIResult}</Markdown>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowGlobalAI(false)}
                  className="px-6 py-2 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors font-bold"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label, collapsed }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; collapsed?: boolean }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    } ${collapsed ? 'justify-center px-0' : ''}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    {!collapsed && <span className="font-semibold whitespace-nowrap">{label}</span>}
  </button>
);
