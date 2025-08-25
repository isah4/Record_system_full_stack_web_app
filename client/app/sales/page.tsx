"use client";

import { useState } from "react";
import { Plus, Search, Filter, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileNavigation from "../components/MobileNavigation";
import QuickSaleForm from "../components/QuickSaleForm";
import SaleDetailsModal from "../components/SaleDetailsModal";

import { useEffect } from "react";
import { api } from "@/config/api";
import { useRouter } from "next/navigation";

interface SaleItem {
  item_id: number;
  quantity: number;
  price_at_sale: number;
  subtotal: number;
  item_name: string;
}

interface Sale {
  id: number;
  buyer_name: string;
  total: number;
  payment_status: 'paid' | 'partial' | 'debt';
  balance: number;
  created_at: string;
  items: SaleItem[];
}

export default function SalesPage() {
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  // Set loadingSales to true initially to show loading overlay before any content
  const [loadingSales, setLoadingSales] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const router = useRouter();

  // Fetch sales with pagination (lazy loading)
  const fetchSales = async (reset = false) => {
    if (!hasMore && !reset) return;
    if (reset) {
      setPage(1);
      setHasMore(true);
    }
    setLoadingSales(reset);
    setIsFetchingMore(!reset);
    setError(null);
    try {
      // Assume backend supports ?page= and ?limit= (default 10 per page)
      const response = await api.get(`/api/sales?page=${reset ? 1 : page}&limit=10`);
      const data = response.data;
      if (reset) {
        setSales(data);
      } else {
        setSales((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
      setPage((prev) => (reset ? 2 : prev + 1));
    } catch (err: any) {
      setError(err.message || "Failed to fetch sales");
    } finally {
      setLoadingSales(false);
      setIsFetchingMore(false);
    }
  };

  // Initial load and reset on modal close
  useEffect(() => {
    fetchSales(true);
    // eslint-disable-next-line
  }, []);

  // Auto-update: refetch when QuickSaleForm closes
  useEffect(() => {
    if (!showQuickSale) {
      fetchSales(true);
    }
    // eslint-disable-next-line
  }, [showQuickSale]);

  // Filter sales by search term (buyer name or any item name)
  const filteredSales = sales.filter(
    (sale) =>
      sale.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items.some((item) =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Calculate today's summary from ALL sales, not just filtered
  const today = new Date().toLocaleDateString();
  const todaySalesAll = sales.filter((sale) => {
    const saleDate = new Date(sale.created_at).toLocaleDateString();
    return saleDate === today;
  });
  // Ensure total is always a float, even if string from backend
  const totalAmount = todaySalesAll.reduce((sum, sale) => {
    let val = sale.total;
    if (typeof val === "string") {
      val = parseFloat(val);
      if (isNaN(val)) val = 0;
    }
    return sum + val;
  }, 0);
  // Ensure transaction count is always a number
  const totalTransactions = Number(todaySalesAll.length);

  // Lazy loading: load more on scroll to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loadingSales &&
        !isFetchingMore &&
        hasMore
      ) {
        fetchSales();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [loadingSales, isFetchingMore, hasMore, page]);

  // Show loading overlay before any page content if loadingSales is true
  if (loadingSales) {
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
              Loading...
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
            className="rounded-full xs-touch-target"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 xs-text-adjust">
            <h1 className="text-xl font-bold text-slate-800">Sales</h1>
            <p className="text-sm text-slate-500">Manage transactions</p>
          </div>
          <Button
            onClick={() => setShowQuickSale(true)}
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl xs-button-adjust xs-touch-target"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 xs-reduce-padding">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl"
          />
        </div>

        {/* Sales List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 xs-text-adjust">
              Today's Sales
            </h2>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
          <div className="space-y-3">
            {error && <div className="text-red-500 text-center">{error}</div>}
            {filteredSales.length === 0 && !loadingSales && !error && (
              <div className="text-slate-500 text-center">No sales found.</div>
            )}
            {filteredSales.map((sale) => {
              const dateObj = new Date(sale.created_at);
              const dateStr = dateObj.toLocaleDateString();
              const timeStr = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <Card
                  key={sale.id}
                  className="hover:shadow-md transition-all duration-300 active:scale-95"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800">
                            {sale.buyer_name}
                          </h3>
                          <Badge
                            variant={
                              sale.payment_status === "paid"
                                ? "default"
                                : sale.payment_status === "partial"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {sale.payment_status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          {sale.items?.map((item, index) => (
                            <p key={index}>
                              {item.item_name} ({item.quantity})
                              {index < sale.items.length - 1 ? ", " : ""}
                            </p>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          {dateStr} • {timeStr}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">
                          ₦{sale.total.toLocaleString()}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setSelectedSale(sale);
                            setShowSaleDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {isFetchingMore && (
              <div className="text-center text-emerald-500">
                Loading more...
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <CardHeader>
            <CardTitle className="text-white">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-emerald-100 text-sm">Total Sales</p>
                <p className="text-2xl font-bold">
                  ₦{totalAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-emerald-100 text-sm">Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Quick Sale Modal */}
      {showQuickSale && (
        <QuickSaleForm onClose={() => setShowQuickSale(false)} />
      )}

      {/* Sale Details Modal */}
      {showSaleDetails && selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => {
            setShowSaleDetails(false);
            setSelectedSale(null);
          }}
        />
      )}
    </div>
  );
}
