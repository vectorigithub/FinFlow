import React, { useState } from 'react';
import { Debt, FinancialState } from '../types';
import { Plus, Trash2, Brain, X, CreditCard } from 'lucide-react';
import { getDebtRearrangementAdvice } from '../services/geminiService';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface DebtManagerProps {
  state: FinancialState;
  onSave: (debt: Debt) => void;
  onDelete: (id: string) => void;
}

export const DebtManager: React.FC<DebtManagerProps> = ({ state, onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [newDebt, setNewDebt] = useState<Partial<Debt>>({
    name: '',
    amount: 0,
    interestRate: 0,
    dueDate: new Date().toISOString().split('T')[0],
    repaymentDayOfMonth: undefined,
    category: 'Credit Card',
    notes: ''
  });

  const handleAdd = () => {
    if (newDebt.name && newDebt.amount) {
      onSave({ ...newDebt, id: Math.random().toString(36).substr(2, 9) } as Debt);
      setIsAdding(false);
      setNewDebt({ name: '', amount: 0, interestRate: 0, dueDate: new Date().toISOString().split('T')[0], repaymentDayOfMonth: undefined, category: 'Credit Card', notes: '' });
    }
  };

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const result = await getDebtRearrangementAdvice(state);
      setAdvice(result || "No advice available.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Debts</h2>
        {state.debts.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={handleGetAdvice}
              disabled={loadingAdvice}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Brain size={18} />
              {loadingAdvice ? 'Analyzing...' : 'AI Rearrange'}
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <Plus size={18} />
              Add Debt
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {advice && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 relative"
          >
            <button onClick={() => setAdvice(null)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">
              <X size={20} />
            </button>
            <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
              <Brain size={20} /> AI Repayment Strategy
            </h3>
            <div className="prose prose-indigo max-w-none">
              <Markdown>{advice}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.debts.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="text-emerald-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No debts at the moment!</h3>
            <p className="text-slate-500 mb-8">You're doing great. Your financial slate is clean.</p>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add here</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
              >
                <Plus size={28} />
              </button>
            </div>
          </div>
        ) : (
          state.debts.map(debt => (
          <div key={debt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{debt.category}</span>
                <h4 className="text-lg font-bold">{debt.name}</h4>
              </div>
              <button onClick={() => onDelete(debt.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold">${debt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Interest Rate</span>
                <span className="font-bold">{debt.interestRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Due Date</span>
                <span className="font-bold">{debt.dueDate}</span>
              </div>
              {debt.notes && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-500 italic">{debt.notes}</p>
                </div>
              )}
            </div>
          </div>
        )))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-6">Add New Debt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  value={newDebt.name}
                  onChange={e => setNewDebt({...newDebt, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={newDebt.amount}
                    onChange={e => setNewDebt({...newDebt, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interest %</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={newDebt.interestRate}
                    onChange={e => setNewDebt({...newDebt, interestRate: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  value={newDebt.dueDate}
                  onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Repayment Day (Optional)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="31"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  value={newDebt.repaymentDayOfMonth || ''}
                  onChange={e => setNewDebt({...newDebt, repaymentDayOfMonth: e.target.value ? parseInt(e.target.value) : undefined})}
                  placeholder="e.g., 20 for 20th of month"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  value={newDebt.category}
                  onChange={e => setNewDebt({...newDebt, category: e.target.value as any})}
                >
                  <option>Credit Card</option>
                  <option>Loan</option>
                  <option>Mortgage</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none resize-none"
                  rows={3}
                  placeholder="Add details about this debt..."
                  value={newDebt.notes}
                  onChange={e => setNewDebt({...newDebt, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setIsAdding(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleAdd} className="flex-1 px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 transition-colors">Save</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
