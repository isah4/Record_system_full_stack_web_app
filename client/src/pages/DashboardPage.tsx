import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, BarChart3, TrendingUp, DollarSign, Users, Menu, Package, ShoppingCart } from 'lucide-react';
import { SalesForm } from '../components/sales/SalesForm';
import { SalesList } from '../components/sales/SalesList';
import { InventoryForm } from '../components/inventory/InventoryForm';
import { InventoryList } from '../components/inventory/InventoryList';
import { getApiUrl, getAuthHeaders, API_CONFIG } from '../config/api';

interface DashboardStats {
  totalSales: number;
  totalItems: number;
  totalExpenses: number;
  activeDebts: number;
  salesChange: string;
  itemsChange: string;
  expensesChange: string;
  debtsChange: string;
}

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<DashboardStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError('');
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        setAnalyticsError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setAnalyticsError('Failed to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = [
    {
      icon: TrendingUp,
      title: 'Total Sales',
      value: analyticsData ? `$${analyticsData.totalSales.toLocaleString()}` : 'Loading...',
      change: analyticsData?.salesChange || '0%',
      changeType: analyticsData?.salesChange?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      icon: BarChart3,
      title: 'Inventory Items',
      value: analyticsData?.totalItems?.toString() || 'Loading...',
      change: analyticsData?.itemsChange || '0',
      changeType: analyticsData?.itemsChange?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      icon: DollarSign,
      title: 'Total Expenses',
      value: analyticsData ? `$${analyticsData.totalExpenses.toLocaleString()}` : 'Loading...',
      change: analyticsData?.expensesChange || '0%',
      changeType: analyticsData?.expensesChange?.startsWith('+') ? 'positive' : 'negative'
    },
    {
      icon: Users,
      title: 'Active Debts',
      value: analyticsData?.activeDebts?.toString() || 'Loading...',
      change: analyticsData?.debtsChange || '0',
      changeType: analyticsData?.debtsChange?.startsWith('+') ? 'positive' : 'negative'
    }
  ];

  const handleSalesSubmit = async (saleData: any) => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SALES.CREATE), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(saleData)
      });

      if (response.ok) {
        setShowSalesForm(false);
        // Refresh sales list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record sale');
      }
    } catch (error) {
      alert('Failed to record sale');
    }
  };

  const handleInventorySubmit = async (itemData: any) => {
    try {
      const url = editingItem 
        ? getApiUrl(API_CONFIG.ENDPOINTS.ITEMS.UPDATE(editingItem.id))
        : getApiUrl(API_CONFIG.ENDPOINTS.ITEMS.CREATE);
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        setShowInventoryForm(false);
        setEditingItem(null);
        // Refresh inventory list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save item');
      }
    } catch (error) {
      alert('Failed to save item');
    }
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setShowInventoryForm(true);
  };

  const handleDeleteItem = (id: number) => {
    // Item deletion is handled in the InventoryList component
  };

  const handleRefresh = () => {
    // Refresh analytics data
    fetchAnalytics();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-neutral-200">
        <div className="max-w-full w-full px-4 py-4 sm:container sm:mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-800">Dashboard</h1>
                <p className="text-xs text-neutral-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Menu Button */}
              <button className="sm:hidden p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              {/* Desktop Buttons */}
              <button className="hidden sm:block p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="hidden sm:block p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors">
                <User className="w-5 h-5" />
              </button>
              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-full px-2 py-4 sm:container sm:mx-auto sm:px-4 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {analyticsError && (
            <div className="col-span-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {analyticsError}
            </div>
          )}
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-soft p-4 border border-neutral-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium ${stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'}`}>
                  {analyticsLoading ? '...' : stat.change}
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-1">
                {analyticsLoading ? (
                  <div className="h-6 bg-neutral-200 rounded animate-pulse"></div>
                ) : (
                  stat.value
                )}
              </h3>
              <p className="text-xs text-neutral-600 leading-tight">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-soft border border-neutral-200 mb-6">
          <div className="flex flex-col sm:flex-row border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('sales')}
              className={`w-full sm:w-auto flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'sales' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'}`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Sales</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full sm:w-auto flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50' : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'}`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Inventory</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-2 sm:p-6">
            {activeTab === 'sales' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h2 className="text-lg font-semibold text-neutral-800">Sales Management</h2>
                  <button
                    onClick={() => setShowSalesForm(!showSalesForm)}
                    className="w-full sm:w-auto px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    {showSalesForm ? 'Cancel' : 'New Sale'}
                  </button>
                </div>
                {showSalesForm && (
                  <SalesForm onSubmit={handleSalesSubmit} />
                )}
                <SalesList onRefresh={handleRefresh} />
              </div>
            )}
            {activeTab === 'inventory' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h2 className="text-lg font-semibold text-neutral-800">Inventory Management</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowInventoryForm(!showInventoryForm);
                    }}
                    className="w-full sm:w-auto px-4 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    {showInventoryForm ? 'Cancel' : 'Add Item'}
                  </button>
                </div>
                {showInventoryForm && (
                  <InventoryForm 
                    onSubmit={handleInventorySubmit}
                    initialData={editingItem}
                    isEditing={!!editingItem}
                  />
                )}
                <InventoryList 
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onRefresh={handleRefresh}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}; 