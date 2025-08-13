"use client";

import { Package, Plus, ShoppingCart, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddItemHelp() {
  const addItemMethods = [
    {
      icon: Home,
      title: "From Home Page",
      description: "Click the Inventory quick action card",
      color: "purple"
    },
    {
      icon: Package,
      title: "From Inventory Page",
      description: "Use the 'Add Item' button in the header or floating action button",
      color: "purple"
    },
    {
      icon: ShoppingCart,
      title: "When Creating Sales",
      description: "If no items exist, you'll see a 'Go to Inventory' button",
      color: "emerald"
    },
    {
      icon: Plus,
      title: "Empty State",
      description: "When inventory is empty, prominent 'Add Your First Item' button appears",
      color: "blue"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">
        Ways to Add Items to Your Store
      </h3>
      <div className="grid gap-3">
        {addItemMethods.map((method, index) => (
          <Card key={index} className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${method.color}-100`}>
                  <method.icon className={`w-5 h-5 text-${method.color}-600`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 mb-1">
                    {method.title}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {method.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
