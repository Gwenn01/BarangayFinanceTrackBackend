import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Wallet,
  TrendingDown,
  Target,
  ArrowRight,
  Activity,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { EncoderLayout } from "../../components/encoder-layout";
import {
  backendCollectionToFrontend,
  backendDisbursementToFrontend,
  Collection,
  DfurApiResponse,
  DfurProject,
  Disbursement,
} from "../viewer/dashboard";
import { API_BASE_URL } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

/* -------------------- TYPES -------------------- */

type BackendBudgetEntry = {
  id: string;
  transaction_id: string;
  transaction_date: string;
  category: string;
  subcategory: string;
  payee: string;
  dv_number: string;
  amount: number;
  fund_source: string;
  expenditure_program: string;
  program_description?: string;
  remarks?: string;
  allocation_id: number;
  created_by: number;
};

/* -------------------- CONSTANTS -------------------- */

const encoderModules = [
  {
    id: "abo",
    title: "Annual Budget Ordinance",
    abbreviation: "ABO",
    description: "Encode annual budget ordinance and appropriations",
    icon: DollarSign,
    url: "/encoder/abo",
    color: "from-chart-1/10 to-chart-1/20",
    iconColor: "text-chart-1",
  },
  {
    id: "sre",
    title: "Statement of Receipts and Expenditures",
    abbreviation: "SRE",
    description: "Encode receipts and expenditure records",
    icon: FileText,
    url: "/encoder/sre",
    color: "from-chart-2/10 to-chart-2/20",
    iconColor: "text-chart-2",
  },
  {
    id: "dfur",
    title: "Development Fund Utilization Report",
    abbreviation: "DFUR",
    description: "Encode development fund utilization data",
    icon: TrendingUp,
    url: "/encoder/dfur",
    color: "from-chart-3/10 to-chart-3/20",
    iconColor: "text-chart-3",
  },
];

/* -------------------- HELPERS -------------------- */

const safeParseAmount = (value: unknown): number => {
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/* -------------------- COMPONENT -------------------- */

export default function EncoderDashboard() {
  const [, navigate] = useLocation();

  // --- Fetch Collections ---
  const fetchCollections = async (): Promise<Collection[]> => {
    const response = await fetch(`${API_BASE_URL}/get-collection`);
    if (!response.ok) throw new Error("Failed to fetch collections");
    const data = await response.json();
    const backendData = data.data || data || [];
    if (Array.isArray(backendData)) return backendData.map(backendCollectionToFrontend);
    return [];
  };

  // --- Fetch Disbursements ---
  const fetchDisbursements = async (): Promise<Disbursement[]> => {
    const response = await fetch(`${API_BASE_URL}/get-disbursement`);
    if (!response.ok) throw new Error("Failed to fetch disbursements");
    const data = await response.json();
    const backendData = data.data || data || [];
    if (Array.isArray(backendData)) return backendData.map(backendDisbursementToFrontend);
    return [];
  };

  // --- Fetch DFUR Projects ---
  const fetchDfurProjects = async (): Promise<DfurProject[]> => {
    const response = await fetch(`${API_BASE_URL}/get-dfur-project`);
    if (!response.ok) throw new Error("Failed to fetch DFUR projects");
    const data: DfurApiResponse = await response.json();
    return data.data || [];
  };

  // --- Fetch ABO Budget Entries ---
  const fetchBudgetEntries = async (): Promise<BackendBudgetEntry[]> => {
    const currentYear = new Date().getFullYear();
    const response = await fetch(`${API_BASE_URL}/get-budget-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: currentYear }),
    });
    if (!response.ok) throw new Error("Failed to fetch budget entries");
    const data = await response.json();
    const backendData = data.data || data || [];
    if (Array.isArray(backendData)) return backendData;
    return [];
  };

  const { data: collections, isLoading: isLoadingCollections } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    select: (data) =>
      [...data].sort((a, b) => {
        const dateA = a.transaction_date
          ? new Date(a.transaction_date).getTime()
          : a.created_at
          ? new Date(a.created_at).getTime()
          : Date.now();
        const dateB = b.transaction_date
          ? new Date(b.transaction_date).getTime()
          : b.created_at
          ? new Date(b.created_at).getTime()
          : Date.now();
        return dateB - dateA;
      }),
  });

  const { data: disbursements, isLoading: isLoadingDisbursements } = useQuery<Disbursement[]>({
    queryKey: ["disbursements"],
    queryFn: fetchDisbursements,
    select: (data) =>
      [...data].sort((a, b) => {
        const dateA = a.transaction_date
          ? new Date(a.transaction_date).getTime()
          : a.created_at
          ? new Date(a.created_at).getTime()
          : Date.now();
        const dateB = b.transaction_date
          ? new Date(b.transaction_date).getTime()
          : b.created_at
          ? new Date(b.created_at).getTime()
          : Date.now();
        return dateB - dateA;
      }),
  });

  const { data: dfurProjects, isLoading: isLoadingDfurProjects } = useQuery<DfurProject[]>({
    queryKey: ["dfurProjects"],
    queryFn: fetchDfurProjects,
  });

  const { data: budgetEntries, isLoading: isLoadingBudgetEntries } = useQuery<BackendBudgetEntry[]>({
    queryKey: ["budget-entries"],
    queryFn: fetchBudgetEntries,
  });

  /* ---- Derived values ---- */
  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
    return `₱${value.toFixed(0)}`;
  };

  const totalCollections =
    collections?.reduce((sum, c) => sum + safeParseAmount(c.amount), 0) || 0;
  const totalDisbursements =
    disbursements?.reduce((sum, d) => sum + safeParseAmount(d.amount), 0) || 0;
  const totalABO =
    budgetEntries?.reduce((sum, e) => sum + safeParseAmount(e.amount), 0) || 0;
  const utilizationRate =
    totalCollections > 0
      ? ((totalDisbursements / totalCollections) * 100).toFixed(1)
      : "0";

  /* ---- Metric card definitions ---- */
  const metrics = [
    {
      icon: Wallet,
      value: formatCurrencyCompact(totalCollections),
      label: "Total Collections",
      sublabel: `${collections?.length || 0} transactions`,
      color: "blue",
      navigateTo: "/encoder/sre",
      isLoading: isLoadingCollections,
    },
    {
      icon: TrendingDown,
      value: formatCurrencyCompact(totalDisbursements),
      label: "Total Disbursements",
      sublabel: `${disbursements?.length || 0} transactions`,
      color: "amber",
      navigateTo: "/encoder/sre",
      isLoading: isLoadingDisbursements,
    },
    {
      icon: BookOpen,
      value: formatCurrencyCompact(totalABO),
      label: "Annual Budget Ordinance",
      sublabel: `${budgetEntries?.length || 0} entries · ${new Date().getFullYear()}`,
      color: "indigo",
      navigateTo: "/encoder/abo",
      isLoading: isLoadingBudgetEntries,
    },
    {
      icon: Target,
      value: `${dfurProjects?.length || 0}`,
      label: "Projects",
      sublabel: "Development fund projects",
      color: "violet",
      navigateTo: "/encoder/dfur",
      isLoading: isLoadingDfurProjects,
    },
  ];

  return (
    <EncoderLayout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-poppins">
              Encoder Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Select a module to begin encoding financial data
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full w-fit">
            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Live data</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const isClickable = !!metric.navigateTo;

            return (
              <div
                key={metric.label}
                className={`
                  relative group rounded-2xl p-4 sm:p-5 border bg-card overflow-hidden
                  transition-all duration-200
                  ${
                    isClickable
                      ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 active:scale-[0.98]"
                      : "cursor-default"
                  }
                `}
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => isClickable && navigate(metric.navigateTo!)}
                title={isClickable ? `Go to ${metric.navigateTo}` : undefined}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === "Enter" || e.key === " ")) {
                    navigate(metric.navigateTo!);
                  }
                }}
              >
                {/* Hover glow */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-${metric.color}-50/30`}
                />

                {/* Top row: icon + arrow */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-${metric.color}-100 shadow-sm`}
                  >
                    {metric.isLoading ? (
                      <div
                        className={`w-5 h-5 rounded-full border-2 border-${metric.color}-300 border-t-${metric.color}-600 animate-spin`}
                      />
                    ) : (
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${metric.color}-600`} />
                    )}
                  </div>
                  {isClickable && (
                    <ArrowRight
                      className={`w-4 h-4 text-muted-foreground/30 group-hover:text-${metric.color}-500 group-hover:translate-x-0.5 transition-all duration-200`}
                    />
                  )}
                </div>

                {/* Value */}
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 tabular-nums">
                  {metric.isLoading ? (
                    <div className="h-7 w-20 bg-muted animate-pulse rounded-md" />
                  ) : (
                    metric.value
                  )}
                </div>

                {/* Label */}
                <div className="text-xs sm:text-sm font-semibold text-foreground/80 uppercase tracking-wide leading-tight">
                  {metric.label}
                </div>

                {/* Sublabel */}
                <div className="text-xs text-muted-foreground mt-1">
                  {metric.isLoading ? (
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    metric.sublabel
                  )}
                </div>

                {/* Clickable hint */}
                {isClickable && (
                  <div className="mt-2 text-xs text-muted-foreground/40 group-hover:text-primary/60 transition-colors duration-200 flex items-center gap-1">
                    <span>View details</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Budget Utilization Bar */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Budget Utilization</span>
            </div>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {utilizationRate}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                parseFloat(utilizationRate) > 90
                  ? "bg-red-500"
                  : parseFloat(utilizationRate) > 70
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(parseFloat(utilizationRate), 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>₱0</span>
            <span>{formatCurrencyCompact(totalCollections)} total collected</span>
          </div>
        </div>

        {/* Encoding Modules */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3 font-poppins">
            Encoding Modules
          </h2>
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {encoderModules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.id} href={module.url}>
                  <Card
                    className={`group cursor-pointer border-2 border-card-border hover:border-primary/50 bg-gradient-to-br ${module.color} h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]`}
                    data-testid={`card-module-${module.id}`}
                  >
                    <CardHeader className="pb-2 md:pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="rounded-lg bg-background/80 p-2 md:p-2.5">
                          <Icon className={`h-5 w-5 md:h-6 md:w-6 ${module.iconColor}`} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                            {module.abbreviation}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all duration-200" />
                        </div>
                      </div>
                      <CardTitle className="font-poppins text-sm md:text-base leading-snug">
                        {module.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {module.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Role Notice */}
        <Card className="bg-muted/40 border-muted-foreground/15">
          <CardContent className="pt-4 md:pt-5 pb-4">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground/70">Encoder Role:</strong> You have permission to
              input and manage financial data entries. Please ensure all data is accurate and complete
              before submission. Your entries will be reviewed by the Checker before final approval.
            </p>
          </CardContent>
        </Card>
      </div>
    </EncoderLayout>
  );
}