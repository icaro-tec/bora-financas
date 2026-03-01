export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  cardId?: string;
}

export interface CreditCard {
  id: string;
  brand: string;
  lastFour: string;
  limit: number;
  usedLimit: number;
  closingDate: string;
  currentInvoice: number;
}

export interface UserStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}
