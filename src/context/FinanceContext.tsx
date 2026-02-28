import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, CreditCard, UserStats } from '../types';

interface FinanceContextType {
  transactions: Transaction[];
  cards: CreditCard[];
  stats: UserStats;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bora_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [cards, setCards] = useState<CreditCard[]>([
    {
      id: '1',
      brand: 'Visa Platinum',
      lastFour: '4582',
      limit: 15000,
      usedLimit: 3450.20,
      closingDate: '2026-03-10',
      currentInvoice: 1250.50,
    }
  ]);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('bora_auth') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('bora_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const stats: UserStats = {
    totalBalance: transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 5000),
    monthlyIncome: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    monthlyExpenses: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const login = (pin: string) => {
    if (pin === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('bora_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bora_auth');
  };

  return (
    <FinanceContext.Provider value={{ transactions, cards, stats, addTransaction, isAuthenticated, login, logout }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
