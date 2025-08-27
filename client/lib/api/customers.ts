import { api } from '../../config/api';

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerSummary {
  customer_id: number | null;
  customer_name: string | null;
  total_debt: string;
  total_repaid: string;
  outstanding: string;
  last_activity: string;
}

class CustomersApi {
  async list(q?: string): Promise<Customer[]> {
    const response = await api.get('/customers', { params: { q } });
    return response.data;
  }

  async get(id: number): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const response = await api.post('/customers', data);
    return response.data;
  }

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  }

  async remove(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }

  async debtsSummary(): Promise<CustomerSummary[]> {
    const response = await api.get('/debts/customers/summary');
    return response.data;
  }
}

export const customersApi = new CustomersApi();
