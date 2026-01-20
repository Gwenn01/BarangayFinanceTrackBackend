// Collection Categories and Nature of Collection Options

export const COLLECTION_CATEGORIES = {
  "EXTERNAL SOURCES: TAX REVENUE": {
    label: "EXTERNAL SOURCES: TAX REVENUE",
    subcategories: {
      "Share from Local Taxes": [
        "Share from Real Property Tax",
        "Tax on Sand, Gravel & Other Quarry Resources",
        "Other Taxes (Community Tax / CTC)",
      ],
      "Share from National Taxes": [
        "Internal Revenue Allotment (IRA) / National Tax Allotment (NTA)",
        "Share from National Wealth",
        "Tobacco Excise Tax (RA 7171 / 8240)",
      ],
      "Assistance and Subsidy": [
        "Subsidy from LGUs",
        "Subsidy from National Government",
        "Subsidy from NGOs / Grants / Donations",
      ],
    },
  },
  "INTERNAL SOURCES: NON TAX REVENUE": {
    label: "INTERNAL SOURCES: NON TAX REVENUE",
    subcategories: {
      "Service and Business Income": [
        "Clearance and Certification Fees",
        "Barangay Clearance Fees",
        "Barangay Business Clearance",
        "Barangay Residency",
        "K.P. Filling fees",
        "Other Service Income",
      ],
    },
  },
  "NON-INCOME RECEIPTS": {
    label: "NON-INCOME RECEIPTS",
    subcategories: {
      "Other Receipts": [
        "Refunds / Reimbursements",
        "Sale of Property or Equipment",
        "Interest Income / Dividend",
        "Loans / Borrowings Proceeds",
        "Fund raising proceeds for specific/ temporary purpose",
      ],
    },
  },
};

export const FUND_SOURCES = ["General Fund", "Trust Fund"];

export function getAllNatureOptions() {
  const options: { category: string; subcategory: string; nature: string }[] = [];
  
  Object.entries(COLLECTION_CATEGORIES).forEach(([categoryKey, categoryData]) => {
    Object.entries(categoryData.subcategories).forEach(([subcategory, natures]) => {
      natures.forEach((nature) => {
        options.push({
          category: categoryKey,
          subcategory,
          nature,
        });
      });
    });
  });
  
  return options;
}
