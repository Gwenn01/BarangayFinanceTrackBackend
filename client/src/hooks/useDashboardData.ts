import { useQuery } from "@tanstack/react-query";
import {
  fetchCollections,
  fetchDisbursements,
  fetchBudgetEntries,
  fetchDfurProjects,
  fetchComments,
} from "../utils/api";
import { safeParseAmount } from "../utils/formatters";
import type { Collection, Disbursement, BudgetEntry, DfurProject, Comment } from "../types";

const sortByDate = <T extends { transaction_date: string | null }>(data: T[]): T[] =>
  [...data].sort((a, b) => {
    const dateA = a.transaction_date ? new Date(a.transaction_date).getTime() : Date.now();
    const dateB = b.transaction_date ? new Date(b.transaction_date).getTime() : Date.now();
    return dateB - dateA;
  });

export function useDashboardData() {
  const {
    data: collections,
    isLoading: isLoadingCollections,
  } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    select: sortByDate,
  });

  const {
    data: disbursements,
    isLoading: isLoadingDisbursements,
  } = useQuery<Disbursement[]>({
    queryKey: ["disbursements"],
    queryFn: fetchDisbursements,
    select: sortByDate,
  });

  const {
    data: budgetEntries,
    isLoading: isLoadingBudgetEntries,
  } = useQuery<BudgetEntry[]>({
    queryKey: ["budgetEntries"],
    queryFn: fetchBudgetEntries,
  });

  const {
    data: dfurProjects,
    isLoading: isLoadingDfurProjects,
  } = useQuery<DfurProject[]>({
    queryKey: ["dfurProjects"],
    queryFn: fetchDfurProjects,
  });

  const {
    data: comments,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useQuery<Comment[]>({
    queryKey: ["comments"],
    queryFn: fetchComments,
  });

  // ── Financial totals ────────────────────────
  const totalCollections =
    collections?.reduce((sum, c) => sum + safeParseAmount(c.amount), 0) || 0;
  const totalDisbursements =
    disbursements?.reduce((sum, d) => sum + safeParseAmount(d.amount), 0) || 0;
  const surplus = totalCollections - totalDisbursements;
  const totalABOBudget =
    budgetEntries?.reduce((sum, e) => sum + safeParseAmount(e.amount), 0) || 0;
  const totalApprovedCost = (dfurProjects || []).reduce(
    (sum, p) => sum + safeParseAmount(p.total_cost_approved),
    0
  );
  const totalIncurredCost = (dfurProjects || []).reduce(
    (sum, p) => sum + safeParseAmount(p.total_cost_incurred),
    0
  );
  const utilizationRate =
    totalCollections > 0
      ? ((totalDisbursements / totalCollections) * 100).toFixed(1)
      : "0";

  // ── Budget analysis: ABO vs SRE ────────────
  const aboByProgram = (budgetEntries || []).reduce<Record<string, number>>((acc, e) => {
    const key = e.expenditureProgram || e.category || "Other";
    acc[key] = (acc[key] || 0) + safeParseAmount(e.amount);
    return acc;
  }, {});

  const sreByCategory = (disbursements || []).reduce<Record<string, number>>((acc, d) => {
    const key = d.nature_of_disbursement || d.category || "Other";
    acc[key] = (acc[key] || 0) + safeParseAmount(d.amount);
    return acc;
  }, {});

  const allBudgetKeys = new Set([
    ...Object.keys(aboByProgram),
    ...Object.keys(sreByCategory),
  ]);

  const budgetAnalysisData = Array.from(allBudgetKeys)
    .map((key) => ({
      category: key.length > 25 ? key.substring(0, 25) + "…" : key,
      fullCategory: key,
      planned: aboByProgram[key] || 0,
      actual: sreByCategory[key] || 0,
      variance: (aboByProgram[key] || 0) - (sreByCategory[key] || 0),
    }))
    .sort((a, b) => b.planned - a.planned);

  // ── ABO breakdown table ─────────────────────
  const aboBreakdownData = Array.from(
    (budgetEntries || []).reduce(
      (acc, e) => {
        const key = e.expenditureProgram || e.category || "Other";
        const existing = acc.get(key) || { planned: 0, fundSource: e.fundSource };
        existing.planned += safeParseAmount(e.amount);
        acc.set(key, existing);
        return acc;
      },
      new Map<string, { planned: number; fundSource: string }>()
    )
  )
    .map(([key, val]) => {
      const actual = sreByCategory[key] || 0;
      const is20Percent = val.fundSource?.toLowerCase().includes("20%");
      return {
        category: key,
        planned: val.planned,
        actual,
        variance: val.planned - actual,
        fundSource: val.fundSource,
        is20Percent,
      };
    })
    .sort((a, b) => b.planned - a.planned);

  // ── Pie chart data ──────────────────────────
  const collectionsByCategory = collections?.reduce<Record<string, number>>((acc, c) => {
    const category = c.nature_of_collection || c.category || "Other";
    acc[category] = (acc[category] || 0) + safeParseAmount(c.amount);
    return acc;
  }, {});

  const disbursementsByCategory = disbursements?.reduce<Record<string, number>>((acc, d) => {
    const category = d.nature_of_disbursement || d.category || "Other";
    acc[category] = (acc[category] || 0) + safeParseAmount(d.amount);
    return acc;
  }, {});

  const collectionsPieData = Object.entries(collectionsByCategory || {})
    .map(([name, value]) => ({ name, value }))
    .slice(0, 5);

  const disbursementsPieData = Object.entries(disbursementsByCategory || {})
    .map(([name, value]) => ({ name, value }))
    .slice(0, 5);

  const dfurByStatus = (dfurProjects || []).reduce<Record<string, number>>((acc, p) => {
    const status =
      p.review_status === "approved"
        ? "Approved"
        : p.review_status === "flagged"
        ? "Flagged"
        : "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const dfurStatusPieData = Object.entries(dfurByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    // Raw data
    collections,
    disbursements,
    budgetEntries,
    dfurProjects,
    comments,
    // Loading states
    isLoadingCollections,
    isLoadingDisbursements,
    isLoadingBudgetEntries,
    isLoadingDfurProjects,
    isLoadingComments,
    // Actions
    refetchComments,
    // Derived financials
    totalCollections,
    totalDisbursements,
    surplus,
    totalABOBudget,
    totalApprovedCost,
    totalIncurredCost,
    utilizationRate,
    // Chart/table data
    budgetAnalysisData,
    aboBreakdownData,
    collectionsPieData,
    disbursementsPieData,
    dfurStatusPieData,
  };
}