"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  FileText,
  Bell,
  Search,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import MobileNavigation from "./components/MobileNavigation";
import QuickSaleForm from "./components/QuickSaleForm";
import MobileStatsGrid from "./components/MobileStatsGrid";
import RecentActivityList from "./components/RecentActivityList";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { api } from "@/config/api";

interface LowStockItem {
  id: number;
  name: string;
  stock: number;
}

interface ActivityItem {
  activity_type: string;
  reference_id: number;
  description: string;
  amount: number;
  status: string;
  activity_date: string;
  details: any;
}

export default function Dashboard() {
  const [showQuickSale, setShowQuickSale] = useState(false);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);
  const router = useRouter();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!isAuthenticated || isLoading) {
      setLoadingLowStock(false);
      return;
    }

    async function fetchLowStock() {
      setLoadingLowStock(true);
      try {
        const data = await apiService.authenticatedRequest<LowStockItem[]>(
          "/items/low-stock"
        );
        setLowStock(data);
      } catch (err: any) {
        // Only show error if it's not an authentication error
        if (!err.message?.includes('Access token') && !err.message?.includes('401')) {
          handleError(err, {
            title: "Failed to load low stock items",
            description: "Could not fetch low stock alerts. Please try refreshing the page."
          });
        }
      } finally {
        setLoadingLowStock(false);
      }
    }
    fetchLowStock();
  }, [isAuthenticated, isLoading, handleError]);

  useEffect(() => {
    async function fetchRecentActivities() {
      setLoadingActivities(true);
      setActivityError(null);
      try {
        // Use the same endpoint and logic as the report page
        const res = await api.get("/api/activity?limit=4");
        // Sort by activity_date DESC as a safeguard
        const sorted = [...res.data].sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime());
        setRecentActivities(sorted);
      } catch (err: any) {
        setActivityError("Could not load recent activity");
      } finally {
        setLoadingActivities(false);
      }
    }
    fetchRecentActivities();
  }, []);

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-sm xs-reduce-header-padding xs-reduce-padding">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="xs-text-adjust">
                <h1 className="font-bold text-lg text-slate-800">BizTracker</h1>
                <p className="text-xs text-slate-500 truncate max-w-[120px] xs:max-w-[80px]">
                  Welcome back, {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative xs-touch-target">
                <Bell className="w-5 h-5 text-slate-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </Button>
              <Button variant="ghost" size="icon" className="xs-touch-target">
                <Search className="w-5 h-5 text-slate-600" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="xs-touch-target">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                        {user?.email ? getUserInitials(user.email) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Loading Overlay */}
        {loadingLowStock && (
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
                Loading...
              </span>
            </div>
          </div>
        )}
        {quickActionLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="text-emerald-700 font-semibold text-lg">
                Loading...
              </span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-24 xs-reduce-padding">
          {/* Welcome Section */}
          <div className="text-center xs-text-adjust">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Good Morning! 👋
            </h2>
            <p className="text-slate-600 text-sm">
              Ready to manage your business today
            </p>
          </div>

          {/* Primary Action Button - Prominent for Mobile */}
          <div className="px-2 xs-reduce-padding">
            <Button
              onClick={() => setShowQuickSale(true)}
              size="lg"
              className="w-full h-16 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-95 text-lg font-semibold rounded-2xl xs-button-adjust"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add New Sale
            </Button>
          </div>

          {/* Stats Overview - Mobile Optimized */}
          <MobileStatsGrid />

          {/* Quick Actions - Large Touch Targets */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 px-2 xs-text-adjust xs-reduce-padding">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3 xs-single-col">
              <div onClick={async () => {
                setQuickActionLoading("sales");
                await new Promise(res => setTimeout(res, 400));
                router.push("/sales");
              }}>
                {/* Sales */}
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-95">
                  <CardContent className="p-6 text-center xs-reduce-card-padding">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                      <DollarSign className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Sales</h3>
                    <p className="text-sm text-slate-500">
                      View all transactions
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div onClick={async () => {
                setQuickActionLoading("expenses");
                await new Promise(res => setTimeout(res, 400));
                router.push("/expenses");
              }}>
                {/* Expenses */}
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-95">
                  <CardContent className="p-6 text-center xs-reduce-card-padding">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                      <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">
                      Expenses
                    </h3>
                    <p className="text-sm text-slate-500">Track spending</p>
                  </CardContent>
                </Card>
              </div>
              <div onClick={async () => {
                setQuickActionLoading("debts");
                await new Promise(res => setTimeout(res, 400));
                router.push("/debts");
              }}>
                {/* Debts */}
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-95">
                  <CardContent className="p-6 text-center xs-reduce-card-padding">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                      <Users className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">Debts</h3>
                    <p className="text-sm text-slate-500">Manage payments</p>
                  </CardContent>
                </Card>
              </div>
              <div onClick={async () => {
                setQuickActionLoading("inventory");
                await new Promise(res => setTimeout(res, 400));
                router.push("/inventory");
              }}>
                {/* Inventory */}
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-95">
                  <CardContent className="p-6 text-center xs-reduce-card-padding">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                      <Package className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">
                      Inventory
                    </h3>
                    <p className="text-sm text-slate-500">Stock levels</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Recent Activity - Mobile Optimized */}
          <div>
            {loadingActivities ? (
              <Card className="mb-4"><CardContent className="p-4 text-center text-slate-400">Loading recent activity...</CardContent></Card>
            ) : activityError ? (
              <Card className="mb-4"><CardContent className="p-4 text-center text-red-400">{activityError}</CardContent></Card>
            ) : (
              <RecentActivityList activities={recentActivities} />
            )}
          </div>

          {/* Critical Alerts - Mobile Friendly */}
          <Card className="border-red-200 bg-red-50 mx-2 xs-reduce-padding">
            <CardHeader className="pb-3 xs-reduce-card-padding">
              <CardTitle className="text-red-800 flex items-center gap-2 text-lg xs-text-adjust">
                <Package className="w-5 h-5" />
                ⚠️ Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 xs-reduce-card-padding">
              {loadingLowStock ? (
                <div className="p-3">Loading...</div>
              ) : lowStock.length === 0 ? (
                <div className="p-3 text-slate-500">No low stock items.</div>
              ) : (
                lowStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-slate-800">
                        {item.name}
                      </span>
                      <p className="text-sm text-slate-500">
                        Only {item.stock} left
                      </p>
                    </div>
                    <Badge
                      variant="destructive"
                      className="text-xs cursor-pointer"
                      onClick={() => {
                        const message = encodeURIComponent(`URGENT: The item '${item.name}' is low in stock (only ${item.stock} left). Please restock soon!`);
                        window.open(`https://wa.me/2349031557364?text=${message}`, '_blank');
                      }}
                    >
                      URGENT
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation />

        {/* Quick Sale Modal - Mobile Optimized */}
        {showQuickSale && (
          <QuickSaleForm onClose={() => setShowQuickSale(false)} />
        )}
      </div>
    </ProtectedRoute>
  );
}
