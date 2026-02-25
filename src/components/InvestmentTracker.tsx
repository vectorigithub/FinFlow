import React, { useState } from 'react';
import { Investment, FinancialState } from '../types';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface InvestmentTrackerProps {
  state: FinancialState;
  onSave: (investment: Investment) => void;
  onDelete: (id: string) => void;
}

export const InvestmentTracker: React.FC<InvestmentTrackerProps> = ({ state, onSave, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newInv, setNewInv] = useState<Partial<Investment>>({
    name: '',
    amount: 0,
    expectedReturn: 0,
    type: 'Stock',
    notes: ''
  });

  const handleAdd = () => {
    if (newInv.name && newInv.amount) {
      onSave({ ...newInv, id: Math.random().toString(36).substr(2, 9) } as Investment);
      setIsAdding(false);
      setNewInv({ name: '', amount: 0, expectedReturn: 0, type: 'Stock', notes: '' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Investments</h2>
        {state.investments.length > 0 && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <Plus size={18} />
            Add Investment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.investments.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="text-blue-500" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No investments yet</h3>
            <p className="text-slate-500 mb-8">Start growing your wealth by adding your first investment.</p>
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
          state.investments.map(inv => (
          <div key={inv.id} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{inv.type}</span>
                <h4 className="text-lg font-bold">{inv.name}</h4>
              </div>
              <button onClick={() => onDelete(inv.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Value</span>
                <span className="font-bold text-emerald-600">${inv.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Expected Return</span>
                <span className="font-bold flex items-center gap-1 text-emerald-600">
                  <TrendingUp size={14} /> {inv.expectedReturn}%
                </span>
              </div>
              {inv.notes && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-500 italic">{inv.notes}</p>
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
            <h3 className="text-xl font-bold mb-6">Add New Investment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  value={newInv.name}
                  onChange={e => setNewInv({...newInv, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={Number.isNaN(newInv.amount) ? '' : newInv.amount}
                    onChange={e => setNewInv({...newInv, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Exp. Return %</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                    value={Number.isNaN(newInv.expectedReturn) ? '' : newInv.expectedReturn}
                    onChange={e => setNewInv({...newInv, expectedReturn: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none"
                  value={newInv.type}
                  onChange={e => setNewInv({...newInv, type: e.target.value as any})}
                >
                  <option>Stock</option>
                  <option>Crypto</option>
                  <option>Real Estate</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea 
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-black outline-none resize-none"
                  rows={3}
                  placeholder="Add details about this investment..."
                  value={newInv.notes}
                  onChange={e => setNewInv({...newInv, notes: e.target.value})}
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
