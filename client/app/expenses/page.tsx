"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { expenseApi, type Expense } from "@/lib/api/expenses";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
import ExpenseFormModal from "../components/ExpenseFormModal";
import ExpenseSummaryChart from "../components/ExpenseSummaryChart";

const categories = {
  internal: {
    name: "Internal",
    color: "emerald",
    subcategories: ["meals", "maintenance", "supplies", "other"],
  },
  external: {
    name: "External",
    color: "orange",
    subcategories: ["utilities", "transport", "rent", "marketing", "other"],
  },
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState("today");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const { toast } = useToast();
  const router = useRouter();

  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const data = await expenseApi.getAll();
      setExpenses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive",
      });
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleExpenseSubmit = () => {
    fetchExpenses();
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || expense.category === filterCategory;
    // Add date filtering logic here
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );
  const internalExpenses = filteredExpenses
    .filter((e) => e.category === "internal")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const externalExpenses = filteredExpenses
    .filter((e) => e.category === "external")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const getCategoryIcon = (category: string) => {
    return category === "internal" ? "🏢" : "🌐";
  };

  const getCategoryColor = (category: string) => {
    return categories[category as keyof typeof categories]?.color || "slate";
  };

  if (loadingExpenses) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-b from-orange-50 to-slate-50">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-10 w-10 text-orange-500"
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
            <span className="text-orange-700 font-semibold text-lg">
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-orange-50 to-slate-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-sm xs-reduce-header-padding xs-reduce-padding">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">
              Expense Tracking
            </h1>
            <p className="text-sm text-slate-500">Monitor business spending</p>
          </div>
          <Button
            onClick={() => setShowExpenseModal(true)}
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 xs-reduce-padding">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">
                    Total Expenses Today
                  </p>
                  <p className="text-3xl font-bold">
                    ₦{totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-orange-100 text-xs">
                    {filteredExpenses.length} transactions
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-emerald-700 text-sm font-medium">
                    Internal
                  </p>
                  <p className="text-2xl font-bold text-emerald-800">
                    ₦{internalExpenses.toLocaleString()}
                  </p>
                  <p className="text-emerald-600 text-xs">
                    {Math.round((internalExpenses / totalExpenses) * 100) || 0}%
                    of total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-orange-700 text-sm font-medium">
                    External
                  </p>
                  <p className="text-2xl font-bold text-orange-800">
                    ₦{externalExpenses.toLocaleString()}
                  </p>
                  <p className="text-orange-600 text-xs">
                    {Math.round((externalExpenses / totalExpenses) * 100) || 0}%
                    of total
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expense Chart */}
        <ExpenseSummaryChart
          internalAmount={internalExpenses}
          externalAmount={externalExpenses}
        />

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl"
            />
          </div>

          <div className="flex gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="flex-1 h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="flex-1 h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Expenses
            </h2>
            <Badge variant="outline" className="text-xs">
              {filteredExpenses.length} expenses
            </Badge>
          </div>

          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <Card
                key={expense.id}
                className="hover:shadow-md transition-all duration-300 active:scale-95"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                          expense.category === "internal"
                            ? "bg-emerald-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">
                            {expense.description}
                          </h3>
                          {expense.recurring && (
                            <Badge variant="secondary" className="text-xs">
                              <Repeat className="w-3 h-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 capitalize">
                          {expense.subcategory}
                        </p>
                        <p className="text-xs text-slate-500">
                          {expense.date} • {expense.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-800">
                        ₦{expense.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs mt-1 ${
                          expense.category === "internal"
                            ? "border-emerald-200 text-emerald-700"
                            : "border-orange-200 text-orange-700"
                        }`}
                      >
                        {
                          categories[
                            expense.category as keyof typeof categories
                          ]?.name
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Add Buttons */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">
              Quick Add Common Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl">
                🍽️ Staff Meals
              </Button>
              <Button variant="outline" className="h-12 rounded-xl">
                🚗 Transport
              </Button>
              <Button variant="outline" className="h-12 rounded-xl">
                ⚡ Utilities
              </Button>
              <Button variant="outline" className="h-12 rounded-xl">
                🧹 Cleaning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Expense Form Modal */}
      {showExpenseModal && (
        <ExpenseFormModal 
        onClose={() => {
          setShowExpenseModal(false);
          setSelectedExpense(undefined);
        }} 
        onSuccess={handleExpenseSubmit}
        expense={selectedExpense}
      />
      )}
    </div>
  );
}
