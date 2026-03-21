// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://barangayfinancetrackbackenddeployment.onrender.com/api";

export const api = {
  auth: {
    login: `${API_BASE_URL}/login`,
  },
  users: {
    getAll: `${API_BASE_URL}/get-all-users`,
    add: `${API_BASE_URL}/add-user`,
    edit: `${API_BASE_URL}/edit-user`,
    delete: `${API_BASE_URL}/delete-user`,
  },
  budgetEntries: {
    getAll: `${API_BASE_URL}/get-budget-entries`,
    create: `${API_BASE_URL}/post-budget-entries`,
    update: `${API_BASE_URL}/put-budget-entries`,
    delete: `${API_BASE_URL}/delete-budget-entries`,
    generateId: `${API_BASE_URL}/budget-entries/generate_id`,
  },
  collections: {
    getAll: `${API_BASE_URL}/get-collection`,
    create: `${API_BASE_URL}/insert-collection`,
    update: `${API_BASE_URL}/put-collection`,
    delete: `${API_BASE_URL}/delete-collection`,
    generateId: `${API_BASE_URL}/collection/generate_id`,
  },
  disbursements: {
    getAll: `${API_BASE_URL}/get-disbursement`,
    create: `${API_BASE_URL}/insert-disbursement`,
    update: `${API_BASE_URL}/put-disbursement`,
    delete: `${API_BASE_URL}/delete-disbursement`,
    generateId: `${API_BASE_URL}/disbursement/generate_id`,
  },
  dfurProject: {
    create: `${API_BASE_URL}/insert-dfur-project`,
    getAll: `${API_BASE_URL}/get-dfur-project`,
    update: `${API_BASE_URL}/update-dfur-project`,
    delete: `${API_BASE_URL}/delete-dfur-project`,
    generateId: `${API_BASE_URL}/dfur/generate_id`,
    getTotalData: `${API_BASE_URL}/get-total-data-dfur-project`,
  }

};

// Generic API call function with error handling
export async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || data.message || "An error occurred" };
    }

    return { data };
  } catch (error) {
    console.error("API call failed:", error);
    return { error: "Unable to connect to the server. Please try again." };
  }
}

import type {
  Collection,
  Disbursement,
  BudgetEntry,
  DfurProject,
  DfurApiResponse,
  Comment,
  BackendCollection,
  BackendDisbursement,
  BackendBudgetEntry,
} from "../types";
import {
  backendCollectionToFrontend,
  backendDisbursementToFrontend,
  backendBudgetEntryToFrontend,
} from "../utils/converters";


export const fetchCollections = async (): Promise<Collection[]> => {
  const response = await fetch(`${API_BASE_URL}/get-collection`);
  if (!response.ok) throw new Error("Failed to fetch collections");
  const data = await response.json();
  const backendData: BackendCollection[] = data.data || data || [];
  if (Array.isArray(backendData)) return backendData.map(backendCollectionToFrontend);
  return [];
};

export const fetchDisbursements = async (): Promise<Disbursement[]> => {
  const response = await fetch(`${API_BASE_URL}/get-disbursement`);
  if (!response.ok) throw new Error("Failed to fetch disbursements");
  const data = await response.json();
  const backendData: BackendDisbursement[] = data.data || data || [];
  if (Array.isArray(backendData)) return backendData.map(backendDisbursementToFrontend);
  return [];
};

export const fetchBudgetEntries = async (): Promise<BudgetEntry[]> => {
  const currentYear = new Date().getFullYear();
  const response = await fetch(`${API_BASE_URL}/get-budget-entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year: currentYear }),
  });
  if (!response.ok) throw new Error("Failed to fetch ABO budget entries");
  const data = await response.json();
  const backendData: BackendBudgetEntry[] = data.data || data || [];
  if (Array.isArray(backendData)) return backendData.map(backendBudgetEntryToFrontend);
  return [];
};

export const fetchDfurProjects = async (): Promise<DfurProject[]> => {
  const response = await fetch(`${API_BASE_URL}/get-dfur-project`);
  if (!response.ok) throw new Error("Failed to fetch DFUR projects");
  const data: DfurApiResponse = await response.json();
  return data.data || [];
};

export const fetchComments = async (): Promise<Comment[]> => {
  const response = await fetch(`${API_BASE_URL}/get-all-comments`);
  if (!response.ok) throw new Error("Failed to fetch comments");
  const data: Comment[] = await response.json();
  if (!Array.isArray(data)) return [];
  return data.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
};

export const submitComment = async (payload: {
  name: string;
  email: string;
  comment: string;
}): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/insert-comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to submit comment");
};