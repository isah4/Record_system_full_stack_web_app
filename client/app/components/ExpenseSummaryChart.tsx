"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpenseSummaryChartProps {
  internalAmount: number
  externalAmount: number
}

export default function ExpenseSummaryChart({ internalAmount, externalAmount }: ExpenseSummaryChartProps) {
  const total = internalAmount + externalAmount
  const internalPercentage = total > 0 ? (internalAmount / total) * 100 : 0
  const externalPercentage = total > 0 ? (externalAmount / total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual Chart */}
          <div className="relative">
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div 
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${internalPercentage}%` }}
                ></div>
                <div 
                  className="bg-orange-500 transition-all duration-500"
                  style={{ width: `${externalPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Internal Expenses</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800">₦{internalAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{internalPercentage.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">External Expenses</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800">₦{externalAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-500">{externalPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
