"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
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

interface ActivityLogProps {
  activities: ActivityItem[];
  period: string;
}

export default function ActivityLog({ activities, period }: ActivityLogProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getPeriodTitle = () => {
    switch (period) {
      case "today": return "Today's Activities";
      case "week": return "This Week's Activities";
      case "month": return "This Month's Activities";
      default: return "Recent Activities";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {getPeriodTitle()}
        </CardTitle>
        <CardDescription>
          Detailed timeline of all business activities
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-full overflow-x-auto p-1">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No Activities Found
            </h3>
            <p className="text-slate-500">
              No business activities recorded for this period
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-full overflow-hidden">
            {activities.map((activity, index) => (
              <div 
                key={`${activity.activity_type}-${activity.reference_id}-${index}`} 
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getActivityColor(activity.activity_type)}`}>
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.activity_type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          #{activity.reference_id}
                        </span>
                      </div>
                      <p className="font-medium text-slate-800 truncate break-words whitespace-normal max-w-full">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        activity.activity_type === 'expense' ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {activity.activity_type === 'expense' ? '-' : '+'}₦{Number(activity.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span>{formatDate(activity.activity_date)}</span>
                        <span>•</span>
                        <span>{formatTime(activity.activity_date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional details based on activity type */}
                  <div className="text-xs text-slate-500 mt-2 break-words whitespace-normal max-w-full" style={{ fontSize: '11px' }}>
                    {activity.activity_type === 'sale' && activity.details && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span>Customer: {activity.details.customer}</span>
                        <span>•</span>
                        <span>Status: {activity.details.payment_status}</span>
                        {activity.details.balance > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-600">Balance: ₦{Number(activity.details.balance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </>
                        )}
                      </div>
                    )}
                    {activity.activity_type === 'payment' && activity.details && (
                      <div className="flex items-center gap-3">
                        <span>Type: {activity.details.payment_type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Sale ID: #{activity.details.sale_id}</span>
                      </div>
                    )}
                    {activity.activity_type === 'debt_repayment' && activity.details && (
                      <div className="flex flex-wrap items-center gap-3 break-all">
                        {activity.details.buyer_name && (
                          <><span>Buyer: {activity.details.buyer_name}</span><span>•</span></>
                        )}
                        <span>Sale ID: #{activity.details.sale_id}</span>
                        <span>•</span>
                        <span>New Balance: ₦{Number(activity.details.newBalance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        <span>•</span>
                        <span>Total Repaid: ₦{Number(activity.details.totalRepaid).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    )}
                    {activity.activity_type === 'stock_addition' && activity.details && (
                      <div className="flex items-center gap-3">
                        <span>Old Stock: {activity.details.old_stock}</span>
                        <span>•</span>
                        <span>New Stock: {activity.details.new_stock}</span>
                        <span>•</span>
                        <span>Price: ₦{Number(activity.details.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    )}
                    {activity.activity_type === 'new_item' && activity.details && (
                      <div className="flex items-center gap-3">
                        <span>Stock: {activity.details.stock}</span>
                        <span>•</span>
                        <span>Wholesale: ₦{Number(activity.details.wholesale_price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    )}
                    {activity.activity_type === 'expense' && activity.details && (
                      <div className="flex items-center gap-3">
                        <span>Category: {activity.details.category}</span>
                        {activity.details.subcategory && (
                          <>
                            <span>•</span>
                            <span>{activity.details.subcategory}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}