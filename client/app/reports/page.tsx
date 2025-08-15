"use client";

import { useState, useEffect } from "react";
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
  Activity,
  DollarSign,
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
import RecentActivityList from "../components/RecentActivityList";
import { api } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ActivityItem {
  activity_type: string;
  reference_id: number;
  description: string;
  amount: number;
  status: string;
  activity_date: string;
  details: any;
}

interface ReportData {
  summary: Array<{
    activity_type: string;
    total_amount: number;
    count: number;
  }>;
  total_sales: number;
  total_expenses: number;
  profit: number;
  outstanding_debts: number;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("today");
  const [reportType, setReportType] = useState("summary");
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const fetchReport = async (selectedPeriod: string) => {
    try {
      setLoadingReports(true);
      // Calculate date range based on period
      const today = new Date();
      let startDate = today.toISOString().split('T')[0];
      let endDate = today.toISOString().split('T')[0];
      if (selectedPeriod === "week") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      } else if (selectedPeriod === "month") {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      }
      // Fetch summary and activities
      const [summaryResponse, activitiesResponse] = await Promise.all([
        api.get(`/activity/summary?${selectedPeriod === "today" ? `date=${endDate}` : `start=${startDate}&end=${endDate}`}`),
        api.get(`/activity?${selectedPeriod === "today" ? `date=${endDate}` : ""}&limit=50`)
      ]);
      setReportData(summaryResponse.data);
      setActivities(activitiesResponse.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  const getPeriodLabel = () => {
    switch (period) {
      case "today": return "Today's Report";
      case "week": return "This Week's Report";
      case "month": return "This Month's Report";
      default: return "Business Report";
    }
  };

  const getPeriodDescription = () => {
    switch (period) {
      case "today": return "Daily performance overview";
      case "week": return "Weekly performance analysis";
      case "month": return "Monthly business summary";
      default: return "Business performance analysis";
    }
  };

  if (loadingReports) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-10 w-10 text-emerald-500"
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
            <span className="text-emerald-700 font-semibold text-lg">
              Loading Reports...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
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
              Business Reports
            </h1>
            <p className="text-sm text-slate-500">{getPeriodDescription()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 xs-reduce-padding">
        {/* Period and Report Type Selectors */}
        <div className="grid grid-cols-2 gap-3 xs-single-col">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Today
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  This Week
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  This Month
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Summary
                </div>
              </SelectItem>
              <SelectItem value="detailed">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Detailed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary/metrics and performance sections only in summary mode */}
        {reportType === "summary" && reportData && (
          <>
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                {getPeriodLabel()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-emerald-100 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold">₦{reportData.total_sales?.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-emerald-100 text-sm">Profit</p>
                    <p className={`text-2xl font-bold ${reportData.profit >= 0 ? 'text-white' : 'text-red-200'}`}>₦{reportData.profit?.toLocaleString()}</p>
                  </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">
                    {reportData.summary?.find(s => s.activity_type === 'sale')?.count || 0} sales
                </span>
                <span className="text-emerald-100">
                    {reportData.summary?.find(s => s.activity_type === 'expense')?.count || 0} expenses
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Sales</h3>
                <p className="text-2xl font-bold text-emerald-600">
                    ₦{reportData.total_sales?.toLocaleString()}
                </p>
                  <p className="text-sm text-slate-500">{reportData.summary?.find(s => s.activity_type === 'sale')?.count || 0} sales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Gross Profit</h3>
                <p className="text-2xl font-bold text-blue-600">
                    ₦{reportData.profit?.toLocaleString()}
                </p>
                  <p className="text-sm text-slate-500">Profit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Expenses</h3>
                <p className="text-2xl font-bold text-red-600">
                    ₦{reportData.total_expenses?.toLocaleString()}
                </p>
                  <p className="text-sm text-slate-500">Total Expenses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${reportData.profit >= 0 ? 'bg-green-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <BarChart3 className={`w-6 h-6 ${reportData.profit >= 0 ? 'text-green-600' : 'text-orange-600'}`} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Net Profit</h3>
                  <p className={`text-2xl font-bold ${reportData.profit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    ₦{reportData.profit?.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">Profit</p>
              </CardContent>
            </Card>
          </div>
            <ReportChart sales={reportData.total_sales} expenses={reportData.total_expenses} period={period} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                      ₦{reportData.total_sales?.toLocaleString()}
                  </p>
                    <p className="text-sm text-slate-500">Total Sales</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                      ₦{reportData.total_expenses?.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">Total Expenses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ₦{reportData.profit?.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">Profit</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      ₦{reportData.outstanding_debts?.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">Outstanding Debts</p>
                </div>
              </div>
            </CardContent>
          </Card>
            <RecentActivityList activities={activities.slice(0, 4)} />
          </>
        )}
        {/* Activity Log only in detailed mode */}
        {reportType === "detailed" && activities.length > 0 && (
          <ActivityLog activities={activities} period={period} />
        )}
        {/* Export Options always shown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export & Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button variant="outline" className="h-12 flex items-center gap-2">
                <Share className="w-4 h-4" />
                Share Report
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