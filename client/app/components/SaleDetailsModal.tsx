"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, DollarSign, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/config/api";

interface SaleItem {
  item_id: number;
  quantity: number;
  price_at_sale: number;
  subtotal: number;
  item_name: string;
}

interface PaymentRecord {
  id: number;
  payment_type: 'initial' | 'partial' | 'debt_repayment' | 'full_settlement';
  amount: number;
  description: string;
  payment_date: string;
}

interface SaleDetails {
  id: number;
  buyer_name: string;
  total: number;
  payment_status: 'paid' | 'partial' | 'debt';
  balance: number;
  created_at: string;
  items: SaleItem[];
  payment_history?: PaymentRecord[];
}

interface SaleDetailsModalProps {
  sale: SaleDetails;
  onClose: () => void;
}

export default function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, [sale.id]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sales/${sale.id}/payment-history`);
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'initial': return 'Initial Payment';
      case 'partial': return 'Partial Payment';
      case 'debt_repayment': return 'Debt Repayment';
      case 'full_settlement': return 'Full Settlement';
      default: return type;
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'initial': return <DollarSign className="w-4 h-4" />;
      case 'partial': return <CreditCard className="w-4 h-4" />;
      case 'debt_repayment': return <AlertCircle className="w-4 h-4" />;
      case 'full_settlement': return <CheckCircle className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'initial': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'debt_repayment': return 'bg-orange-100 text-orange-800';
      case 'full_settlement': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'debt': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = sale.total - totalPaid;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in-0 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Sale Details</h2>
              <p className="text-sm text-slate-500">Complete transaction information</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Sale Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Sale Summary</span>
                <Badge className={getStatusColor(sale.payment_status)}>
                  {sale.payment_status.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="font-semibold text-slate-800">{sale.buyer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Sale Date</p>
                  <p className="font-semibold text-slate-800">{formatDate(sale.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="font-bold text-2xl text-emerald-600">₦{sale.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Remaining Balance</p>
                  <p className={`font-bold text-xl ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₦{remainingBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Purchased */}
          <Card>
            <CardHeader>
              <CardTitle>Items Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sale.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{item.item_name}</p>
                      <p className="text-sm text-slate-600">
                        ₦{item.price_at_sale.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">₦{item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="text-slate-500 mt-2">Loading payment history...</p>
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No payment records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment, index) => (
                    <div key={payment.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${getPaymentTypeColor(payment.payment_type)}`}>
                        {getPaymentTypeIcon(payment.payment_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {getPaymentTypeLabel(payment.payment_type)}
                            </p>
                            <p className="text-sm text-slate-600">{payment.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">₦{payment.amount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{formatDate(payment.payment_date)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Payment Summary */}
                  <Separator />
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-800">Payment Summary</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-emerald-600">Total Paid</p>
                      <p className="font-bold text-xl text-emerald-800">₦{totalPaid.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 flex justify-end">
          <Button onClick={onClose} variant="outline" className="rounded-xl">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
