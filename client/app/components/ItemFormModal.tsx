"use client";

import { useState, useEffect } from "react";
import { X, Package, DollarSign, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/config/api";

interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  wholesale_price?: number;
}

interface ItemFormModalProps {
  item?: Item | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ItemFormModal({ item, onClose, onSuccess }: ItemFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    wholesale_price: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price.toString(),
        stock: item.stock.toString(),
        wholesale_price: (item.wholesale_price || 0).toString(),
      });
    } else {
      setFormData({
        name: "",
        price: "",
        stock: "",
        wholesale_price: "",
      });
    }
  }, [item]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock must be 0 or greater";
    }

    if (formData.wholesale_price && parseFloat(formData.wholesale_price) < 0) {
      newErrors.wholesale_price = "Wholesale price must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : 0,
      };

      if (item) {
        // Update existing item
        await api.put(`/items/${item.id}`, payload);
      } else {
        // Create new item
        await api.post("/items", payload);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving item:", error);
      
      // Handle specific validation errors from backend
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: "Failed to save item. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in fade-in-0 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {item ? "Edit Item" : "Add New Item"}
              </h2>
              <p className="text-sm text-slate-500">
                {item ? "Update item information" : "Add item to inventory"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                Item Name *
              </Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`pl-10 h-12 ${errors.name ? "border-red-300 focus:border-red-500" : ""}`}
                  disabled={loading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-slate-700">
                Price (₦) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className={`pl-10 h-12 ${errors.price ? "border-red-300 focus:border-red-500" : ""}`}
                  disabled={loading}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            {/* Wholesale Price */}
            <div className="space-y-2">
              <Label htmlFor="wholesale_price" className="text-sm font-medium text-slate-700">
                Wholesale/Cost Price (₦)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="wholesale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.wholesale_price}
                  onChange={(e) => handleInputChange("wholesale_price", e.target.value)}
                  className={`pl-10 h-12 ${errors.wholesale_price ? "border-red-300 focus:border-red-500" : ""}`}
                  disabled={loading}
                />
              </div>
              {errors.wholesale_price && (
                <p className="text-sm text-red-600">{errors.wholesale_price}</p>
              )}
              <p className="text-xs text-slate-500">
                Cost price for profit calculation (optional)
              </p>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-medium text-slate-700">
                Stock Quantity *
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  className={`pl-10 h-12 ${errors.stock ? "border-red-300 focus:border-red-500" : ""}`}
                  disabled={loading}
                />
              </div>
              {errors.stock && (
                <p className="text-sm text-red-600">{errors.stock}</p>
              )}
            </div>

            {/* Preview Card */}
            {formData.name && formData.price && formData.stock && (
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-600">Preview & Profit Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Name:</span>
                      <span className="text-sm font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Selling Price:</span>
                      <span className="text-sm font-medium">₦{parseFloat(formData.price || "0").toLocaleString()}</span>
                    </div>
                    {formData.wholesale_price && parseFloat(formData.wholesale_price) > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Cost Price:</span>
                          <span className="text-sm font-medium">₦{parseFloat(formData.wholesale_price || "0").toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Profit per Unit:</span>
                          <span className="text-sm font-medium text-green-600">
                            ₦{(parseFloat(formData.price || "0") - parseFloat(formData.wholesale_price || "0")).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Profit Margin:</span>
                          <span className="text-sm font-medium text-green-600">
                            {(((parseFloat(formData.price || "0") - parseFloat(formData.wholesale_price || "0")) / parseFloat(formData.price || "1")) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Stock:</span>
                      <span className="text-sm font-medium">{parseInt(formData.stock || "0")} units</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm text-slate-600">Total Inventory Value:</span>
                      <span className="text-sm font-bold text-purple-600">
                        ₦{(parseFloat(formData.price || "0") * parseInt(formData.stock || "0")).toLocaleString()}
                      </span>
                    </div>
                    {formData.wholesale_price && parseFloat(formData.wholesale_price) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Total Potential Profit:</span>
                        <span className="text-sm font-bold text-green-600">
                          ₦{((parseFloat(formData.price || "0") - parseFloat(formData.wholesale_price || "0")) * parseInt(formData.stock || "0")).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-purple-500 hover:bg-purple-600 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Saving...
                  </div>
                ) : (
                  item ? "Update Item" : "Add Item"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
