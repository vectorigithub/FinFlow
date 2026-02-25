export interface Debt {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  dueDate: string;
  repaymentDayOfMonth?: number; // Day of the month for recurring repayments (e.g., 20 for 20th)
  category: 'Credit Card' | 'Loan' | 'Mortgage' | 'Other';
  notes?: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  expectedReturn: number;
  type: 'Stock' | 'Crypto' | 'Real Estate' | 'Other';
  notes?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  isRecurring: boolean;
  notes?: string;
}

export interface NetWorthPoint {
  date: string;
  value: number;
}

export interface IncomeSource {
  id: string;
  source: 'Allowance' | 'Salary' | 'Freelance' | 'Dividends' | 'Other'; // Changed from name to source with dropdown options
  amount: number;
  frequency: 'Monthly' | 'One-time' | 'Quarterly' | 'Yearly';
  receivedDayOfMonth?: number; // Day of the month income is typically received
  purpose?: string;
}

export interface FinancialState {
  debts: Debt[];
  investments: Investment[];
  expenses: Expense[];
  incomeSources: IncomeSource[];
}
