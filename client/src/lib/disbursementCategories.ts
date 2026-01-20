// Disbursement Categories and Nature of Disbursement Options

export const DISBURSEMENT_CATEGORIES = {
  "A. Personal Services": {
    label: "A. Personal Services",
    subcategories: {
      "Personal Services": [
        "Honoraria",
        "Cash gift",
        "Mid year bonus",
        "Year end bonus",
        "Productivity Enhancement Incentive (PEI)",
        "Annual leave benefits",
      ],
    },
  },
  "B. Maintenance and Other Operating Expenses (MOOE)": {
    label: "B. Maintenance and Other Operating Expenses (MOOE)",
    subcategories: {
      "Operating Expenses": [
        "Traveling Expenses",
        "Training Expenses",
        "Office Supplies Expenses",
        "Accountable Forms Expenses",
        "Electricity Expenses",
        "Auditing Services",
        "Bookkeeping Services",
        "Fuel, Oil, and Lubricants",
        "Other supplies and materials expenses",
        "Drugs and Medicines expenses",
        "Uniforms and Clothing Expenses",
        "Representation Expense",
        "Fidelity Bond Premiums",
        "Repairs and Maintenance- Building and Other Structures Maintenance and Repair Expenses",
        "Transportation Equipment",
        "Other Professional Services",
        "Other Personal services",
        "Other General Services",
        "Janitorial Services",
        "Waste Segregation Management",
        "Insurance Premium",
        "Discretionary Fund",
        "Membership Dues and Contributions to Organizations",
        "Donations",
        "Other MOOE",
      ],
    },
  },
  "C. Capital Outlay": {
    label: "C. Capital Outlay",
    subcategories: {
      "Capital Expenditures": [
        "Land Improvements",
        "Infrastructure Assets- Buildings and Other Structures",
        "Machinery and Equipment",
        "Transportation Equipment",
        "Furniture, Fixtures and Books",
        "Other P.P.E",
      ],
    },
  },
  "D. Special Purpose Appropriations (SPA)": {
    label: "D. Special Purpose Appropriations (SPA)",
    subcategories: {
      "Special Appropriations": [
        "Appropriation for SK",
        "Other Authorized SPAs",
      ],
    },
  },
  "E. Basic Services and Facilities Program - SOCIAL SERVICES": {
    label: "E. Basic Services and Facilities Program - SOCIAL SERVICES",
    subcategories: {
      "Day Care Services": [
        "Subsidy to Day Care Worker",
      ],
      "Health and Nutrition Services": [
        "Subsidy to BHWs and Brgy, Nutrition Scholars",
      ],
      "Peace and Order Services": [
        "Subsidy to BPATS",
      ],
      "Katarungang Pambarangay Services": [
        "Subsidy to Lupon Members",
      ],
    },
  },
  "F. Infrastructure Projects - 20% Development Fund - ECONOMIC SERVICES": {
    label: "F. Infrastructure Projects - 20% Development Fund - ECONOMIC SERVICES",
    subcategories: {
      "Infrastructure Development": [
        "Rehabilitation/Repair of Barangay Jail",
        "Construction Extension shed of Brgy. Covered Court",
        "Construction/Extension of Barangay Shed or Hall",
        "Construction of Kitchen & Stock Room",
        "Improvement of Rooftop",
        "Construction of Welcome Signage",
        "Construction of Canals",
        "Installation of CCTV Cameras",
        "Repair of Barangay Hall, Covered Court, & Fence",
        "Fabrication & Repair of Signages",
      ],
    },
  },
  "G. Other Services": {
    label: "G. Other Services",
    subcategories: {
      "Quick Response Fund (QRF) Activities": [
        "Purchase of food commodities",
        "Disaster Preparedness, Prevention and Mitigation Response Rehabilitation and Recovery",
        "Purchased of expandable items (Handheld Radio, flashlights, Stretcher, Portable spotlight, Megaphone, Ladder, First Aid Kit, Whistle, Helmet, Raincoats, Rainboots)",
        "Declogging and Dredging of Canals",
        "Tree and Bushes pruning",
        "Conducting fire and Earthquake Drill",
      ],
      "Other Community Services": [
        "Senior Citizen/PWDs Services",
        "BCPC",
        "Others",
      ],
    },
  },
};

export const DISBURSEMENT_FUND_SOURCES = [
  "General Fund",
  "5% DRRMF",
  "Trust Fund",
  "20% Development Fund",
];

export function getAllDisbursementNatureOptions() {
  const options: { category: string; subcategory: string; nature: string }[] = [];
  
  Object.entries(DISBURSEMENT_CATEGORIES).forEach(([categoryKey, categoryData]) => {
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
