import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/utils';
import { CreditCard as CardIcon, Plus, Calendar, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const CardsView: React.FC = () => {
  const { cards } = useFinance();

  return (
    <div className="p-6 pb-32">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Meus Cartões</h2>
        <button className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
          <Plus className="w-5 h-5 text-indigo-600" />
        </button>
      </div>

      <div className="space-y-6">
        {cards.map(card => (
          <motion.div 
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-40" />
            
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{card.brand}</p>
                <p className="text-xl font-bold text-slate-700 tracking-[0.2em]">•••• •••• •••• {card.lastFour}</p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <CardIcon className="w-6 h-6 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Fatura Atual</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(card.currentInvoice)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Disponível</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(card.limit - card.usedLimit)}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vence em {new Date(card.closingDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Ativo</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
