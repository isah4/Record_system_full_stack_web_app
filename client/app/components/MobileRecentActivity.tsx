"use client"

import { Clock, DollarSign, FileText, Users, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const activities = [
  {
    type: "sale",
    description: "Sale to John Doe",
    amount: "₦15,000",
    time: "2 min ago",
    status: "paid",
    icon: DollarSign,
    color: "emerald"
  },
  {
    type: "expense",
    description: "Electricity bill",
    amount: "₦8,500",
    time: "1 hour ago",
    status: "external",
    icon: FileText,
    color: "orange"
  },
  {
    type: "debt",
    description: "Payment from Mary",
    amount: "₦5,000",
    time: "3 hours ago",
    status: "partial",
    icon: Users,
    color: "blue"
  }
]

export default function MobileRecentActivity() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2 xs-reduce-padding">
        <h3 className="text-lg font-semibold text-slate-800 xs-text-adjust">Recent Activity</h3>
        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors active:bg-slate-100 xs-reduce-card-padding">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  activity.color === 'emerald' ? 'bg-emerald-100' :
                  activity.color === 'orange' ? 'bg-orange-100' :
                  'bg-blue-100'
                }`}>
                  <activity.icon className={`w-6 h-6 ${
                    activity.color === 'emerald' ? 'text-emerald-600' :
                    activity.color === 'orange' ? 'text-orange-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{activity.description}</p>
                  <p className="text-sm text-slate-500">{activity.time}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-800 text-sm">{activity.amount}</p>
                  <Badge variant={
                    activity.status === 'paid' ? 'default' :
                    activity.status === 'partial' ? 'secondary' :
                    'outline'
                  } className="text-xs mt-1">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
