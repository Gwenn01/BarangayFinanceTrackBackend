import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { FileText, TrendingUp, ShieldCheck, Wallet, TrendingDown, BookOpen, Target, ArrowRight, BarChart3, Flag } from "lucide-react";
import { ApproverLayout } from "../../components/approver-layout";
import { useBudgetEntries, useCollections, useDfurProjects, useDisbursements } from "@/hooks/useFinancialQueries";
import { formatCurrencyCompact, safeParseAmount } from "../encoder/encoder-dashboard";

export default function ApproverDashboard() {
  const modules = [
    {
      id: "sre",
      title: "Statement of Receipts & Expenditures",
      description: "Approve or reject collection and disbursement transactions",
      icon: FileText,
      href: "/approver/sre",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "dfur",
      title: "Development Fund Utilization Report",
      description: "Approve development fund utilization and allocations",
      icon: TrendingUp,
      href: "/approver/dfur",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

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

  /* ---- Flagged counts ---- */
  const collectionFlagged   = collections?.filter(item => item.is_flagged === true).length  || 0;
  const disbursementFlagged = disbursements?.filter(item => item.is_flagged === true).length || 0;
  const dfurFlagged         = dfurProjects?.filter(item => item.is_flagged === true).length  || 0;
  const totalFlagged        = collectionFlagged + disbursementFlagged + dfurFlagged;

  /* ---- Metric card definitions ---- */
  const metrics = [
    {
      icon: Wallet,       value: formatCurrencyCompact(totalCollections),
      label: "Total Collections",       sublabel: `${collections?.length || 0} transactions`,
      color: "blue",    navigateTo: "/approver/sre", isLoading: isLoadingCollections,
    },
    {
      icon: TrendingDown, value: formatCurrencyCompact(totalDisbursements),
      label: "Total Disbursements",     sublabel: `${disbursements?.length || 0} transactions`,
      color: "amber",   navigateTo: "/approver/sre", isLoading: isLoadingDisbursements,
    },
    {
      icon: Target,       value: `${dfurProjects?.length || 0}`,
      label: "Projects",                sublabel: "Development fund projects",
      color: "violet",  navigateTo: "/approver/dfur", isLoading: isLoadingDfurProjects,
    },
    {
      icon: Flag,         value: `${totalFlagged}`,
      label: "Flagged Items",
      sublabel: `${collectionFlagged} collections · ${disbursementFlagged} disbursements · ${dfurFlagged} DFUR`,
      color: "red",     navigateTo: "/approver/sre", isLoading: isLoadingCollections || isLoadingDisbursements || isLoadingDfurProjects,
    },
  ];

  return (
    <ApproverLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-poppins leading-tight">
            Approver Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Approve or reject financial transactions
          </p>
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
                  {/* Pulse badge for flagged card when there are flagged items */}
                  {metric.color === "red" && totalFlagged > 0 && !metric.isLoading ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                  ) : (
                    <ArrowRight className={`w-4 h-4 text-muted-foreground/30 group-hover:text-${metric.color}-500 group-hover:translate-x-0.5 transition-all duration-200`} />
                  )}
                </div>

                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-0.5 tabular-nums">
                  {metric.isLoading ? <div className="h-7 w-20 bg-muted animate-pulse rounded-md" /> : metric.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-foreground/80 uppercase tracking-wide leading-tight">{metric.label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
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

        {/* Info Banner */}
        <Card className="bg-muted/50 border-muted-foreground/20">
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
            <div className="flex gap-3 items-start">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Approver Role:</strong> Review all transactions carefully for accuracy and
                compliance. Approve transactions that are correct and complete. Reject transactions
                with errors or issues. Your approval is the final step before transactions are
                recorded.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ApproverLayout>
  );
}