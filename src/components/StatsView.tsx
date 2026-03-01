import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';

export const StatsView: React.FC = () => {
  const { transactions, stats } = useFinance();

  const categoryData = transactions.reduce((acc: any[], t) => {
    if (t.type === 'expense') {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
    }
    return acc;
  }, []);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-6 pb-32">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Relatórios</h2>

      <div className="bg-white p-6 rounded-[40px] shadow-sm border border-slate-100 mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Gastos por Categoria</h3>
        <div className="h-64 w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">
              Sem dados de gastos para exibir
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Média de Gastos</p>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(stats.monthlyExpenses / 30)} <span className="text-xs text-slate-400 font-bold">/ dia</span></p>
        </div>
      </div>
    </div>
  );
};
