import { api } from '../../config/api';

export interface Debt {
  id: string;
  customer: string;
  customer_id?: number | null;
  originalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: 'overdue' | 'current' | 'paid';
  lastPayment: string | null;
  saleDate: string;
  items: string;
  phone: string;
  debtId: string;
}

export interface RepaymentRequest {
  amount: number;
  description?: string;
}

export interface RepaymentResponse {
  message: string;
  newBalance: number;
  totalRepaid: number;
  isFullyPaid: boolean;
}

class DebtApi {
  async getAll(): Promise<Debt[]> {
    const response = await api.get('/debts');
    return response.data;
  }

  async getById(id: string): Promise<Debt> {
    const response = await api.get(`/debts/${id}`);
    return response.data;
  }

  async recordRepayment(id: string, data: RepaymentRequest): Promise<RepaymentResponse> {
    const response = await api.post(`/debts/${id}/repayment`, data);
    return response.data;
  }
}

export const debtApi = new DebtApi();
