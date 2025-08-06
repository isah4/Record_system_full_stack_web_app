import React, { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, Edit, Trash2, Plus } from 'lucide-react';
import { getApiUrl, getAuthHeaders, API_CONFIG } from '../../config/api';

interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface InventoryListProps {
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: number) => void;
  onRefresh: () => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ 
  onEditItem, 
  onDeleteItem, 
  onRefresh 
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Debug - Token:', token ? 'Present' : 'Missing');
      console.log('Debug - API URL:', getApiUrl(API_CONFIG.ENDPOINTS.ITEMS.LIST));
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ITEMS.LIST), {
        headers: getAuthHeaders()
      });
      
      console.log('Debug - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Debug - Items data:', data);
        setItems(data);
        setError(''); // Clear any previous errors
      } else {
        const errorText = await response.text();
        console.log('Debug - Error response:', errorText);
        setError(`Failed to load items: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Debug - Fetch error:', error);
      setError(`Failed to load items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ITEMS.DELETE(id)), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        onDeleteItem(id);
        fetchItems();
      } else {
        setError('Failed to delete item');
      }
    } catch (error) {
      setError('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(item => Number(item.stock) < 5);
  const totalItems = items.length;
  const totalValue = Number(items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.stock) || 0)), 0));

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
        <h2 className="text-xl font-semibold text-neutral-800">Inventory</h2>
        <button
          onClick={() => { fetchItems(); onRefresh(); }}
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
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-800">{totalItems}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Value</p>
              <p className="text-2xl font-bold text-green-800">${Number(totalValue || 0).toFixed(2)}</p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-orange-800">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span className="text-orange-800 font-medium">
              Low Stock Alert: {lowStockItems.length} item(s) need restocking
            </span>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
            <p>No items found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-neutral-800">{item.name}</h3>
                    {Number(item.stock || 0) < 5 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Low Stock
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    <span>Price: ${Number(item.price || 0).toFixed(2)}</span>
                    <span>Stock: {Number(item.stock || 0)} units</span>
                    <span>Value: ${(Number(item.price || 0) * Number(item.stock || 0)).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit item"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 