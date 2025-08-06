import React, { useState } from 'react';
import { Package, AlertCircle } from 'lucide-react';

interface InventoryFormProps {
  onSubmit: (itemData: any) => void;
  isLoading?: boolean;
  initialData?: {
    id?: number;
    name: string;
    price: number;
    stock: number;
  };
  isEditing?: boolean;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({ 
  onSubmit, 
  isLoading = false, 
  initialData,
  isEditing = false 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [stock, setStock] = useState(initialData?.stock || 0);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || price <= 0 || stock < 0) {
      setError('Please fill in all fields correctly. Price must be positive and stock must be non-negative.');
      return;
    }

    const itemData = {
      name: name.trim(),
      price: parseFloat(price.toString()),
      stock: parseInt(stock.toString())
    };

    onSubmit(itemData);
  };

  const resetForm = () => {
    setName('');
    setPrice(0);
    setStock(0);
    setError('');
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </h2>
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-white" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name */}
        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-neutral-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            id="itemName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter item name"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-2">
            Price *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
            <input
              type="number"
              id="price"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full pl-8 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-neutral-700 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            id="stock"
            min="0"
            value={stock}
            onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0"
            required
          />
          {stock < 5 && stock > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ Low stock alert: Consider restocking soon
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !name.trim() || price <= 0}
            className="flex-1 gradient-primary text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (isEditing ? 'Update Item' : 'Add Item')
            }
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}; 