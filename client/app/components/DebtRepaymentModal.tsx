"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface DebtRepaymentModalProps {
  debt: any;
  onClose: () => void;
}

export default function DebtRepaymentModal({
  debt,
  onClose,
}: DebtRepaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRepayment = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    onClose();
  };

  const remainingBalance = debt.balance - (parseFloat(amount) || 0);
  const isFullPayment = remainingBalance <= 0;

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white w-full h-full flex flex-col animate-in fade-in-0 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Record Payment
              </h2>
              <p className="text-sm text-slate-500">{debt.customer}</p>
            </div>
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
        <div className="flex-1 px-6 py-12 overflow-y-auto space-y-6">
          {/* Debt Summary */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Original Amount:</span>
                  <span className="font-semibold">
                    ₦{debt.originalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Already Paid:</span>
                  <span className="font-semibold text-emerald-600">
                    ₦{debt.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-slate-800 font-medium">
                    Outstanding Balance:
                  </span>
                  <span className="font-bold text-red-600 text-lg">
                    ₦{debt.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-base font-medium">
              Payment Amount
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                ₦
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-14 text-xl font-semibold rounded-xl"
                max={debt.balance}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount((debt.balance / 2).toString())}
                className="rounded-lg"
              >
                Half (₦{(debt.balance / 2).toLocaleString()})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(debt.balance.toString())}
                className="rounded-lg"
              >
                Full Payment
              </Button>
            </div>
          </div>

          {/* Payment Preview */}
          {amount && parseFloat(amount) > 0 && (
            <Card
              className={`${
                isFullPayment
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Amount:</span>
                    <span className="font-semibold">
                      ₦{parseFloat(amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Remaining Balance:</span>
                    <span
                      className={`font-semibold ${
                        remainingBalance <= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      ₦{Math.max(0, remainingBalance).toLocaleString()}
                    </span>
                  </div>
                  {isFullPayment && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">
                        Debt will be fully settled!
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] rounded-xl"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 mt-auto">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 rounded-xl text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRepayment}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > debt.balance ||
                isProcessing
              }
              className="flex-1 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-base font-semibold"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Record Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
