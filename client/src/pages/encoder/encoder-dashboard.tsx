import { useLocation } from "wouter";
import { Card, CardContent } from "../../components/ui/card";
import {
  FileText, DollarSign, TrendingUp, Wallet, TrendingDown,
  Target, ArrowRight, Activity, BarChart3, BookOpen,
} from "lucide-react";
import { EncoderLayout } from "../../components/encoder-layout";
import {
  useCollections,
  useDisbursements,
  useDfurProjects,
  useBudgetEntries,
} from "@/hooks/useFinancialQueries";   // ← single import replaces all 4 fetchers

/* -------------------- HELPERS -------------------- */

const safeParseAmount = (value: unknown): number => {
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const formatCurrencyCompact = (value: number) => {
  if (value >= 1000000) return `₱${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
  return `₱${value.toFixed(0)}`;
};

/* -------------------- COMPONENT -------------------- */

export default function EncoderDashboard() {
  const [, navigate] = useLocation();

  // All data-fetching is now one line each
  const { data: collections,    isLoading: isLoadingCollections    } = useCollections();
  const { data: disbursements,  isLoading: isLoadingDisbursements  } = useDisbursements();
  const { data: dfurProjects,   isLoading: isLoadingDfurProjects   } = useDfurProjects();
  const { data: budgetEntries,  isLoading: isLoadingBudgetEntries  } = useBudgetEntries();

  /* ---- Derived values ---- */
  const totalCollections   = collections?.reduce((sum, c) => sum + safeParseAmount(c.amount), 0) || 0;
  const totalDisbursements = disbursements?.reduce((sum, d) => sum + safeParseAmount(d.amount), 0) || 0;
  const totalABO           = budgetEntries?.reduce((sum, e) => sum + safeParseAmount(e.amount), 0) || 0;
  const utilizationRate    = totalCollections > 0
    ? ((totalDisbursements / totalCollections) * 100).toFixed(1)
    : "0";

  /* ---- Metric card definitions ---- */
  const metrics = [
    {
      icon: Wallet,       value: formatCurrencyCompact(totalCollections),
      label: "Total Collections",       sublabel: `${collections?.length || 0} transactions`,
      color: "blue",    navigateTo: "/encoder/sre", isLoading: isLoadingCollections,
    },
    {
      icon: TrendingDown, value: formatCurrencyCompact(totalDisbursements),
      label: "Total Disbursements",     sublabel: `${disbursements?.length || 0} transactions`,
      color: "amber",   navigateTo: "/encoder/sre", isLoading: isLoadingDisbursements,
    },
    {
      icon: BookOpen,     value: formatCurrencyCompact(totalABO),
      label: "Annual Budget Ordinance", sublabel: `${budgetEntries?.length || 0} entries · ${new Date().getFullYear()}`,
      color: "indigo",  navigateTo: "/encoder/abo", isLoading: isLoadingBudgetEntries,
    },
    {
      icon: Target,       value: `${dfurProjects?.length || 0}`,
      label: "Projects",                sublabel: "Development fund projects",
      color: "violet",  navigateTo: "/encoder/dfur", isLoading: isLoadingDfurProjects,
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
            return (
              <div
                key={metric.label}
                className={`
                  relative group rounded-2xl p-4 sm:p-5 border bg-card overflow-hidden
                  transition-all duration-200 cursor-pointer
                  hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 active:scale-[0.98]
                `}
                style={{ animationDelay: `${index * 0.08}s` }}
                onClick={() => navigate(metric.navigateTo)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(metric.navigateTo); }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-${metric.color}-50/30`} />

                <div className="flex items-start justify-between mb-3">
                  <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-${metric.color}-100 shadow-sm`}>
                    {metric.isLoading
                      ? <div className={`w-5 h-5 rounded-full border-2 border-${metric.color}-300 border-t-${metric.color}-600 animate-spin`} />
                      : <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${metric.color}-600`} />
                    }
                  </div>
                  <ArrowRight className={`w-4 h-4 text-muted-foreground/30 group-hover:text-${metric.color}-500 group-hover:translate-x-0.5 transition-all duration-200`} />
                </div>

                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 tabular-nums">
                  {metric.isLoading ? <div className="h-7 w-20 bg-muted animate-pulse rounded-md" /> : metric.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/80 uppercase tracking-wide leading-tight">{metric.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metric.isLoading ? <div className="h-3 w-20 bg-muted animate-pulse rounded" /> : metric.sublabel}
                </div>
                <div className="mt-2 text-xs text-muted-foreground/40 group-hover:text-primary/60 transition-colors duration-200 flex items-center gap-1">
                  <span>View details</span><ArrowRight className="w-3 h-3" />
                </div>
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
            <span className="text-sm font-bold tabular-nums text-foreground">{utilizationRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                parseFloat(utilizationRate) > 90 ? "bg-red-500"
                : parseFloat(utilizationRate) > 70 ? "bg-amber-500"
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