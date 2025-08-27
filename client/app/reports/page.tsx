"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  Share,
  Activity,
  DollarSign,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MobileNavigation from "../components/MobileNavigation";
import ReportChart from "../components/ReportChart";
import ActivityLog from "../components/ActivityLog";
import RecentActivityList from "../components/RecentActivityList";
import { api } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { customersApi, type CustomerSummary } from "@/lib/api/customers";

interface ActivityItem {
  activity_type: string;
  reference_id: number;
  description: string;
  amount: number;
  status: string;
  activity_date: string;
  details: any;
}

interface ReportData {
  summary: Array<{
    activity_type: string;
    total_amount: number;
    count: number;
  }>;
  total_sales: number;
  total_expenses: number;
  profit: number;
  outstanding_debts: number;
}

interface GenerateReportPDFArgs {
  businessName: string;
  dateRange: string;
  reportType: string;
  reportData: ReportData;
  activities: ActivityItem[];
}

// PDF Export Helper
async function generateReportPDF({
  businessName,
  dateRange,
  reportType,
  reportData,
  activities,
}: GenerateReportPDFArgs) {
  // Dynamically import pdfmake and fonts only on client
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFonts = await import("pdfmake/build/vfs_fonts");
  pdfMakeModule.default.vfs =
    (pdfFonts as any).default?.vfs ||
    (pdfFonts as any).vfs ||
    (pdfFonts as any).default?.pdfMake?.vfs ||
    (pdfFonts as any).pdfMake?.vfs;

  const now = new Date();
  const generationDate = now.toLocaleString();
  // Add logo SVG as base64 (for PDF embedding)
  const logoBase64 =
    'data:image/svg+xml;base64,' +
    btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="215" height="48" fill="none"><path fill="#000" d="M57.588 9.6h6L73.828 38h-5.2l-2.36-6.88h-11.36L52.548 38h-5.2l10.24-28.4Zm7.16 17.16-4.16-12.16-4.16 12.16h8.32Zm23.694-2.24c-.186-1.307-.706-2.32-1.56-3.04-.853-.72-1.866-1.08-3.04-1.08-1.68 0-2.986.613-3.92 1.84-.906 1.227-1.36 2.947-1.36 5.16s.454 3.933 1.36 5.16c.934 1.227 2.24 1.84 3.92 1.84 1.254 0 2.307-.373 3.16-1.12.854-.773 1.387-1.867 1.6-3.28l5.12.24c-.186 1.68-.733 3.147-1.64 4.4-.906 1.227-2.08 2.173-3.52 2.84-1.413.667-2.986 1-4.72 1-2.08 0-3.906-.453-5.48-1.36-1.546-.907-2.76-2.2-3.64-3.88-.853-1.68-1.28-3.627-1.28-5.84 0-2.24.427-4.187 1.28-5.84.88-1.68 2.094-2.973 3.64-3.88 1.574-.907 3.4-1.36 5.48-1.36 1.68 0 3.227.32 4.64.96 1.414.64 2.56 1.56 3.44 2.76.907 1.2 1.454 2.6 1.64 4.2l-5.12.28Zm11.486-7.72.12 3.4c.534-1.227 1.307-2.173 2.32-2.84 1.04-.693 2.267-1.04 3.68-1.04 1.494 0 2.76.387 3.8 1.16 1.067.747 1.827 1.813 2.28 3.2.507-1.44 1.294-2.52 2.36-3.24 1.094-.747 2.414-1.12 3.96-1.12 1.414 0 2.64.307 3.68.92s1.84 1.52 2.4 2.72c.56 1.2.84 2.667.84 4.4V38h-4.96V25.92c0-1.813-.293-3.187-.88-4.12-.56-.96-1.413-1.44-2.56-1.44-.906 0-1.68.213-2.32.64-.64.427-1.133 1.053-1.48 1.88-.32.827-.48 1.84-.48 3.04V38h-4.56V25.92c0-1.2-.133-2.213-.4-3.04-.24-.827-.626-1.453-1.16-1.88-.506-.427-1.133-.64-1.88-.64-.906 0-1.68.227-2.32.68-.64.427-1.133 1.053-1.48 1.88-.32.827-.48 1.827-.48 3V38h-4.96V16.8h4.48Zm26.723 10.6c0-2.24.427-4.187 1.28-5.84.854-1.68 2.067-2.973 3.64-3.88 1.574-.907 3.4-1.36 5.48-1.36 1.84 0 3.494.413 4.96 1.24 1.467.827 2.64 2.08 3.52 3.76.88 1.653 1.347 3.693 1.4 6.12v1.32h-15.08c.107 1.813.614 3.227 1.52 4.24.907.987 2.134 1.48 3.68 1.48.987 0 1.88-.253 2.68-.76a4.803 4.803 0 0 0 1.84-2.2l5.08.36c-.64 2.027-1.84 3.64-3.6 4.84-1.733 1.173-3.733 1.76-6 1.76-2.08 0-3.906-.453-5.48-1.36-1.573-.907-2.786-2.2-3.64-3.88-.853-1.68-1.28-3.627-1.28-5.84Zm15.16-2.04c-.213-1.733-.76-3.013-1.64-3.84-.853-.827-1.893-1.24-3.12-1.24-1.44 0-2.6.453-3.48 1.36-.88.88-1.44 2.12-1.68 3.72h9.92ZM163.139 9.6V38h-5.04V9.6h5.04Zm8.322 7.2.24 5.88-.64-.36c.32-2.053 1.094-3.56 2.32-4.52 1.254-.987 2.787-1.48 4.6-1.48 2.32 0 4.107.733 5.36 2.2 1.254 1.44 1.88 3.387 1.88 5.84V38h-4.96V25.92c0-1.253-.12-2.28-.36-3.08-.24-.8-.64-1.413-1.2-1.84-.533-.427-1.253-.64-2.16-.64-1.44 0-2.573.48-3.4 1.44-.8.933-1.2 2.307-1.2 4.12V38h-4.96V16.8h4.48Zm30.003 7.72c-.186-1.307-.706-2.32-1.56-3.04-.853-.72-1.866-1.08-3.04-1.08-1.68 0-2.986.613-3.92 1.84-.906 1.227-1.36 2.947-1.36 5.16s.454 3.933 1.36 5.16c.934 1.227 2.24 1.84 3.92 1.84 1.254 0 2.307-.373 3.16-1.12.854-.773 1.387-1.867 1.6-3.28l5.12.24c-.186 1.68-.733 3.147-1.64 4.4-.906 1.227-2.08 2.173-3.52 2.84-1.413.667-2.986 1-4.72 1-2.08 0-3.906-.453-5.48-1.36-1.546-.907-2.76-2.2-3.64-3.88-.853-1.68-1.28-3.627-1.28-5.84 0-2.24.427-4.187 1.28-5.84.88-1.68 2.094-2.973 3.64-3.88 1.574-.907 3.4-1.36 5.48-1.36 1.68 0 3.227.32 4.64.96 1.414.64 2.56 1.56 3.44 2.76.907 1.2 1.454 2.6 1.64 4.2l-5.12.28Z"/><path fill="#171717" fill-rule="evenodd" d="m7.839 40.783 16.03-28.054L20 6 0 40.783h7.839Zm8.214 0H40L27.99 19.894l-4.02 7.032 3.976 6.914H20.02l-3.967 6.943Z" clip-rule="evenodd"/></svg>`);

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 80, 40, 60],
    header: (currentPage: number, pageCount: number, pageSize: any) => [
      {
        columns: [
          { width: 60, text: "" }, // leave logo space blank
          {
            stack: [
              { text: businessName, style: "headerCompany" },
              { text: `${reportType === "summary" ? "Summary" : "Detailed"} Report`, style: "headerTitle" },
              { text: dateRange, style: "headerDate" }
            ],
            alignment: "center"
          }
        ],
        margin: [0, 10, 0, 0]
      },
      {
        canvas: [
          { type: 'rect', x: 0, y: 0, w: pageSize.width - 80, h: 3, color: '#2563eb' } // primary color
        ],
        margin: [0, 5, 0, 0]
      }
    ],
    footer: (currentPage: number, pageCount: number) => ({
      type: "columns",
      columns: [
        { text: `Generated: ${generationDate}`, style: "footerLeft" },
        { text: `Page ${currentPage} of ${pageCount}`, alignment: "right", style: "footerRight" }
      ],
      margin: [40, 0, 40, 20]
    }),
    styles: {
      headerCompany: { fontSize: 16, bold: true, color: "#2563eb" }, // primary
      headerTitle: { fontSize: 13, bold: true, margin: [0, 2, 0, 0], color: "#0f172a" },
      headerDate: { fontSize: 10, color: "#64748b" },
      sectionTitle: { fontSize: 13, bold: true, color: "#2563eb", margin: [0, 10, 0, 6] },
      tableHeader: { bold: true, fillColor: "#2563eb", color: "white", fontSize: 11 },
      tableCell: { fontSize: 10, margin: [0, 2, 0, 2] },
      footerLeft: { fontSize: 9, italics: true, color: "#64748b" },
      footerRight: { fontSize: 9, italics: true, color: "#64748b" }
    },
    content: [] as any[],
  };

  if (reportType === "summary") {
    docDefinition.content.push(
      { text: "Key Metrics", style: "sectionTitle" },
      {
        table: {
          widths: ["*", "*", "*", "*"],
          body: [
            [
              { text: "Total Sales", style: "tableHeader" },
              { text: "Total Expenses", style: "tableHeader" },
              { text: "Profit", style: "tableHeader" },
              { text: "Outstanding Debts", style: "tableHeader" },
            ],
            [
              `₦${reportData.total_sales?.toLocaleString()}`,
              `₦${reportData.total_expenses?.toLocaleString()}`,
              `₦${reportData.profit?.toLocaleString()}`,
              `₦${reportData.outstanding_debts?.toLocaleString()}`,
            ],
          ],
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#2563eb' : (rowIndex % 2 === 0 ? '#f1f5f9' : null)
          }
        },
        layout: "lightHorizontalLines",
        style: "tableCell",
        margin: [0, 0, 0, 10],
      },
      { text: "Activity Summary", style: "sectionTitle" },
      {
        table: {
          widths: ["*", "*", "*"],
          body: [
            [
              { text: "Activity Type", style: "tableHeader" },
              { text: "Count", style: "tableHeader" },
              { text: "Total Amount", style: "tableHeader" },
            ],
            ...reportData.summary.map((s: { activity_type: string; count: number; total_amount: number }) => [
              s.activity_type,
              s.count,
              `₦${s.total_amount?.toLocaleString()}`,
            ]),
          ],
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#2563eb' : (rowIndex % 2 === 0 ? '#f1f5f9' : null)
          }
        },
        layout: "lightHorizontalLines",
        style: "tableCell",
      }
    );
  } else {
    docDefinition.content.push(
      { text: "Detailed Activity Log", style: "sectionTitle" },
      {
        table: {
          widths: [60, 80, "*", 60, 60, 60],
          body: [
            [
              { text: "Date", style: "tableHeader" },
              { text: "Type", style: "tableHeader" },
              { text: "Description", style: "tableHeader" },
              { text: "Amount", style: "tableHeader" },
              { text: "Status", style: "tableHeader" },
              { text: "Ref ID", style: "tableHeader" },
            ],
            ...activities.map((a: ActivityItem) => [
              a.activity_date,
              a.activity_type,
              a.description,
              `₦${a.amount?.toLocaleString()}`,
              a.status,
              a.reference_id,
            ]),
          ],
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#2563eb' : (rowIndex % 2 === 0 ? '#f1f5f9' : null)
          }
        },
        layout: "lightHorizontalLines",
        style: "tableCell",
      }
    );
  }

  pdfMakeModule.default.createPdf(docDefinition).download(
    `${businessName.replace(/\s+/g, "_")}_${reportType}_report_${dateRange.replace(/\s+/g, "_")}.pdf`
  );
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("today");
  const [reportType, setReportType] = useState("summary");
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [profitAnalysis, setProfitAnalysis] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [customerSummaries, setCustomerSummaries] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const { toast } = useToast();
  const router = useRouter();

  const fetchReport = async (selectedPeriod: string) => {
    try {
      setLoadingReports(true);
      // Calculate date range based on period
      const today = new Date();
      let startDate = today.toISOString().split('T')[0];
      let endDate = today.toISOString().split('T')[0];
      if (selectedPeriod === "week") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6); // last 7 days including today
        startDate = weekStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      } else if (selectedPeriod === "month") {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = today.toISOString().split('T')[0];
      }
      // Fetch summary and activities
      const [summaryResponse, activitiesResponse, profitResponse] = await Promise.all([
        api.get(`/api/activity/summary?${selectedPeriod === "today" ? `date=${endDate}` : `start=${startDate}&end=${endDate}`}`),
        api.get(`/api/activity?${selectedPeriod === "today" ? `date=${endDate}` : ""}&limit=500`),
        api.get(`/api/activity/profit-analysis?startDate=${startDate}&endDate=${endDate}`)
      ]);
      setReportData(summaryResponse.data);
      setActivities(activitiesResponse.data);
      setProfitAnalysis(profitResponse.data && profitResponse.data.length > 0 ? profitResponse.data[0] : null);

      // Build trend data
      const acts = activitiesResponse.data || [];
      let trend: any[] = [];
      if (selectedPeriod === "today") {
        // Group by morning/afternoon/evening
        const slots = [
          { label: "Morning", start: 5, end: 11 },
          { label: "Afternoon", start: 12, end: 16 },
          { label: "Evening", start: 17, end: 22 }
        ];
        trend = slots.map(slot => {
          const slotActs = acts.filter((a: ActivityItem) => {
            const hour = new Date(a.activity_date).getHours();
            return hour >= slot.start && hour <= slot.end;
          });
          return {
            label: slot.label,
            sales: slotActs.filter((a: ActivityItem) => a.activity_type === 'sale').reduce((sum: number, a: ActivityItem) => sum + (Number(a.amount) || 0), 0),
            expenses: slotActs.filter((a: ActivityItem) => a.activity_type === 'expense').reduce((sum: number, a: ActivityItem) => sum + (Number(a.amount) || 0), 0)
          };
        });
      } else if (selectedPeriod === "week") {
        // Group by day
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayMap: Record<string, { label: string; sales: number; expenses: number }> = {};
        acts.forEach((a: ActivityItem) => {
          const d = new Date(a.activity_date);
          const day = days[d.getDay()];
          if (!dayMap[day]) dayMap[day] = { label: day, sales: 0, expenses: 0 };
          if (a.activity_type === 'sale') dayMap[day].sales += Number(a.amount) || 0;
          if (a.activity_type === 'expense') dayMap[day].expenses += Number(a.amount) || 0;
        });
        trend = days.map(day => dayMap[day] || { label: day, sales: 0, expenses: 0 });
      } else if (selectedPeriod === "month") {
        // Group by week of month
        const weekMap: Record<number, { label: string; sales: number; expenses: number }> = {};
        acts.forEach((a: ActivityItem) => {
          const d = new Date(a.activity_date);
          const week = Math.ceil((d.getDate() - d.getDay() + 1) / 7);
          if (!weekMap[week]) weekMap[week] = { label: `Week ${week}`, sales: 0, expenses: 0 };
          if (a.activity_type === 'sale') weekMap[week].sales += Number(a.amount) || 0;
          if (a.activity_type === 'expense') weekMap[week].expenses += Number(a.amount) || 0;
        });
        // Fill missing weeks (1-5)
        trend = [];
        for (let w = 1; w <= 5; w++) {
          trend.push(weekMap[w] || { label: `Week ${w}`, sales: 0, expenses: 0 });
        }
      }
      setTrendData(trend);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  useEffect(() => {
    (async () => {
      try {
        const s = await customersApi.debtsSummary();
        setCustomerSummaries(s);
      } catch (e) {
        // non-blocking
      }
    })();
  }, []);

  const getPeriodLabel = () => {
    switch (period) {
      case "today": return "Today's Report";
      case "week": return "This Week's Report";
      case "month": return "This Month's Report";
      default: return "Business Report";
    }
  };

  const getPeriodDescription = () => {
    switch (period) {
      case "today": return "Daily performance overview";
      case "week": return "Weekly performance analysis";
      case "month": return "Monthly business summary";
      default: return "Business performance analysis";
    }
  };

  const handleDownloadReport = async () => {
    if (!reportData) return;
    const businessName = "My Business";
    let dateRange = "";
    const today = new Date();
    if (period === "today") {
      dateRange = today.toISOString().split("T")[0];
    } else if (period === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      dateRange = `${weekStart.toISOString().split("T")[0]} to ${today.toISOString().split("T")[0]}`;
    } else if (period === "month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      dateRange = `${monthStart.toISOString().split("T")[0]} to ${today.toISOString().split("T")[0]}`;
    }
    // Use generateReportPDF to download
    await generateReportPDF({ businessName, dateRange, reportType, reportData: reportData as ReportData, activities });
  };

  const handleShareReport = async () => {
    if (!reportData) return;
    const businessName = "My Business";
    let dateRange = "";
    const today = new Date();
    if (period === "today") {
      dateRange = today.toISOString().split("T")[0];
    } else if (period === "week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6);
      dateRange = `${weekStart.toISOString().split("T")[0]} to ${today.toISOString().split("T")[0]}`;
    } else if (period === "month") {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      dateRange = `${monthStart.toISOString().split("T")[0]} to ${today.toISOString().split("T")[0]}`;
    }
    // Prepare PDF definition (reuse generateReportPDF logic, but get docDefinition)
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFonts = await import("pdfmake/build/vfs_fonts");
    pdfMakeModule.default.vfs =
      (pdfFonts as any).default?.vfs ||
      (pdfFonts as any).vfs ||
      (pdfFonts as any).default?.pdfMake?.vfs ||
      (pdfFonts as any).pdfMake?.vfs;
    // Build docDefinition (reuse from generateReportPDF)
    // For brevity, let's assume you have a getDocDefinition function or reuse generateReportPDF's logic
    // ...build docDefinition here...
    // For now, call generateReportPDF but intercept the docDefinition
    // We'll use a simplified version for this example:
    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 80, 40, 60],
      header: (currentPage: number, pageCount: number, pageSize: any) => [
        {
          columns: [
            { width: 60, text: "" }, // leave logo space blank
            {
              stack: [
                { text: businessName, style: "headerCompany" },
                { text: `${reportType === "summary" ? "Summary" : "Detailed"} Report`, style: "headerTitle" },
                { text: dateRange, style: "headerDate" }
              ],
              alignment: "center"
            }
          ],
          margin: [0, 10, 0, 0]
        },
        {
          canvas: [
            { type: 'rect', x: 0, y: 0, w: pageSize.width - 80, h: 3, color: '#2563eb' } // primary color
          ],
          margin: [0, 5, 0, 0]
        }
      ],
      footer: (currentPage: number, pageCount: number) => ({
        type: "columns",
        columns: [
          { text: `Generated: ${new Date().toLocaleString()}`, style: "footerLeft" },
          { text: `Page ${currentPage} of ${pageCount}`, alignment: "right", style: "footerRight" }
        ],
        margin: [40, 0, 40, 20]
      }),
      styles: {
        headerCompany: { fontSize: 16, bold: true, color: "#2563eb" }, // primary
        headerTitle: { fontSize: 13, bold: true, margin: [0, 2, 0, 0], color: "#0f172a" },
        headerDate: { fontSize: 10, color: "#64748b" },
        sectionTitle: { fontSize: 13, bold: true, color: "#2563eb", margin: [0, 10, 0, 6] },
        tableHeader: { bold: true, fillColor: "#2563eb", color: "white", fontSize: 11 },
        tableCell: { fontSize: 10, margin: [0, 2, 0, 2] },
        footerLeft: { fontSize: 9, italics: true, color: "#64748b" },
        footerRight: { fontSize: 9, italics: true, color: "#64748b" }
      },
      content: [] as any[],
    };

    if (reportType === "summary") {
      docDefinition.content.push(
        { text: "Key Metrics", style: "sectionTitle" },
        {
          table: {
            widths: ["*", "*", "*", "*"],
            body: [
              [
                { text: "Total Sales", style: "tableHeader" },
                { text: "Total Expenses", style: "tableHeader" },
                { text: "Profit", style: "tableHeader" },
                { text: "Outstanding Debts", style: "tableHeader" },
              ],
              [
               `₦${(Number((reportData as any).total_sales) || 0).toFixed(2)}`,
               `₦${(Number((reportData as any).total_expenses) || 0).toFixed(2)}`,
               `₦${(Number((reportData as any).profit) || 0).toFixed(2)}`,
               `₦${(Number((reportData as any).outstanding_debts) || 0).toFixed(2)}`,
              ],
            ],
            layout: {
              fillColor: (rowIndex: number) => rowIndex === 0 ? '#2563eb' : (rowIndex % 2 === 0 ? '#f1f5f9' : null)
            }
          },
          layout: "lightHorizontalLines",
          style: "tableCell",
          margin: [0, 0, 0, 10],
        },
        { text: "Activity Summary", style: "sectionTitle" },
        {
          table: {
            widths: ["*", "*", "*"],
            body: [
              [
                { text: "Activity Type", style: "tableHeader" },
                { text: "Count", style: "tableHeader" },
                { text: "Total Amount", style: "tableHeader" },
              ],
              ...((reportData as any).summary || []).map((s: { activity_type: string; count: number; total_amount: number }) => [
                s.activity_type,
                s.count,
                 `₦${(Number(s.total_amount) || 0).toFixed(2)}`,
              ]),
            ],
            layout: {
              fillColor: (rowIndex: number) => rowIndex === 0 ? '#2563eb' : (rowIndex % 2 === 0 ? '#f1f5f9' : null)
            }
          },
          layout: "lightHorizontalLines",
          style: "tableCell",
        }
      );
    } else {
      docDefinition.content.push(
        { text: "Detailed Activity Log", style: "sectionTitle" },
        {
          table: {
            widths: [60, 80, "*", 60, 60, 60],
            body: [
              [
                { text: "Date", style: "tableHeader" },
                { text: "Type", style: "tableHeader" },
                { text: "Description", style: "tableHeader" },
                { text: "Amount", style: "tableHeader" },
                { text: "Status", style: "tableHeader" },
                { text: "Ref ID", style: "tableHeader" },
              ],
              ...activities.map((a: ActivityItem) => [
                a.activity_date,
                a.activity_type,
                a.description,
                `₦${a.amount?.toLocaleString()}`,
                a.status,
                a.reference_id,
              ]),
            ],
            layout: {
              fillColor: (rowIndex: number) => rowIndex === 0 ? '#2563eb' : (rowIndex % 2 === 0 ? '#f1f5f9' : null)
            }
          },
          layout: "lightHorizontalLines",
          style: "tableCell",
        }
      );
    }

    try {
      pdfMakeModule.default.createPdf(docDefinition).getBlob(async (blob: Blob) => {
        const file = new File([blob], `${businessName.replace(/\s+/g, "_")}_${reportType}_report_${dateRange.replace(/\s+/g, "_")}.pdf`, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `${businessName} Report`,
              text: `Business Report for ${businessName} (${dateRange})`
            });
          } catch (err) {
            toast({ title: "Share cancelled", description: "The share action was cancelled." });
          }
        } else {
          // Fallback: download the PDF
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
          toast({ title: "Downloaded!", description: "PDF report downloaded to your device." });
        }
      });
    } catch (err) {
      // Fallback: copy summary to clipboard
      const summary =
        `Business Report for ${businessName}\n` +
        `Period: ${dateRange}\n` +
         `Total Sales: ₦${(Number((reportData as any).total_sales) || 0).toFixed(2)}\n` +
         `Gross Profit: ₦${(Number(profitAnalysis?.total_profit) || 0).toFixed(2)}\n` +
         `Net Profit: ₦${((Number(profitAnalysis?.total_profit) || 0) - (Number((reportData as any)?.total_expenses) || 0)).toFixed(2)}\n` +
         `Total Expenses: ₦${(Number((reportData as any).total_expenses) || 0).toFixed(2)}\n` +
         `Outstanding Debts: ₦${(Number((reportData as any).outstanding_debts) || 0).toFixed(2)}`;
      await navigator.clipboard.writeText(summary);
      toast({ title: "Copied!", description: "Report summary copied to clipboard." });
    }
  };

  if (loadingReports) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-10 w-10 text-emerald-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-emerald-700 font-semibold text-lg">
              Loading Reports...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-sm xs-reduce-header-padding xs-reduce-padding">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">
              Business Reports
            </h1>
            <p className="text-sm text-slate-500">{getPeriodDescription()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShareReport}>
              <Share className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleDownloadReport}>
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 xs-reduce-padding">
        {/* Period and Report Type Selectors */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex-1">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Today (Daily)</span>
                  </div>
                </SelectItem>
                <SelectItem value="week">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>This Week (Last 7 Days)</span>
                  </div>
                </SelectItem>
                <SelectItem value="month">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    <span>This Month</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Summary
                  </div>
                </SelectItem>
                <SelectItem value="detailed">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Detailed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Helper text for period selection */}
        <div className="text-xs text-slate-500 mt-1">
          <span>
            {period === "today" && "Metrics and activities for today only."}
            {period === "week" && "Metrics and activities for the last 7 days including today."}
            {period === "month" && "Metrics and activities for the current month."}
          </span>
        </div>



        {/* Summary/metrics and performance sections only in summary mode */}
        {reportType === "summary" && reportData && (
          <>
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                {getPeriodLabel()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-emerald-100 text-sm">Total Sales</p>
                    <p className="text-2xl font-bold">₦{reportData.total_sales?.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-emerald-100 text-sm">Profit</p>
                    <p className={`text-2xl font-bold ${profitAnalysis?.total_profit >= 0 ? 'text-white' : 'text-red-200'}`}>₦{profitAnalysis?.total_profit?.toLocaleString() ?? 0}</p>
                  </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">
                    {reportData.summary?.find(s => s.activity_type === 'sale')?.count || 0} sales
                </span>
                <span className="text-emerald-100">
                    {reportData.summary?.find(s => s.activity_type === 'expense')?.count || 0} expenses
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Sales</h3>
                <p className="text-2xl font-bold text-emerald-600">
                    ₦{reportData.total_sales?.toLocaleString()}
                </p>
                  <p className="text-sm text-slate-500">{reportData.summary?.find(s => s.activity_type === 'sale')?.count || 0} sales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Gross Profit</h3>
                <p className="text-2xl font-bold text-blue-600">
                    ₦{(Number(profitAnalysis?.total_profit) || 0).toFixed(2)}
                </p>
                  <p className="text-sm text-slate-500">Gross Profit: Sales - Wholesale Cost</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Expenses</h3>
                <p className="text-2xl font-bold text-red-600">
                    ₦{(Number(reportData.total_expenses) || 0).toFixed(2)}
                </p>
                  <p className="text-sm text-slate-500">Total Expenses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${(Number(profitAnalysis?.total_profit) || 0) - (Number(reportData?.total_expenses) || 0) >= 0 ? 'bg-green-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <BarChart3 className={`w-6 h-6 ${(Number(profitAnalysis?.total_profit) || 0) - (Number(reportData?.total_expenses) || 0) >= 0 ? 'text-green-600' : 'text-orange-600'}`} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">Net Profit</h3>
                                  <p className={`text-2xl font-bold ${(Number(profitAnalysis?.total_profit) || 0) - (Number(reportData?.total_expenses) || 0) >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    ₦{((Number(profitAnalysis?.total_profit) || 0) - (Number(reportData?.total_expenses) || 0)).toFixed(2)}
                </p>
                  <p className="text-sm text-slate-500">Net Profit: Gross Profit - Expenses</p>
              </CardContent>
            </Card>
          </div>
            <ReportChart sales={reportData.total_sales} expenses={reportData.total_expenses} period={period} trendData={trendData} />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                      ₦{(Number(reportData.total_sales) || 0).toFixed(2)}
                  </p>
                    <p className="text-sm text-slate-500">Total Sales</p>
                </div>
                <div>
                     <p className="text-2xl font-bold text-red-600">
                       ₦{(Number(reportData.total_expenses) || 0).toFixed(2)}
                     </p>
                    <p className="text-sm text-slate-500">Total Expenses</p>
                  </div>
                  <div>
                     <p className="text-2xl font-bold text-green-600">
                       ₦{(Number(profitAnalysis?.total_profit) || 0).toFixed(2)}
                   </p>
                    <p className="text-sm text-slate-500">Profit</p>
                  </div>
                  <div>
                     <p className="text-2xl font-bold text-orange-600">
                       ₦{(Number(reportData.outstanding_debts) || 0).toFixed(2)}
                   </p>
                  <p className="text-sm text-slate-500">Outstanding Debts</p>
                </div>
              </div>
            </CardContent>
          </Card>
            <RecentActivityList activities={activities.slice(0, 4)} />

            {/* Customer Debts Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Debts Overview
                </CardTitle>
                <CardDescription>Monitor outstanding customer debts and repayment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Filter */}
                <div className="flex flex-col gap-3">
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {customerSummaries.map((c) => (
                        <SelectItem key={String(c.customer_id)} value={String(c.customer_id ?? '')}>
                          {c.customer_name || 'Unnamed'} (₦{Number(c.outstanding).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 xs-single-col">
                  <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-orange-100 text-sm">Total Outstanding</p>
                        <p className="text-2xl font-bold">
                          ₦{customerSummaries
                            .filter(s => selectedCustomer === 'all' || String(s.customer_id ?? '') === selectedCustomer)
                            .reduce((sum, s) => sum + Number(s.outstanding), 0)
                            .toLocaleString()}
                        </p>
                        <p className="text-orange-100 text-xs">
                          {customerSummaries
                            .filter(s => selectedCustomer === 'all' || String(s.customer_id ?? '') === selectedCustomer)
                            .filter(s => Number(s.outstanding) > 0).length} customers
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="text-emerald-100 text-sm">Total Repaid</p>
                        <p className="text-2xl font-bold">
                          ₦{customerSummaries
                            .filter(s => selectedCustomer === 'all' || String(s.customer_id ?? '') === selectedCustomer)
                            .reduce((sum, s) => sum + Number(s.total_repaid), 0)
                            .toLocaleString()}
                        </p>
                        <p className="text-emerald-100 text-xs">
                          Repayment progress
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Debts Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="py-3 font-medium text-slate-700">Customer</th>
                        <th className="py-3 font-medium text-slate-700">Total Debt</th>
                        <th className="py-3 font-medium text-slate-700">Repaid</th>
                        <th className="py-3 font-medium text-slate-700">Outstanding</th>
                        <th className="py-3 font-medium text-slate-700">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerSummaries
                        .filter(s => selectedCustomer === 'all' || String(s.customer_id ?? '') === selectedCustomer)
                        .map((s, idx) => (
                          <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-medium text-slate-800">{s.customer_name || 'Unnamed'}</td>
                            <td className="py-3 text-slate-600">₦{Number(s.total_debt).toFixed(2)}</td>
                            <td className="py-3 text-emerald-600 font-medium">₦{Number(s.total_repaid).toFixed(2)}</td>
                            <td className="py-3 text-red-600 font-semibold">₦{Number(s.outstanding).toFixed(2)}</td>
                            <td className="py-3 text-slate-600 text-sm">{new Date(s.last_activity).toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* No Data State */}
                {customerSummaries.filter(s => selectedCustomer === 'all' || String(s.customer_id ?? '') === selectedCustomer).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No customer debt data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        {/* Activity Log only in detailed mode */}
        {reportType === "detailed" && activities.length > 0 && (
          <ActivityLog activities={activities} period={period} />
        )}
        {/* Export Options always shown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export & Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 flex items-center gap-2"
                onClick={handleDownloadReport}
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button variant="outline" className="h-12 flex items-center gap-2" onClick={handleShareReport}>
                <Share className="w-4 h-4" />
                Share Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
