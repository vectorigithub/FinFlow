import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Debt, Investment, Expense, IncomeSource } from '../types';
import { TrendingUp, TrendingDown, Wallet, PieChart, Calendar } from 'lucide-react';

interface DashboardProps {
  debts: Debt[];
  investments: Investment[];
  expenses: Expense[];
  incomeSources: IncomeSource[];
}

export const Dashboard: React.FC<DashboardProps> = ({ debts, investments, expenses, incomeSources }) => {
  const [timeRange, setTimeRange] = useState<'weeks' | 'months' | 'year' | '5y' | 'max'>('months');
  
  const totalDebt = debts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const totalInvestments = investments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalMonthlyExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalMonthlyIncome = incomeSources
    .filter(s => s.frequency === 'Monthly')
    .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const netWorth = totalInvestments - totalDebt;

  // Mock historical data based on time range
  const getMockData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    let labels: { date: string; fullDate: string }[] = [];
    
    if (timeRange === 'weeks') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push({ 
          date: days[d.getDay()], 
          fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
        });
      }
    } else if (timeRange === 'months') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push({ 
          date: months[d.getMonth()], 
          fullDate: `${months[d.getMonth()]} ${d.getFullYear()}` 
        });
      }
    } else if (timeRange === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push({ 
          date: months[d.getMonth()].charAt(0), 
          fullDate: `${months[d.getMonth()]} ${d.getFullYear()}` 
        });
      }
    } else if (timeRange === '5y') {
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        labels.push({ date: year.toString(), fullDate: `Year ${year}` });
      }
    } else if (timeRange === 'max') {
      const startYear = 2023;
      for (let year = startYear; year <= currentYear; year++) {
        labels.push({ date: year.toString(), fullDate: `Year ${year}` });
      }
    }

    return labels.map((label, i) => {
      const factor = labels.length > 0 ? (0.5 + (i / labels.length) * 0.5) : 0.5;
      const safeNetWorth = Number(netWorth) || 0;
      const safeTotalDebt = Number(totalDebt) || 0;
      const safeTotalInvestments = Number(totalInvestments) || 0;
      const safeTotalExpenses = Number(totalMonthlyExpenses) || 0;

      return {
        ...label,
        value: safeNetWorth * factor,
        debts: safeTotalDebt * factor,
        investments: safeTotalInvestments * factor,
        expenses: safeTotalExpenses * (0.8 + Math.random() * 0.4)
      };
    });
  };

  const data = getMockData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const hasData = d.debts > 0 || d.investments > 0 || d.expenses > 0;

      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[200px]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{d.fullDate || label}</p>
          {!hasData ? (
            <p className="text-sm text-slate-500 italic">No available data</p>
          ) : (
            <div className="space-y-1">
              {d.investments > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Investments</span>
                  <span className="font-bold text-blue-600">${Math.round(d.investments).toLocaleString()}</span>
                </div>
              )}
              {d.debts > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Debts</span>
                  <span className="font-bold text-rose-600">${Math.round(d.debts).toLocaleString()}</span>
                </div>
              )}
              {d.expenses > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Expenses</span>
                  <span className="font-bold text-amber-600">${Math.round(d.expenses).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-slate-50 flex justify-between text-sm">
                <span className="font-bold text-slate-900">Net Worth</span>
                <span className="font-bold text-emerald-600">${Math.round(d.value).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Debt" value={totalDebt} icon={<TrendingDown className="text-rose-500" />} />
        <StatCard title="Investments" value={totalInvestments} icon={<TrendingUp className="text-blue-500" />} />
        <StatCard title="Monthly Profit" value={Number(totalMonthlyIncome - totalMonthlyExpenses) || 0} icon={<PieChart className="text-amber-500" />} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold">Net Worth Accumulation</h3>
          <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
            {(['weeks', 'months', 'year', '5y', 'max'] as const).map((range) => (
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
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 flex items-center justify-between">
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">${value.toLocaleString()}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-xl">
      {icon}
    </div>
  </div>
);
