import { Debt, Investment, Expense, FinancialState } from "./types";

export const fetchFinancialData = async (): Promise<FinancialState> => {
  const res = await fetch("/api/data");
  const data = await res.json();
  return {
    debts: data.debts.map((d: any) => ({ ...d, amount: Number(d.amount) || 0, interestRate: Number(d.interestRate) || 0, repaymentDayOfMonth: Number(d.repaymentDayOfMonth) || undefined })),
    investments: data.investments.map((i: any) => ({ ...i, amount: Number(i.amount) || 0, expectedReturn: Number(i.expectedReturn) || 0 })),
    expenses: data.expenses.map((e: any) => ({ ...e, amount: Number(e.amount) || 0 })),
    incomeSources: data.incomeSources.map((s: any) => ({ ...s, amount: Number(s.amount) || 0, receivedDayOfMonth: Number(s.receivedDayOfMonth) || undefined })),
  };
};

export const saveDebt = async (debt: Debt) => {
  await fetch("/api/debts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...debt, amount: Number(debt.amount) || 0 }),
  });
};

export const deleteDebt = async (id: string) => {
  await fetch(`/api/debts/${id}`, { method: "DELETE" });
};

export const saveInvestment = async (investment: Investment) => {
  await fetch("/api/investments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...investment, amount: Number(investment.amount) || 0 }),
  });
};

export const deleteInvestment = async (id: string) => {
  await fetch(`/api/investments/${id}`, { method: "DELETE" });
};

export const saveExpense = async (expense: Expense) => {
  await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...expense, amount: Number(expense.amount) || 0 }),
  });
};

export const deleteExpense = async (id: string) => {
  await fetch(`/api/expenses/${id}`, { method: "DELETE" });
};

export const saveIncomeSource = async (source: any) => {
  await fetch("/api/income", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...source, amount: Number(source.amount) || 0 }),
  });
};

export const deleteIncomeSource = async (id: string) => {
  await fetch(`/api/income/${id}`, { method: "DELETE" });
};

export const saveIncome = async (income: number) => {
  await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "monthlyIncome", value: income }),
  });
};
