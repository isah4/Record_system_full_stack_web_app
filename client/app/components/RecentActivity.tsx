"use client"

import { Clock, DollarSign, FileText, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    type: "sale",
    description: "Sale to John Doe",
    amount: "₦15,000",
    time: "2 minutes ago",
    status: "paid",
    icon: DollarSign,
    color: "emerald"
  },
  {
    type: "expense",
    description: "Electricity bill payment",
    amount: "₦8,500",
    time: "1 hour ago",
    status: "external",
    icon: FileText,
    color: "orange"
  },
  {
    type: "debt",
    description: "Partial payment from Mary",
    amount: "₦5,000",
    time: "3 hours ago",
    status: "partial",
    icon: Users,
    color: "blue"
  },
  {
    type: "sale",
    description: "Sale to Peter Smith",
    amount: "₦22,000",
    time: "5 hours ago",
    status: "debt",
    icon: DollarSign,
    color: "red"
  }
]

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest transactions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
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
              <div className="flex-1">
                <p className="font-medium text-slate-800">{activity.description}</p>
                <p className="text-sm text-slate-500">{activity.time}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800">{activity.amount}</p>
                <Badge variant={
                  activity.status === 'paid' ? 'default' :
                  activity.status === 'partial' ? 'secondary' :
                  activity.status === 'debt' ? 'destructive' :
                  'outline'
                } className="text-xs">
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
