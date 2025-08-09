"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileNavigation from "../components/MobileNavigation";
import DebtRepaymentModal from "../components/DebtRepaymentModal";

const debtsData = [
  {
    id: "D001",
    customer: "John Doe",
    phone: "+234 801 234 5678",
    originalAmount: 125000,
    paidAmount: 50000,
    balance: 75000,
    dueDate: "2024-01-20",
    status: "overdue",
    lastPayment: "2024-01-10",
    saleDate: "2024-01-05",
    items: "Rice (2), Beans (1)",
  },
  {
    id: "D002",
    customer: "Mary Johnson",
    phone: "+234 802 345 6789",
    originalAmount: 67500,
    paidAmount: 20000,
    balance: 47500,
    dueDate: "2024-01-25",
    status: "current",
    lastPayment: "2024-01-15",
    saleDate: "2024-01-08",
    items: "Cooking Oil (3), Sugar (1)",
  },
  {
    id: "D003",
    customer: "Peter Smith",
    phone: "+234 803 456 7890",
    originalAmount: 52000,
    paidAmount: 0,
    balance: 52000,
    dueDate: "2024-01-18",
    status: "overdue",
    lastPayment: null,
    saleDate: "2024-01-12",
    items: "Salt (2), Rice (1)",
  },
];

export default function DebtsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  // Set loadingDebts to false until real data connection is implemented
  const [loadingDebts, setLoadingDebts] = useState(false);

  const filteredDebts = debtsData.filter((debt) => {
    const matchesSearch =
      debt.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debt.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || debt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalOutstanding = debtsData.reduce(
    (sum, debt) => sum + debt.balance,
    0
  );
  const overdueCount = debtsData.filter(
    (debt) => debt.status === "overdue"
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "destructive";
      case "current":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loadingDebts) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-slate-50">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-10 w-10 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-red-700 font-semibold text-lg">
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-slate-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">
              Debt Management
            </h1>
            <p className="text-sm text-slate-500">Track outstanding payments</p>
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </Button>
            {overdueCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {overdueCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-red-100 text-sm">Total Outstanding</p>
                <p className="text-2xl font-bold">
                  ₦{totalOutstanding.toLocaleString()}
                </p>
                <p className="text-red-100 text-xs">
                  {debtsData.length} customers
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-orange-100 text-sm">Overdue Debts</p>
                <p className="text-2xl font-bold">{overdueCount}</p>
                <p className="text-orange-100 text-xs">Need attention</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by customer name or debt ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl"
            />
          </div>

          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="flex-1 h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Debts</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="current">Current</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-xl"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Debts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Outstanding Debts
            </h2>
            <Badge variant="outline" className="text-xs">
              {filteredDebts.length} debts
            </Badge>
          </div>

          <div className="space-y-3">
            {filteredDebts.map((debt) => (
              <Card
                key={debt.id}
                className="hover:shadow-md transition-all duration-300 active:scale-95"
              >
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">
                            {debt.customer}
                          </h3>
                          <Badge
                            variant={getStatusColor(debt.status)}
                            className="text-xs"
                          >
                            {debt.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {debt.items}
                        </p>
                        <p className="text-xs text-slate-500">
                          Sale: {debt.saleDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">
                          ₦{debt.balance.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          of ₦{debt.originalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Paid: ₦{debt.paidAmount.toLocaleString()}</span>
                        <span>
                          {Math.round(
                            (debt.paidAmount / debt.originalAmount) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (debt.paidAmount / debt.originalAmount) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Due Date and Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          Due: {debt.dueDate}
                        </span>
                        {debt.status === "overdue" && (
                          <Badge variant="destructive" className="text-xs">
                            {getDaysOverdue(debt.dueDate)} days overdue
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedDebt(debt);
                          setShowRepaymentModal(true);
                        }}
                        className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Record Payment
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-xl"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-xl"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  ₦
                  {debtsData
                    .reduce((sum, debt) => sum + debt.paidAmount, 0)
                    .toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Total Collected</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {debtsData.filter((debt) => debt.paidAmount > 0).length}
                </p>
                <p className="text-xs text-slate-500">Paying Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round(
                    (debtsData.reduce((sum, debt) => sum + debt.paidAmount, 0) /
                      debtsData.reduce(
                        (sum, debt) => sum + debt.originalAmount,
                        0
                      )) *
                      100
                  )}
                  %
                </p>
                <p className="text-xs text-slate-500">Collection Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Repayment Modal */}
      {showRepaymentModal && selectedDebt && (
        <DebtRepaymentModal
          debt={selectedDebt}
          onClose={() => {
            setShowRepaymentModal(false);
            setSelectedDebt(null);
          }}
        />
      )}
    </div>
  );
}
