"use client";

import { useState, useEffect } from "react";
import { X, FileText, Check, Calendar, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

interface ExpenseFormModalProps {
  onClose: () => void;
}

const categories = {
  internal: {
    name: "Internal",
    subcategories: [
      { value: "meals", label: "Staff Meals", icon: "🍽️" },
      { value: "maintenance", label: "Maintenance", icon: "🔧" },
      { value: "supplies", label: "Office Supplies", icon: "📝" },
      { value: "other", label: "Other Internal", icon: "🏢" },
    ],
  },
  external: {
    name: "External",
    subcategories: [
      { value: "utilities", label: "Utilities", icon: "⚡" },
      { value: "transport", label: "Transport", icon: "🚗" },
      { value: "rent", label: "Rent", icon: "🏠" },
      { value: "marketing", label: "Marketing", icon: "📢" },
      { value: "other", label: "Other External", icon: "🌐" },
    ],
  },
};

export default function ExpenseFormModal({ onClose }: ExpenseFormModalProps) {
  useEffect(() => {
    // Disable scrolling on mount
    document.body.style.overflow = "hidden";

    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    onClose();
  };

  const selectedCategory = categories[category as keyof typeof categories];
  const isFormValid = amount && description && category && subcategory;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[9999]">
      <div className="bg-white rounded-t-[2rem] w-full h-[calc(100vh-16px)] mt-4 flex flex-col animate-in fade-in-0 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-[2rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Add Expense</h2>
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
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)] space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">
              Amount *
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium text-lg">
                ₦
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-14 text-xl font-semibold rounded-xl"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Description *
            </Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 text-base rounded-xl"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Category *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  category === "internal"
                    ? "border-emerald-500 bg-emerald-50"
                    : "hover:border-emerald-200"
                }`}
                onClick={() => {
                  setCategory("internal");
                  setSubcategory("");
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🏢</div>
                  <h3 className="font-semibold text-slate-800">Internal</h3>
                  <p className="text-sm text-slate-500">
                    Staff, maintenance, supplies
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  category === "external"
                    ? "border-orange-500 bg-orange-50"
                    : "hover:border-orange-200"
                }`}
                onClick={() => {
                  setCategory("external");
                  setSubcategory("");
                }}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">🌐</div>
                  <h3 className="font-semibold text-slate-800">External</h3>
                  <p className="text-sm text-slate-500">
                    Utilities, transport, rent
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Subcategory */}
          {category && selectedCategory && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Subcategory *</Label>
              <div className="grid grid-cols-2 gap-2">
                {selectedCategory.subcategories.map((sub) => (
                  <Button
                    key={sub.value}
                    variant={subcategory === sub.value ? "default" : "outline"}
                    className="h-12 rounded-xl justify-start"
                    onClick={() => setSubcategory(sub.value)}
                  >
                    <span className="mr-2">{sub.icon}</span>
                    {sub.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-base font-medium">
              Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl"
              />
            </div>
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-slate-600" />
              <div>
                <Label className="text-base font-medium">
                  Recurring Expense
                </Label>
                <p className="text-sm text-slate-500">
                  This expense repeats regularly
                </p>
              </div>
            </div>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this expense..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] rounded-xl"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 rounded-xl text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isProcessing}
              className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-base font-semibold"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Add Expense
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
