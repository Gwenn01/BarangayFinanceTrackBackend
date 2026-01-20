// ABR (Annual Budget Report) - Capital Outlay Category Normalization
// This ensures consistent mapping between ABO (budget entries) and SRE (disbursements)

export const CAPITAL_OUTLAY_CATEGORIES = {
  // Economic Services
  "Infrastructure": "Infrastructure",
  "Roads and Bridges": "Infrastructure",
  "Public Works": "Infrastructure",
  
  // Social Services
  "Health": "Health",
  "Health Facilities": "Health",
  "Medical Equipment": "Health",
  
  "Education": "Education",
  "School Buildings": "Education",
  "Educational Facilities": "Education",
  
  // General Public Services
  "Government Buildings": "Government Buildings",
  "Office Equipment": "Government Buildings",
  "Furniture and Fixtures": "Government Buildings",
  
  // Peace and Order
  "Peace and Order": "Peace and Order",
  "Security Equipment": "Peace and Order",
  
  // Other Categories
  "Agriculture": "Agriculture",
  "Agricultural Equipment": "Agriculture",
  
  "Social Welfare": "Social Welfare",
  "Community Facilities": "Social Welfare",
} as const;

export type CapitalOutlayCategory = typeof CAPITAL_OUTLAY_CATEGORIES[keyof typeof CAPITAL_OUTLAY_CATEGORIES];

// Normalize category name to standard Capital Outlay category
export function normalizeCapitalOutlayCategory(category: string): string {
  return CAPITAL_OUTLAY_CATEGORIES[category as keyof typeof CAPITAL_OUTLAY_CATEGORIES] || category;
}

// Check if a category is a Capital Outlay category
export function isCapitalOutlayCategory(category: string): boolean {
  const normalized = normalizeCapitalOutlayCategory(category);
  return Object.values(CAPITAL_OUTLAY_CATEGORIES).includes(normalized as any);
}

export interface CapitalOutlaySummaryItem {
  label: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

export interface CapitalOutlaySummary {
  year: number;
  items: CapitalOutlaySummaryItem[];
  totals: {
    planned: number;
    actual: number;
    variance: number;
    variancePercentage: number;
  };
}
