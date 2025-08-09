"use client"

import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"

export default function MobileStatsGrid() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const data = await apiService.authenticatedRequest("/api/analytics/dashboard")
        setStats(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch stats")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="px-2 py-4">Loading...</div>
  if (error) return <div className="px-2 py-4 text-red-500">{error}</div>
  if (!stats) return null

  const statCards = [
    {
      title: "Today's Sales",
      value: `₦${Number(stats.totalSales).toLocaleString()}`,
      change: stats.salesChange,
      trend: stats.salesChange && stats.salesChange.startsWith("+") ? "up" : "down",
      icon: DollarSign,
      color: "emerald"
    },
    {
      title: "Transactions",
      value: stats.totalSalesCount || 0,
      change: stats.itemsChange,
      trend: stats.itemsChange && stats.itemsChange.startsWith("+") ? "up" : "down",
      icon: ShoppingCart,
      color: "blue"
    },
    {
      title: "Outstanding",
      value: `₦${Number(stats.totalDebtAmount || 0).toLocaleString()}`,
      change: stats.debtsChange,
      trend: stats.debtsChange && stats.debtsChange.startsWith("-") ? "down" : "up",
      icon: Users,
      color: "red"
    },
    {
      title: "Low Stock",
      value: `${stats.totalItems || 0} items`,
      change: stats.itemsChange,
      trend: stats.itemsChange && stats.itemsChange.startsWith("+") ? "up" : "down",
      icon: AlertTriangle,
      color: "orange"
    }
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-800 px-2">Today's Overview</h3>
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-300 active:scale-95">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'emerald' ? 'bg-emerald-100' :
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'red' ? 'bg-red-100' :
                  'bg-orange-100'
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'emerald' ? 'text-emerald-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    'text-orange-600'
                  }`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">{stat.title}</p>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
                <div className="flex items-center">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs font-medium ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
