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
import { api } from "@/config/api";
import { useErrorHandler } from "@/hooks/use-error-handler";
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
  const [amountPaid, setAmountPaid] = useState("");
  const [items, setItems] = useState<
    Array<{ id: number; name: string; price: number; stock: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler();

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
      try {
        const response = await api.get("/api/items");
        setItems(response.data);
      } catch (err: any) {
        handleError(err, {
          title: "Failed to load items",
          description: "Could not fetch inventory items. Please try again."
        });
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [handleError]);

  const handleSubmit = async () => {
    if (!customerName || selectedItems.length === 0 || !paymentStatus) {
      handleError("Please fill in all required fields", {
        title: "Validation Error",
        description: "Customer name, items, and payment status are required."
      });
      return;
    }
    
    // Validate amount paid for partial payments
    if (paymentStatus === "partial" && (!amountPaid || parseFloat(amountPaid) <= 0)) {
      handleError("Invalid payment amount", {
        title: "Validation Error",
        description: "Please enter a valid amount paid for partial payment."
      });
      return;
    }
    
    if (paymentStatus === "partial" && parseFloat(amountPaid) >= calculateTotal()) {
      handleError("Invalid payment amount", {
        title: "Validation Error", 
        description: "Amount paid cannot be greater than or equal to total amount."
      });
      return;
    }
    
    setSubmitting(true);
    try {
      // Send all items in a single request
      const total = calculateTotal();
      const balance = paymentStatus === "partial" ? (total - parseFloat(amountPaid)) : 0;
      
      const saleData = {
        buyer_name: customerName,
        items: selectedItems.map((item) => ({
          item_id: item.id,
          quantity: item.quantity,
        })),
        payment_status: paymentStatus,
        total: total,
        balance: balance,
      };
      
      console.log('Sending sale data:', saleData);
      
      await api.post("/api/sales", saleData);
      
      handleSuccess("Sale recorded successfully!");
      onClose();
    } catch (err: any) {
      handleError(err, {
        title: "Failed to record sale",
        description: "Could not save the sale. Please try again."
      });
    } finally {
      setSubmitting(false);
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
              {items.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-2 border-slate-300">
                  <div className="space-y-4">
                    <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">
                        No Items Available
                      </h3>
                      <p className="text-slate-500 mb-4 text-sm">
                        You need to add items to your inventory before creating sales
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        window.location.href = '/inventory';
                      }}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Go to Inventory
                    </Button>
                  </div>
                </Card>
              ) : (
                items.map((item) => (
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
                ))
              )}
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
                          <Input
                            type="number"
                            min={1}
                            max={item.stock}
                            value={selectedItem.quantity}
                            onChange={e => {
                              const val = Math.max(1, Math.min(item.stock, Number(e.target.value)));
                              updateQuantity(selectedItem.id, val);
                            }}
                            className="w-20 text-2xl font-bold text-slate-800 text-center h-12"
                          />
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
            <Select value={paymentStatus} onValueChange={(value) => {
              setPaymentStatus(value);
              if (value !== "partial") {
                setAmountPaid("");
              }
            }}>
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

          {/* Amount Paid (for partial payments) */}
          {paymentStatus === "partial" && (
            <div className="space-y-2">
              <Label htmlFor="amountPaid" className="text-base font-medium">
                Amount Paid
              </Label>
              <Input
                id="amountPaid"
                type="number"
                placeholder="Enter amount paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="h-12 text-base rounded-xl"
                min="0"
                max={calculateTotal()}
                step="0.01"
              />
              <p className="text-sm text-slate-500">
                Remaining: ₦{Math.max(0, calculateTotal() - (parseFloat(amountPaid) || 0)).toLocaleString()}
              </p>
            </div>
          )}
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
                  submitting ||
                  !customerName || 
                  selectedItems.length === 0 || 
                  !paymentStatus ||
                  (paymentStatus === "partial" && (!amountPaid || parseFloat(amountPaid) <= 0))
                }
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Record Sale
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
