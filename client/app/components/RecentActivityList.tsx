"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface ActivityItem {
  activity_type: string;
  reference_id: number;
  description: string;
  amount: number;
  status: string;
  activity_date: string;
  details: any;
}

export default function RecentActivityList({ activities }: { activities: ActivityItem[] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <DollarSign className="w-4 h-4" />;
      case 'payment': return <TrendingUp className="w-4 h-4" />;
      case 'expense': return <TrendingDown className="w-4 h-4" />;
      case 'debt_repayment': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'stock_addition': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'new_item': return <DollarSign className="w-4 h-4 text-green-600" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-emerald-100 text-emerald-700';
      case 'payment': return 'bg-blue-100 text-blue-700';
      case 'expense': return 'bg-red-100 text-red-700';
      case 'debt_repayment': return 'bg-orange-100 text-orange-700';
      case 'stock_addition': return 'bg-blue-100 text-blue-700';
      case 'new_item': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.length === 0 ? (
            <div className="text-slate-500 text-sm">No recent activity</div>
          ) : (
            activities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {activity.activity_type}
                    </Badge>
                    <span className="text-xs text-slate-500">#{activity.reference_id}</span>
                  </div>
                  <div className="font-medium text-slate-800 truncate text-sm">
                    {activity.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-xs ${activity.activity_type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {activity.activity_type === 'expense' ? '-' : '+'}₦{activity.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">{formatTime(activity.activity_date)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
