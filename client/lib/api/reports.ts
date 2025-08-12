import { api } from '../../config/api';

export interface ReportData {
  period: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  profitMargin: number;
  transactions: number;
  salesGrowth: number;
  expenseGrowth: number;
  paidSales: number;
  partialSales: number;
  debtSales: number;
  internalExpenses: number;
  externalExpenses: number;
  totalOutstanding: number;
  activeDebtsCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface SalesBreakdown {
  date: string;
  transactions: number;
  daily_sales: number;
  paid_amount: number;
  partial_amount: number;
  debt_amount: number;
}

export interface ExpensesBreakdown {
  date: string;
  transactions: number;
  daily_expenses: number;
  internal_amount: number;
  external_amount: number;
}

class ReportsApi {
  async getReport(period: string): Promise<ReportData> {
    const response = await api.get(`/analytics/reports/${period}`);
    return response.data;
  }

  async getSalesBreakdown(period: string): Promise<SalesBreakdown[]> {
    const response = await api.get(`/analytics/reports/${period}/sales`);
    return response.data;
  }

  async getExpensesBreakdown(period: string): Promise<ExpensesBreakdown[]> {
    const response = await api.get(`/analytics/reports/${period}/expenses`);
    return response.data;
  }
}

export const reportsApi = new ReportsApi();
