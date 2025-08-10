"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Share,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MobileNavigation from "../components/MobileNavigation";
import ReportChart from "../components/ReportChart";
import ActivityLog from "../components/ActivityLog";

export default function ReportsPage() {
  const [period, setPeriod] = useState("today");
  const [reportType, setReportType] = useState("summary");
  // Set loadingReports to false until real data connection is implemented
  const [loadingReports, setLoadingReports] = useState(false);

  const reportData = {
    today: {
      totalSales: 245000,
      totalExpenses: 85000,
      profit: 160000,
      transactions: 15,
      salesGrowth: 12.5,
      expenseGrowth: -8.2,
      profitMargin: 65.3,
    },
    week: {
      totalSales: 1250000,
      totalExpenses: 450000,
      profit: 800000,
      transactions: 78,
      salesGrowth: 18.3,
      expenseGrowth: -5.1,
      profitMargin: 64.0,
    },
    month: {
      totalSales: 5200000,
      totalExpenses: 1800000,
      profit: 3400000,
      transactions: 324,
      salesGrowth: 22.1,
      expenseGrowth: -12.3,
      profitMargin: 65.4,
    },
  };

  const currentData = reportData[period as keyof typeof reportData];

  const getPeriodLabel = () => {
    switch (period) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      default:
        return "Today";
    }
  };

  if (loadingReports) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-slate-50">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-10 w-10 text-purple-500"
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
            <span className="text-purple-700 font-semibold text-lg">
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-50 to-slate-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">
              Business Reports
            </h1>
            <p className="text-sm text-slate-500">Analyze performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl">
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Period and Report Type Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">📅 Today</SelectItem>
              <SelectItem value="week">📊 This Week</SelectItem>
              <SelectItem value="month">📈 This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">📋 Summary</SelectItem>
              <SelectItem value="detailed">📊 Detailed</SelectItem>
              <SelectItem value="trends">📈 Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">
            {getPeriodLabel()} Overview
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {/* Profit Card - Most Important */}
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Net Profit</p>
                    <p className="text-4xl font-bold">
                      ₦{currentData.profit.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-emerald-100 text-sm">
                        {currentData.profitMargin.toFixed(1)}% margin
                      </span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sales and Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-slate-600 text-sm font-medium">
                        Sales
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      ₦{currentData.totalSales.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 text-xs font-medium">
                        +{currentData.salesGrowth}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      </div>
                      <p className="text-slate-600 text-sm font-medium">
                        Expenses
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      ₦{currentData.totalExpenses.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 text-xs font-medium">
                        {currentData.expenseGrowth}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Visual Chart */}
        <ReportChart
          sales={currentData.totalSales}
          expenses={currentData.totalExpenses}
          period={period}
        />

        {/* Profit & Loss Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Profit & Loss Statement
            </CardTitle>
            <CardDescription>
              Detailed breakdown for {getPeriodLabel().toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Revenue Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                  Revenue
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-slate-700">Sales Revenue</span>
                    <span className="font-semibold text-emerald-700">
                      ₦{currentData.totalSales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Other Income</span>
                    <span className="font-semibold">₦0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-100 rounded-lg border-2 border-emerald-200">
                    <span className="font-semibold text-emerald-800">
                      Total Revenue
                    </span>
                    <span className="font-bold text-emerald-800">
                      ₦{currentData.totalSales.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">
                  Expenses
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-slate-700">Internal Expenses</span>
                    <span className="font-semibold text-orange-700">
                      ₦
                      {Math.round(
                        currentData.totalExpenses * 0.4
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-slate-700">External Expenses</span>
                    <span className="font-semibold text-orange-700">
                      ₦
                      {Math.round(
                        currentData.totalExpenses * 0.6
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border-2 border-red-200">
                    <span className="font-semibold text-red-800">
                      Total Expenses
                    </span>
                    <span className="font-bold text-red-800">
                      ₦{currentData.totalExpenses.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold text-slate-800">
                      Net Profit
                    </span>
                    <p className="text-sm text-slate-600 mt-1">
                      Profit margin: {currentData.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-emerald-600">
                    ₦{currentData.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Summary</CardTitle>
            <CardDescription>
              Key metrics for {getPeriodLabel().toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {currentData.transactions}
                </div>
                <div className="text-sm text-slate-600">Transactions</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {currentData.salesGrowth}%
                </div>
                <div className="text-sm text-slate-600">Sales Growth</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {currentData.profitMargin.toFixed(0)}%
                </div>
                <div className="text-sm text-slate-600">Profit Margin</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <ActivityLog period={period} />

        {/* Export Options */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base">Export & Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl">
                📄 Export PDF
              </Button>
              <Button variant="outline" className="h-12 rounded-xl">
                📊 Export CSV
              </Button>
              <Button variant="outline" className="h-12 rounded-xl">
                📧 Email Report
              </Button>
              <Button variant="outline" className="h-12 rounded-xl">
                💾 Save Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
