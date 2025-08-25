"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Package,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MobileNavigation from "../components/MobileNavigation";
import ItemFormModal from "../components/ItemFormModal";
import { api } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  wholesale_price?: number;
  created_at?: string;
  updated_at?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStock, setFilterStock] = useState("all");
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [loadingItems, setLoadingItems] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const response = await api.get("/api/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleItemSuccess = () => {
    fetchItems();
    setShowItemForm(false);
    setSelectedItem(null);
    toast({
      title: "Success",
      description: selectedItem ? "Item updated successfully" : "Item added successfully",
    });
  };

  const handleDeleteItem = async () => {
    if (!deleteItemId) return;

    try {
      await api.delete(`/api/items/${deleteItemId}`);
      await fetchItems();
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStock === "all" || 
      (filterStock === "low" && item.stock < 5) ||
      (filterStock === "out" && item.stock === 0) ||
      (filterStock === "available" && item.stock > 0);
    return matchesSearch && matchesFilter;
  });

  const totalItems = items.length;
  const lowStockCount = items.filter(item => item.stock < 5).length;
  const outOfStockCount = items.filter(item => item.stock === 0).length;
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0);

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 5) return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Low Stock</Badge>;
    return <Badge variant="outline" className="bg-green-100 text-green-800">In Stock</Badge>;
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-600";
    if (stock < 5) return "text-orange-600";
    return "text-green-600";
  };

  if (loadingItems) {
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
              Inventory Management
            </h1>
            <p className="text-sm text-slate-500">Manage your stock levels</p>
          </div>
          <Button
            onClick={() => {
              setSelectedItem(null);
              setShowItemForm(true);
            }}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 xs-reduce-padding">
        {/* Primary Add Item Action - Prominent for Mobile */}
        {totalItems === 0 && (
          <div className="px-2">
            <Button
              onClick={() => {
                setSelectedItem(null);
                setShowItemForm(true);
              }}
              size="lg"
              className="w-full h-16 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform active:scale-95 text-lg font-semibold rounded-2xl"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add Your First Item
            </Button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 xs-single-col">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-purple-100 text-sm">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-purple-100 text-xs">
                  ₦{totalValue.toLocaleString()} value
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-orange-100 text-sm">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-orange-100 text-xs">
                  {outOfStockCount} out of stock
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search items by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl"
            />
          </div>

          <div className="flex gap-3">
            <Select value={filterStock} onValueChange={setFilterStock}>
              <SelectTrigger className="flex-1 h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
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

        {/* Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Inventory Items
            </h2>
            <Badge variant="outline" className="text-xs">
              {filteredItems.length} items
            </Badge>
          </div>

          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No items found
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm || filterStock !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Start by adding your first inventory item"
                  }
                </p>
                <Button
                  onClick={() => {
                    setSelectedItem(null);
                    setShowItemForm(true);
                  }}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </Card>
            ) : (
              filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800">
                              {item.name}
                            </h3>
                            {getStockBadge(item.stock)}
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            Selling: ₦{item.price.toLocaleString()}
                            {item.wholesale_price && item.wholesale_price > 0 && (
                              <span className="text-xs text-slate-500 ml-2">
                                | Cost: ₦{item.wholesale_price.toLocaleString()}
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500">
                              Value: ₦{(item.price * item.stock).toLocaleString()}
                            </span>
                            {item.wholesale_price && item.wholesale_price > 0 && (
                              <span className="text-green-600 font-medium">
                                | Profit: ₦{((item.price - item.wholesale_price) * item.stock).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getStockColor(item.stock)}`}>
                            {item.stock}
                          </p>
                          <p className="text-xs text-slate-500">
                            in stock
                          </p>
                        </div>
                      </div>

                      {/* Stock Level Indicator */}
                      <div className="space-y-2">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              item.stock === 0
                                ? "bg-red-500"
                                : item.stock < 5
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min((item.stock / 20) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>0</span>
                          <span>20+ units</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowItemForm(true);
                          }}
                          variant="outline"
                          className="flex-1 h-10 rounded-xl"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setDeleteItemId(item.id)}
                          variant="outline"
                          className="w-10 h-10 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {items.filter(item => item.stock > 5).length}
                </p>
                <p className="text-xs text-slate-500">Well Stocked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {lowStockCount}
                </p>
                <p className="text-xs text-slate-500">Need Restocking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Floating Action Button - Only show when there are items */}
      {totalItems > 0 && (
        <Button
          onClick={() => {
            setSelectedItem(null);
            setShowItemForm(true);
          }}
          size="lg"
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 rounded-full z-50"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Item Form Modal */}
      {showItemForm && (
        <ItemFormModal
          item={selectedItem}
          onClose={() => {
            setShowItemForm(false);
            setSelectedItem(null);
          }}
          onSuccess={handleItemSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteItemId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
