import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/utils';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard as CardIcon, 
  Plus,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { stats, cards, transactions } = useFinance();

  // Generate dynamic chart data from last 7 days
  const chartData = React.useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        dateStr: d.toISOString().split('T')[0],
        gastos: 0
      };
    });

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const tDate = t.date.split('T')[0];
        const day = last7Days.find(d => d.dateStr === tDate);
        if (day) {
          day.gastos += t.amount;
        }
      }
    });

    return last7Days;
  }, [transactions]);

  return (
    <div className="pb-40 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="p-8 bg-white border-b border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Saldo Disponível</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.totalBalance)}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Entradas</span>
            </div>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.monthlyIncome)}</p>
          </div>
          <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="w-3 h-3 text-rose-600" />
              <span className="text-[10px] text-rose-700 uppercase font-bold tracking-wider">Saídas</span>
            </div>
            <p className="text-lg font-bold text-rose-600">{formatCurrency(stats.monthlyExpenses)}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Atividade</h3>
          <button className="text-xs text-indigo-600 font-bold">Últimos 7 dias</button>
        </div>
        <div className="h-56 w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                formatter={(value: number) => [formatCurrency(value), 'Gastos']}
              />
              <Area 
                type="monotone" 
                dataKey="gastos" 
                stroke="#4f46e5" 
                fillOpacity={1} 
                fill="url(#colorGastos)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Credit Cards */}
      <div className="p-6 pt-0">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Cartões</h3>
          <Plus className="w-5 h-5 text-slate-400" />
        </div>
        {cards.map(card => (
          <motion.div 
            key={card.id}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden mb-4"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{card.brand}</p>
                <p className="text-lg font-bold text-slate-700 tracking-[0.2em]">•••• {card.lastFour}</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                <CardIcon className="w-5 h-5 text-slate-400" />
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Fatura Atual</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(card.currentInvoice)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Disponível</p>
                <p className="text-sm font-bold text-emerald-600">{formatCurrency(card.limit - card.usedLimit)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="p-6 pt-0">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Histórico</h3>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-[32px] border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">Sem movimentações</p>
            </div>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {t.type === 'income' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.description}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.category}</p>
                  </div>
                </div>
                <p className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
