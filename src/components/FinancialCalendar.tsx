import React, { useState, useEffect } from 'react';
import { FinancialState } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle, Brain } from 'lucide-react';
import { getCalendarRiskAnalysis } from '../services/geminiService';
import { motion } from 'motion/react';

interface FinancialCalendarProps {
  state: FinancialState;
}

export const FinancialCalendar: React.FC<FinancialCalendarProps> = ({ state }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [risks, setRisks] = useState<Record<string, { level: string; reason: string }>>({});
  const [loadingRisks, setLoadingRisks] = useState(false);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const analyzeMonth = async () => {
    if (!hasData) return;
    setLoadingRisks(true);
    try {
      const result = await getCalendarRiskAnalysis(state);
      setRisks(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRisks(false);
    }
  };

  const hasData = state.debts.length > 0 || state.expenses.length > 0;

  useEffect(() => {
    if (hasData) {
      analyzeMonth();
    }
  }, [state.debts, state.expenses]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <p className="text-sm text-slate-500">Financial Calendar & Risk Outlook</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={analyzeMonth}
            disabled={loadingRisks || !hasData}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
              !hasData ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            <Brain size={16} />
            {!hasData ? 'Input data for analysis' : loadingRisks ? 'Analyzing...' : 'Refresh AI Analysis'}
          </button>
          <div className="flex gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-50 p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white p-4 h-32" />
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const risk = risks[dateStr];
          const dayDebts = state.debts.filter(d => d.dueDate === dateStr);
          const dayExpenses = state.expenses.filter(e => e.date === dateStr);
          
          // Show profit/income and investment summary on the 1st of each month
          const isFirstDay = format(day, 'd') === '1';
          const totalInvestments = state.investments.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
          const totalMonthlyIncome = state.incomeSources
            .filter(s => s.frequency === 'Monthly')
            .reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
          
          return (
            <div key={dateStr} className="bg-white p-4 h-32 border-t border-slate-50 relative group hover:bg-slate-50 transition-colors">
              <span className="text-sm font-medium text-slate-400">{format(day, 'd')}</span>
              
              <div className="mt-2 space-y-1 overflow-y-auto max-h-20 scrollbar-hide">
                {isFirstDay && (
                  <>
                    {totalMonthlyIncome > 0 && (
                      <div className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold truncate">
                        Income: ${totalMonthlyIncome.toLocaleString()}
                      </div>
                    )}
                    {totalInvestments > 0 && (
                      <div className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold truncate">
                        Assets: ${totalInvestments.toLocaleString()}
                      </div>
                    )}
                  </>
                )}
                {dayDebts.map(d => (
                  <div key={d.id} className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold truncate">
                    Debt: {d.name}
                  </div>
                ))}
                {dayExpenses.map(e => (
                  <div key={e.id} className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold truncate">
                    Exp: {e.name}
                  </div>
                ))}
              </div>

              {risk && (
                <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ${
                  risk.level === 'High' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 
                  risk.level === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              )}

              {risk && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/80 text-white p-3 text-[10px] z-10 transition-opacity flex flex-col justify-center pointer-events-none">
                  <p className="font-bold mb-1 uppercase tracking-wider text-indigo-400">Risk: {risk.level}</p>
                  <p>{risk.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
