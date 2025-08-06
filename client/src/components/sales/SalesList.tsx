import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, DollarSign, User, Package } from 'lucide-react';
import { getApiUrl, getAuthHeaders, API_CONFIG } from '../../config/api';

interface Sale {
  id: number;
  buyer_name: string;
  item_name: string;
  item_price: number;
  quantity: number;
  total: number;
  payment_status: 'paid' | 'partial' | 'debt';
  balance: number;
  created_at: string;
}

interface SalesListProps {
  onRefresh: () => void;
}

export const SalesList: React.FC<SalesListProps> = ({ onRefresh }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'debt'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Debug - Token:', token ? 'Present' : 'Missing');
      console.log('Debug - API URL:', getApiUrl(API_CONFIG.ENDPOINTS.SALES.LIST));
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SALES.LIST), {
        headers: getAuthHeaders()
      });
      
      console.log('Debug - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Debug - Sales data:', data);
        setSales(data);
        setError(''); // Clear any previous errors
      } else {
        const errorText = await response.text();
        console.log('Debug - Error response:', errorText);
        setError(`Failed to load sales: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Debug - Fetch error:', error);
      setError(`Failed to load sales: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      partial: { color: 'bg-yellow-100 text-yellow-800', text: 'Partial' },
      debt: { color: 'bg-red-100 text-red-800', text: 'Debt' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalSales = Number(filteredSales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0));
  const totalPaid = Number(filteredSales.reduce((sum, sale) => sum + ((Number(sale.total) || 0) - (Number(sale.balance) || 0)), 0));
  const totalOutstanding = Number(filteredSales.reduce((sum, sale) => sum + (Number(sale.balance) || 0), 0));

  // Debug logging
  console.log('Debug - filteredSales:', filteredSales);
  console.log('Debug - totalSales:', totalSales, 'type:', typeof totalSales);
  console.log('Debug - totalPaid:', totalPaid, 'type:', typeof totalPaid);
  console.log('Debug - totalOutstanding:', totalOutstanding, 'type:', typeof totalOutstanding);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">Sales History</h2>
        <button
          onClick={() => { fetchSales(); onRefresh(); }}
          className="px-4 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Sales</p>
              <p className="text-2xl font-bold text-green-800">${Number(totalSales || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-blue-800">${Number(totalPaid || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Outstanding</p>
              <p className="text-2xl font-bold text-red-800">${Number(totalOutstanding || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by buyer or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="pl-10 pr-8 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="debt">Debt</option>
          </select>
        </div>
      </div>

      {/* Sales List */}
      <div className="space-y-3">
        {filteredSales.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
            <p>No sales found</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium text-neutral-800">{sale.buyer_name}</span>
                    {getStatusBadge(sale.payment_status)}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-600">{sale.item_name}</span>
                    <span className="text-sm text-neutral-500">× {sale.quantity}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-neutral-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(sale.created_at)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-neutral-800">
                    ${Number(sale.total || 0).toFixed(2)}
                  </div>
                  {Number(sale.balance || 0) > 0 && (
                    <div className="text-sm text-red-600">
                      Balance: ${Number(sale.balance || 0).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 