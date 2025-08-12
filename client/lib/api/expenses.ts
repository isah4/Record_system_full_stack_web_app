import { api } from '@/config/api';

export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: 'internal' | 'external';
  subcategory: string;
  date: string;
  time?: string;
  recurring: boolean;
  created_by: number;
  created_by_user: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  amount: number;
  description: string;
  category: 'internal' | 'external';
  subcategory: string;
  date?: string;
  recurring?: boolean;
}

export const expenseApi = {
  getAll: async (): Promise<Expense[]> => {
    const response = await api.get('/expenses');
    return response.data;
  },

  getById: async (id: number): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  update: async (id: number, data: CreateExpenseData): Promise<Expense> => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  }
};
