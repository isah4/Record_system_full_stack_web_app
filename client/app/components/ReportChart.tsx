"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ReportChartProps {
  sales: number
  expenses: number
  period: string
}

export default function ReportChart({ sales, expenses, period }: ReportChartProps) {
  const profit = sales - expenses
  const profitMargin = sales > 0 ? (profit / sales) * 100 : 0
  
  // Mock data for trend visualization
  const trendData = {
    today: [
      { label: "Morning", sales: 45000, expenses: 15000 },
      { label: "Afternoon", sales: 85000, expenses: 35000 },
      { label: "Evening", sales: 115000, expenses: 35000 }
    ],
    week: [
      { label: "Mon", sales: 180000, expenses: 65000 },
      { label: "Tue", sales: 220000, expenses: 75000 },
      { label: "Wed", sales: 195000, expenses: 70000 },
      { label: "Thu", sales: 245000, expenses: 85000 },
      { label: "Fri", sales: 210000, expenses: 80000 },
      { label: "Sat", sales: 120000, expenses: 45000 },
      { label: "Sun", sales: 78000, expenses: 30000 }
    ],
    month: [
      { label: "Week 1", sales: 1200000, expenses: 420000 },
      { label: "Week 2", sales: 1350000, expenses: 465000 },
      { label: "Week 3", sales: 1250000, expenses: 450000 },
      { label: "Week 4", sales: 1400000, expenses: 465000 }
    ]
  }

  const data = trendData[period as keyof typeof trendData] || trendData.today
  const maxValue = Math.max(...data.map(d => Math.max(d.sales, d.expenses)))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5" />
          Performance Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-slate-500">
                    ₦{(item.sales - item.expenses).toLocaleString()} profit
                  </span>
                </div>
                <div className="space-y-1">
                  {/* Sales Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-xs text-slate-500">Sales</div>
                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(item.sales / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-20 text-xs text-right text-slate-600">
                      ₦{item.sales.toLocaleString()}
                    </div>
                  </div>
                  {/* Expenses Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-xs text-slate-500">Costs</div>
                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-red-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(item.expenses / maxValue) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-20 text-xs text-right text-slate-600">
                      ₦{item.expenses.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Sales Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Total Expenses</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
