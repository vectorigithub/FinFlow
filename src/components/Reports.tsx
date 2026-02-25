import React, { useState, useEffect } from 'react';
import { FinancialState } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Brain, AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { getFinancialOverview } from '../services/geminiService';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { differenceInDays, parseISO } from 'date-fns';

interface ReportsProps {
  state: FinancialState;
}

export const Reports: React.FC<ReportsProps> = ({ state }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'weeks' | 'months' | 'year' | '5y' | '10y' | 'max'>('months');

  const totalDebt = state.debts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const totalInvestments = state.investments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalExpenses = state.expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalMonthlyIncome = state.incomeSources
    .filter(s => s.frequency === 'Monthly')
    .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const netWorth = totalInvestments - totalDebt;

  // Check data age and presence
  const allDates = [
    ...state.debts.map(d => d.dueDate),
    ...state.expenses.map(e => e.date)
  ].filter(Boolean).map(d => parseISO(d));

  const earliestDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : null;
  const dataAge = earliestDate ? differenceInDays(new Date(), earliestDate) : 0;
  const hasEnoughData = state.debts.length > 0 || state.investments.length > 0 || state.expenses.length > 0;
  const isOldEnough = dataAge >= 2;

  const handleGetAnalysis = async () => {
    setLoading(true);
    try {
      const result = await getFinancialOverview(state);
      setAnalysis(result || "No analysis available.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!hasEnoughData || !isOldEnough) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Info className="text-slate-400" size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">Not Enough Data for Reports</h3>
        <p className="text-slate-500 max-w-md">
          To generate detailed reports and AI insights, we need at least 2 days of financial history and some active entries in your debts, investments, or expenses.
        </p>
        <div className="mt-6 flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
            <span className={hasEnoughData ? "text-emerald-600" : "text-rose-500"}>
              {hasEnoughData ? "✓ Data Present" : "✗ No Data"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
            <span className={isOldEnough ? "text-emerald-600" : "text-rose-500"}>
              {isOldEnough ? "✓ 2+ Days Old" : `✗ ${dataAge} Days Old`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Expense by category data
  const expenseByCategory = state.expenses.reduce((acc: any, exp) => {
    const amount = Number(exp.amount) || 0;
    acc[exp.category] = (acc[exp.category] || 0) + amount;
    return acc;
  }, {});

  const totalExpenseValue = Object.values(expenseByCategory).reduce((a: any, b: any) => a + b, 0) as number;
  const pieData = totalExpenseValue > 0 
    ? Object.keys(expenseByCategory).map(cat => ({
        name: cat,
        value: expenseByCategory[cat]
      }))
    : [{ name: 'No Expenses', value: 1 }];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
            {(['weeks', 'months', 'year', '5y', '10y', 'max'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  timeRange === range ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={handleGetAnalysis}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 font-bold"
          >
            <Brain size={20} />
            {loading ? 'Analyzing...' : 'Generate AI Overview'}
          </button>
        </div>
      </div>

      {analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Brain className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-bold">AI Financial Analysis</h3>
          </div>
          <div className="prose prose-indigo max-w-none">
            <Markdown>{analysis}</Markdown>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h3 className="text-lg font-bold mb-6">Expense Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h3 className="text-lg font-bold mb-6">Balance Sheet Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Assets', value: Number(totalInvestments) || 0, fill: '#10b981' },
                  { name: 'Liabilities', value: Number(totalDebt) || 0, fill: '#ef4444' },
                  { name: 'Net Worth', value: Number(netWorth) || 0, fill: '#6366f1' }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
        <h3 className="text-lg font-bold mb-6">Detailed Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Debt Metrics</p>
            <div className="space-y-2">
              <MetricRow label="Debt-to-Income" value={`${((totalDebt / (Number(totalMonthlyIncome * 12) || 1)) * 100).toFixed(1)}%`} />
              <MetricRow label="Avg. Interest" value={`${((state.debts.reduce((a, b) => a + (Number(b.interestRate) || 0), 0) / (state.debts.length || 1))).toFixed(1)}%`} />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Investment Metrics</p>
            <div className="space-y-2">
              <MetricRow label="Portfolio Yield" value={`${((state.investments.reduce((a, b) => a + (Number(b.expectedReturn) || 0), 0) / (state.investments.length || 1))).toFixed(1)}%`} />
              <MetricRow label="Asset Count" value={state.investments.length.toString()} />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Expense Metrics</p>
            <div className="space-y-2">
              <MetricRow label="Savings Rate" value={`${((((Number(totalMonthlyIncome) || 0) - (Number(totalExpenses) || 0)) / (Number(totalMonthlyIncome) || 1)) * 100).toFixed(1)}%`} />
              <MetricRow label="Recurring %" value={`${((state.expenses.filter(e => e.isRecurring).length / (state.expenses.length || 1)) * 100).toFixed(1)}%`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
    <span className="text-slate-500 text-sm">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);
