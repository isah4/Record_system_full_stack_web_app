"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/api";
import * as React from "react";

interface QuickSaleFormProps {
  onClose: () => void;
}

export default function QuickSaleForm({ onClose }: QuickSaleFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState<
    Array<{ id: number; quantity: number }>
  >([]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [items, setItems] = useState<
    Array<{ id: number; name: string; price: number; stock: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const addItem = (itemId: number) => {
    const existing = selectedItems.find((item) => item.id === itemId);
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { id: itemId, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
    } else {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, selectedItem) => {
      const item = items.find((i) => i.id === selectedItem.id);
      return total + (item ? item.price * selectedItem.quantity : 0);
    }, 0);
  };

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.authenticatedRequest<any[]>("/api/items");
        setItems(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const handleSubmit = async () => {
    if (!customerName || selectedItems.length === 0 || !paymentStatus) return;
    setError(null);
    try {
      for (const selectedItem of selectedItems) {
        await apiService.authenticatedRequest("/api/sales", {
          method: "POST",
          body: JSON.stringify({
            buyer_name: customerName,
            item_id: selectedItem.id,
            quantity: selectedItem.quantity,
            payment_status: paymentStatus,
          }),
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record sale");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
      <div className="bg-white rounded-t-[2rem] w-full h-[calc(100vh-16px)] mt-4 flex flex-col animate-in fade-in-0 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">New Sale</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customer" className="text-base font-medium">
              Customer Name
            </Label>
            <Input
              id="customer"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-12 text-base rounded-xl"
            />
          </div>

          {/* Item Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Items</Label>
            <div className="space-y-3">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border-2 hover:border-emerald-200 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 text-base">
                          {item.name}
                        </h4>
                        <p className="text-emerald-600 font-bold text-lg">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={item.stock <= 2 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {item.stock} left
                      </Badge>
                    </div>
                    <Button
                      onClick={() => addItem(item.id)}
                      className="w-full h-12 rounded-xl"
                      disabled={item.stock === 0}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add to Sale
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Selected Items ({selectedItems.length})
              </Label>
              <div className="space-y-3">
                {selectedItems.map((selectedItem) => {
                  const item = items.find((i) => i.id === selectedItem.id);
                  if (!item) return null;

                  return (
                    <Card
                      key={selectedItem.id}
                      className="bg-emerald-50 border-emerald-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {item.name}
                            </h4>
                            <p className="text-sm text-slate-600">
                              ₦{item.price.toLocaleString()} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600 text-lg">
                              ₦
                              {(
                                item.price * selectedItem.quantity
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-12 h-12 rounded-xl"
                            onClick={() =>
                              updateQuantity(
                                selectedItem.id,
                                selectedItem.quantity - 1
                              )
                            }
                          >
                            <Minus className="w-5 h-5" />
                          </Button>
                          <span className="text-2xl font-bold text-slate-800 min-w-[3rem] text-center">
                            {selectedItem.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-12 h-12 rounded-xl"
                            onClick={() =>
                              updateQuantity(
                                selectedItem.id,
                                selectedItem.quantity + 1
                              )
                            }
                            disabled={selectedItem.quantity >= item.stock}
                          >
                            <Plus className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="payment" className="text-base font-medium">
              Payment Status
            </Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger className="h-12 text-base rounded-xl">
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">✅ Fully Paid</SelectItem>
                <SelectItem value="partial">⚠️ Partially Paid</SelectItem>
                <SelectItem value="debt">❌ Full Debt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer with Total and Actions */}
        {selectedItems.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 space-y-3">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-slate-800">
                  Total Amount:
                </span>
                <span className="text-3xl font-bold text-emerald-600">
                  ₦{calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-14 rounded-xl text-base"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-base font-semibold"
                disabled={
                  !customerName || selectedItems.length === 0 || !paymentStatus
                }
                onClick={handleSubmit}
              >
                <Check className="w-5 h-5 mr-2" />
                Record Sale
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
