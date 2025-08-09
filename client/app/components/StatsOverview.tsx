"use client"

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    title: "Today's Sales",
    value: "₦125,000",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    color: "emerald"
  },
  {
    title: "Total Transactions",
    value: "23",
    change: "+5",
    trend: "up",
    icon: ShoppingCart,
    color: "blue"
  },
  {
    title: "Outstanding Debts",
    value: "₦45,000",
    change: "-8%",
    trend: "down",
    icon: Users,
    color: "red"
  },
  {
    title: "Low Stock Items",
    value: "3",
    change: "+1",
    trend: "up",
    icon: Package,
    color: "orange"
  }
]

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              stat.color === 'emerald' ? 'bg-emerald-100' :
              stat.color === 'blue' ? 'bg-blue-100' :
              stat.color === 'red' ? 'bg-red-100' :
              'bg-orange-100'
            }`}>
              <stat.icon className={`w-4 h-4 ${
                stat.color === 'emerald' ? 'text-emerald-600' :
                stat.color === 'blue' ? 'text-blue-600' :
                stat.color === 'red' ? 'text-red-600' :
                'text-orange-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {stat.value}
            </div>
            <div className="flex items-center text-sm">
              {stat.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}>
                {stat.change}
              </span>
              <span className="text-slate-500 ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
