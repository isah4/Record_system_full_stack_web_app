import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { getApiUrl, getAuthHeaders, API_CONFIG } from '../../config/api';

interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface SalesFormProps {
  onSubmit: (saleData: any) => void;
  isLoading?: boolean;
}

export const SalesForm: React.FC<SalesFormProps> = ({ onSubmit, isLoading = false }) => {
  const [buyerName, setBuyerName] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'debt'>('paid');
  const [paidAmount, setPaidAmount] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      const total = selectedItem.price * quantity;
      if (paymentStatus === 'paid') {
        setPaidAmount(total);
      } else if (paymentStatus === 'partial') {
        setPaidAmount(Math.min(paidAmount, total));
      } else {
        setPaidAmount(0);
      }
    }
  }, [selectedItem, quantity, paymentStatus]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ITEMS.LIST), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setError('Failed to load items');
      }
    } catch (error) {
      setError('Failed to load items');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!buyerName.trim() || !selectedItem) {
      setError('Please fill in all required fields');
      return;
    }

    const total = selectedItem.price * quantity;
    const balance = total - paidAmount;

    const saleData = {
      buyer_name: buyerName.trim(),
      item_id: selectedItem.id,
      quantity,
      payment_status: paymentStatus,
      balance: balance > 0 ? balance : 0
    };

    onSubmit(saleData);
  };

  const resetForm = () => {
    setBuyerName('');
    setSelectedItem(null);
    setQuantity(1);
    setPaymentStatus('paid');
    setPaidAmount(0);
    setError('');
  };

  const total = selectedItem ? selectedItem.price * quantity : 0;
  const balance = total - paidAmount;

  return (
    <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">Record New Sale</h2>
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
          <Plus className="w-4 h-4 text-white" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Buyer Name */}
        <div>
          <label htmlFor="buyerName" className="block text-sm font-medium text-neutral-700 mb-2">
            Buyer Name *
          </label>
          <input
            type="text"
            id="buyerName"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter buyer name"
            required
          />
        </div>

        {/* Item Selection */}
        <div>
          <label htmlFor="item" className="block text-sm font-medium text-neutral-700 mb-2">
            Item *
          </label>
          {loadingItems ? (
            <div className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-neutral-50">
              Loading items...
            </div>
          ) : (
            <select
              id="item"
              value={selectedItem?.id || ''}
              onChange={(e) => {
                const item = items.find(i => i.id === parseInt(e.target.value));
                setSelectedItem(item || null);
              }}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - ${item.price} (Stock: {item.stock})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-neutral-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            max={selectedItem?.stock || 1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
          {selectedItem && (
            <p className="text-xs text-neutral-500 mt-1">
              Available stock: {selectedItem.stock}
            </p>
          )}
        </div>

        {/* Payment Status */}
        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-neutral-700 mb-2">
            Payment Status *
          </label>
          <select
            id="paymentStatus"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'partial' | 'debt')}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="paid">Fully Paid</option>
            <option value="partial">Partially Paid</option>
            <option value="debt">Full Debt</option>
          </select>
        </div>

        {/* Paid Amount (for partial payments) */}
        {paymentStatus === 'partial' && (
          <div>
            <label htmlFor="paidAmount" className="block text-sm font-medium text-neutral-700 mb-2">
              Amount Paid
            </label>
            <input
              type="number"
              id="paidAmount"
              min="0"
              max={total}
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Math.min(total, Math.max(0, parseFloat(e.target.value) || 0)))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Summary */}
        {selectedItem && (
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">Item Price:</span>
              <span className="font-medium">${selectedItem.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Quantity:</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Total:</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            {paymentStatus === 'partial' && (
              <>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Paid:</span>
                  <span className="font-medium text-green-600">${paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Balance:</span>
                  <span className="font-medium text-red-600">${balance.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !buyerName.trim() || !selectedItem}
            className="flex-1 gradient-primary text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Recording Sale...' : 'Record Sale'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}; 