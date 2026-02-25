import React, { useState } from 'react';
import { Expense, FinancialState, IncomeSource } from '../types';
import { Plus, Trash2, Brain, X, AlertTriangle, Wallet, Building2, Briefcase, Landmark, Receipt } from 'lucide-react';
import { getExpenseRiskAnalysis } from '../services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface ExpenseTrackerProps {
  state: FinancialState;
  onSave: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onSaveIncomeSource: (source: IncomeSource) => void;
  onDeleteIncomeSource: (id: string) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ state, onSave, onDelete, onSaveIncomeSource, onDeleteIncomeSource }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<string | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  
  const [newExp, setNewExp] = useState<Partial<Expense>>({
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    isRecurring: false,
    notes: ''
  });

  const [newIncome, setNewIncome] = useState<Partial<IncomeSource>>({
    source: 'Salary',
    amount: 0,
    frequency: 'Monthly',
    receivedDayOfMonth: undefined,
    purpose: ''
  });

  const handleAdd = () => {
    if (newExp.name && newExp.amount) {
      onSave({ ...newExp, id: Math.random().toString(36).substr(2, 9) } as Expense);
      setIsAdding(false);
      setNewExp({ name: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Food', isRecurring: false, notes: '' });
    }
  };

  const handleAddIncome = () => {
    if (newIncome.source && newIncome.amount) {
      onSaveIncomeSource({ ...newIncome, id: Math.random().toString(36).substr(2, 9) } as IncomeSource);
      setIsAddingIncome(false);
      setNewIncome({ source: 'Salary', amount: 0, frequency: 'Monthly', receivedDayOfMonth: undefined, purpose: '' });
    }
  };

  const handleAnalyzeRisk = async () => {
    if (!newExp.name || !newExp.amount) return;
    setLoadingRisk(true);
    try {
      const result = await getExpenseRiskAnalysis(state, { name: newExp.name, amount: newExp.amount });
      setRiskAnalysis(result || "No analysis available.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRisk(false);
    }
  };

  const totalMonthlyIncome = state.incomeSources
    .filter(s => s.frequency === 'Monthly')
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-8">
      {/* Income Sources Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Income Sources</h2>
            <p className="text-sm text-slate-500">Manage where your money comes from</p>
          </div>
          <button 
            onClick={() => setIsAddingIncome(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold"
          >
            <Plus size={18} />
            Add Source
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.incomeSources.length === 0 ? (
            <div className="col-span-full py-10 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <Wallet className="text-emerald-500" size={24} />
              </div>
              <p className="text-slate-500 font-medium">No income sources added yet.</p>
            </div>
          ) : (
            state.incomeSources.map(source => (
              <div key={source.id} className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    {(source.source?.toLowerCase().includes('salary')) ? <Building2 size={20} className="text-indigo-500" /> : 
                     (source.source?.toLowerCase().includes('freelance')) ? <Briefcase size={20} className="text-blue-500" /> : 
                     (source.source?.toLowerCase().includes('allowance')) ? <Wallet size={20} className="text-emerald-500" /> : 
                     <Landmark size={20} className="text-slate-500" />}
                  </div>
                  <div>
                    <h4 className="font-bold">{source.source}</h4>
                    <p className="text-xs text-slate-500">{source.frequency} • {source.purpose || 'General'}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold text-emerald-600">${source.amount.toLocaleString()}</p>
                    {source.receivedDayOfMonth && <p className="text-[10px] text-slate-400 uppercase font-bold">Day {source.receivedDayOfMonth}</p>}
                  </div>
                  <button onClick={() => onDeleteIncomeSource(source.id)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Expenses</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors font-bold"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.expenses.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <Receipt size={32} className="text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No expenses recorded</h3>
              <p className="text-slate-500">Track your spending to see where your money goes.</p>
            </div>
          ) : (
            state.expenses.map(exp => (
              <div key={exp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{exp.category}</span>
                    <h4 className="text-lg font-bold">{exp.name}</h4>
                  </div>
                  <button onClick={() => onDelete(exp.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-bold text-rose-600">${exp.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold">{exp.date}</span>
                  </div>
                  {exp.isRecurring && (
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">Recurring</span>
                  )}
                  {exp.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      <p className="text-xs text-slate-500 italic">{exp.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Income Source Modal */}
      <AnimatePresence>
        {isAddingIncome && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6">Add Income Source</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source of Funds</label>
                  <select
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={newIncome.source}
                    onChange={e => setNewIncome({...newIncome, source: e.target.value as any})}
                  >
                    <option>Salary</option>
                    <option>Allowance</option>
                    <option>Freelance</option>
                    <option>Dividends</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                      value={newIncome.amount}
                      onChange={e => setNewIncome({...newIncome, amount: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                      value={newIncome.frequency}
                      onChange={e => setNewIncome({...newIncome, frequency: e.target.value as any})}
                    >
                      <option>Monthly</option>
                      <option>One-time</option>
                      <option>Quarterly</option>
                      <option>Yearly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Received Day of Month (Optional)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="31"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={newIncome.receivedDayOfMonth || ''}
                    onChange={e => setNewIncome({...newIncome, receivedDayOfMonth: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="e.g., 15 for 15th of month"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purpose / Label</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rent budget, Savings, Fun money"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={newIncome.purpose}
                    onChange={e => setNewIncome({...newIncome, purpose: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setIsAddingIncome(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-bold">Cancel</button>
                  <button onClick={handleAddIncome} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-bold">Save Source</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h3 className="text-xl font-bold mb-6">Add New Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  value={newExp.name}
                  onChange={e => setNewExp({...newExp, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  value={newExp.amount}
                  onChange={e => setNewExp({...newExp, amount: parseFloat(e.target.value)})}
                />
              </div>
              
              <button 
                onClick={handleAnalyzeRisk}
                disabled={loadingRisk || !newExp.amount}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50 font-bold"
              >
                <Brain size={18} />
                {loadingRisk ? 'Analyzing Risk...' : 'Analyze Expense Risk'}
              </button>

              <AnimatePresence>
                {riskAnalysis && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm relative"
                  >
                    <button onClick={() => setRiskAnalysis(null)} className="absolute top-2 right-2 text-amber-400">
                      <X size={16} />
                    </button>
                    <div className="flex items-center gap-2 text-amber-700 font-bold mb-2">
                      <AlertTriangle size={16} /> Risk Assessment
                    </div>
                    <div className="prose prose-sm prose-amber max-w-none">
                      <Markdown>{riskAnalysis}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={newExp.date}
                    onChange={e => setNewExp({...newExp, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={newExp.category}
                    onChange={e => setNewExp({...newExp, category: e.target.value as any})}
                  >
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Rent</option>
                    <option>Utilities</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="recurring"
                  checked={newExp.isRecurring}
                  onChange={e => setNewExp({...newExp, isRecurring: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-slate-700">Recurring Monthly</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none resize-none"
                  rows={3}
                  placeholder="Add details about this expense..."
                  value={newExp.notes}
                  onChange={e => setNewExp({...newExp, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsAdding(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-bold">Cancel</button>
                <button onClick={handleAdd} className="flex-1 px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 transition-colors font-bold">Save Expense</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
