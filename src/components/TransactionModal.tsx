import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TransactionModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { addTransaction, cards } = useFinance();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Lazer');
  const [cardId, setCardId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addTransaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
      cardId: type === 'expense' ? cardId : undefined
    });
    
    setDescription('');
    setAmount('');
    setCardId('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-8 z-50 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nova Transação</h2>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Entrada
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Valor</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">R$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-3xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">O que foi?</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Almoço, Salário..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                />
              </div>

              {type === 'expense' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pagar com</label>
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="">Saldo da Conta</option>
                    {cards.map(card => (
                      <option key={card.id} value={card.id}>{card.brand} (**** {card.lastFour})</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
              >
                <Check className="w-5 h-5" />
                Confirmar
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
