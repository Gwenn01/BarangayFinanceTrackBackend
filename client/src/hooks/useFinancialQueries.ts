import { useQuery } from "@tanstack/react-query";
import {
  backendCollectionToFrontend,
  backendDisbursementToFrontend,
  backendBudgetEntryToFrontend,
} from "../utils/converters";
import { API_BASE_URL } from "@/utils/api";

import type { Collection, Disbursement, BudgetEntry, DfurProject, Comment, DfurApiResponse } from "../types";

/* -------------------- TYPES -------------------- */

export type BackendBudgetEntry = {
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

/* -------------------- RAW FETCHERS -------------------- */
// These can also be imported and used standalone (e.g. in prefetchQuery or server-side calls)

export const fetchCollections = async (): Promise<Collection[]> => {
  const response = await fetch(`${API_BASE_URL}/get-collection`);
  if (!response.ok) throw new Error("Failed to fetch collections");
  const data = await response.json();
  const backendData = data.data || data || [];
  if (Array.isArray(backendData)) return backendData.map(backendCollectionToFrontend);
  return [];
};

export const fetchDisbursements = async (): Promise<Disbursement[]> => {
  const response = await fetch(`${API_BASE_URL}/get-disbursement`);
  if (!response.ok) throw new Error("Failed to fetch disbursements");
  const data = await response.json();
  const backendData = data.data || data || [];
  if (Array.isArray(backendData)) return backendData.map(backendDisbursementToFrontend);
  return [];
};

export const fetchDfurProjects = async (): Promise<DfurProject[]> => {
  const response = await fetch(`${API_BASE_URL}/get-dfur-project`);
  if (!response.ok) throw new Error("Failed to fetch DFUR projects");
  const data: DfurApiResponse = await response.json();
  return data.data || [];
};

export const fetchBudgetEntries = async (year?: number): Promise<BackendBudgetEntry[]> => {
  const targetYear = year ?? new Date().getFullYear();
  const response = await fetch(`${API_BASE_URL}/get-budget-entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year: targetYear }),
  });
  if (!response.ok) throw new Error("Failed to fetch budget entries");
  const data = await response.json();
  const backendData = data.data || data || [];
  if (Array.isArray(backendData)) return backendData;
  return [];
};

/* -------------------- SORT HELPER -------------------- */

const sortByDateDesc = <T extends { transaction_date?: string; created_at?: string }>(
  data: T[]
): T[] =>
  [...data].sort((a, b) => {
    const getTime = (item: typeof a) =>
      item.transaction_date
        ? new Date(item.transaction_date).getTime()
        : item.created_at
        ? new Date(item.created_at).getTime()
        : Date.now();
    return getTime(b) - getTime(a);
  });

/* -------------------- CUSTOM HOOKS -------------------- */

export const useCollections = () =>
  useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    select: sortByDateDesc,
  });

export const useDisbursements = () =>
  useQuery<Disbursement[]>({
    queryKey: ["disbursements"],
    queryFn: fetchDisbursements,
    select: sortByDateDesc,
  });

export const useDfurProjects = () =>
  useQuery<DfurProject[]>({
    queryKey: ["dfurProjects"],
    queryFn: fetchDfurProjects,
  });

export const useBudgetEntries = (year?: number) => {
  const targetYear = year ?? new Date().getFullYear();
  return useQuery<BackendBudgetEntry[]>({
    queryKey: ["budget-entries", targetYear],  // year is part of the key so each year is cached separately
    queryFn: () => fetchBudgetEntries(targetYear),
  });
};