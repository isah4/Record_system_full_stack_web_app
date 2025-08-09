"use client"

import { Clock, DollarSign, FileText, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ActivityLogProps {
  period: string
}

export default function ActivityLog({ period }: ActivityLogProps) {
  const activities = {
    today: [
      {
        type: "sale",
        description: "Sale to John Doe - Rice & Beans",
        amount: "₦125,000",
        time: "2:30 PM",
        status: "paid",
        icon: DollarSign,
        color: "emerald"
      },
      {
        type: "expense",
        description: "Electricity bill payment",
        amount: "₦25,000",
        time: "1:15 PM",
        status: "external",
        icon: FileText,
        color: "orange"
      },
      {
        type: "debt",
        description: "Payment from Mary Johnson",
        amount: "₦20,000",
        time: "11:45 AM",
        status: "partial",
        icon: Users,
        color: "blue"
      },
      {
        type: "sale",
        description: "Sale to Peter Smith - Cooking Oil",
        amount: "₦67,500",
        time: "10:20 AM",
        status: "debt",
        icon: DollarSign,
        color: "red"
      }
    ],
    week: [
      {
        type: "summary",
        description: "Weekly sales target achieved",
        amount: "₦1,250,000",
        time: "This week",
        status: "achieved",
        icon: TrendingUp,
        color: "emerald"
      },
      {
        type: "expense",
        description: "Total weekly expenses",
        amount: "₦450,000",
        time: "This week",
        status: "external",
        icon: FileText,
        color: "orange"
      }
    ],
    month: [
      {
        type: "summary",
        description: "Monthly revenue milestone",
        amount: "₦5,200,000",
        time: "This month",
        status: "milestone",
        icon: TrendingUp,
        color: "emerald"
      },
      {
        type: "expense",
        description: "Monthly operational costs",
        amount: "₦1,800,000",
        time: "This month",
        status: "operational",
        icon: FileText,
        color: "orange"
      }
    ]
  }

  const currentActivities = activities[period as keyof typeof activities] || activities.today

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {currentActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                activity.color === 'emerald' ? 'bg-emerald-100' :
                activity.color === 'orange' ? 'bg-orange-100' :
                activity.color === 'blue' ? 'bg-blue-100' :
                'bg-red-100'
              }`}>
                <activity.icon className={`w-5 h-5 ${
                  activity.color === 'emerald' ? 'text-emerald-600' :
                  activity.color === 'orange' ? 'text-orange-600' :
                  activity.color === 'blue' ? 'text-blue-600' :
                  'text-red-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm">{activity.description}</p>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-slate-800 text-sm">{activity.amount}</p>
                <Badge variant={
                  activity.status === 'paid' || activity.status === 'achieved' || activity.status === 'milestone' ? 'default' :
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
  )
}
