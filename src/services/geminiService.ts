import { GoogleGenAI } from "@google/genai";
import { FinancialState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getDebtRearrangementAdvice(state: FinancialState) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    As a financial advisor, analyze the following debts and suggest a rearrangement or repayment plan (e.g., Snowball or Avalanche method).
    
    Debts: ${JSON.stringify(state.debts)}
    Income Sources: ${JSON.stringify(state.incomeSources)}
    Monthly Expenses: ${JSON.stringify(state.expenses)}
    
    Provide a clear, actionable plan in Markdown format. Consider the timing of income sources for repayment prioritization.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

export async function getExpenseRiskAnalysis(state: FinancialState, targetExpense: { name: string, amount: number }) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the risk of making this expense given the current financial state.
    
    Target Expense: ${targetExpense.name} ($${targetExpense.amount})
    Current Debts: ${JSON.stringify(state.debts)}
    Current Investments: ${JSON.stringify(state.investments)}
    Income Sources: ${JSON.stringify(state.incomeSources)}
    
    Should they make this expense? What are the risks? Provide a concise analysis in Markdown.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}

export async function getCalendarRiskAnalysis(state: FinancialState) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the upcoming month based on these debts and recurring expenses.
    Identify high-risk days (e.g., multiple due dates, low cash flow periods).
    
    Debts: ${JSON.stringify(state.debts)}
    Expenses: ${JSON.stringify(state.expenses)}
    
    Return a JSON object where keys are ISO dates (YYYY-MM-DD) and values are risk levels (Low, Medium, High) and a short reason.
    Format: { "2024-03-15": { "level": "High", "reason": "Rent and Credit Card due" } }
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });

  return JSON.parse(response.text || "{}");
}

export async function getFinancialOverview(state: FinancialState) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Provide a comprehensive financial overview and performance analysis based on the following data:
    
    Income Sources: ${JSON.stringify(state.incomeSources)}
    Debts: ${JSON.stringify(state.debts)}
    Investments: ${JSON.stringify(state.investments)}
    Expenses: ${JSON.stringify(state.expenses)}
    
    Analyze:
    1. Overall performance (Net worth growth potential, savings rate).
    2. Debt-to-income ratio and management advice, considering income timing.
    3. Investment performance and diversification.
    4. Expense patterns and optimization opportunities.
    
    Provide actionable advice and a summary of the current financial health in Markdown format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}
