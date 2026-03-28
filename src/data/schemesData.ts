export interface Scheme {
  id: string;
  scheme_name: string;
  scheme_slug: string;
  ministry: string;
  department: string;
  description: string;
  benefits: string;
  eligibility: string;
  application_process: string;
  documents_required: string[];
  scheme_type: string;
  target_beneficiaries: string;
  state: string;
  website_url: string;
  tags: string[];
}

// Sample schemes data from the attachment
export const schemesData: Scheme[] = [
  {
    id: "410",
    scheme_name: "Lease Rental Rebate Scheme for Goan Diaspora",
    scheme_slug: "LRSGD",
    ministry: "Department of Information Technology",
    department: "Government of Goa",
    description: "Launched in 2018, the Lease Rental Rebate Scheme for Goan Diaspora provides Lease Rental Rebate for Goan Diaspora. A 100% reimbursement of lease rentals is provided for the first 6 months of operations.",
    benefits: "100% reimbursement of lease rentals for first 6 months; ₹35 per sq.ft. or 80% of total lease rentals for up to 2 years",
    eligibility: "New/Existing IT Unit with operations in Goa; Minimum 60% Goan employees; Operational for at least 1 year",
    application_process: "Online via Goa Online portal. Timeline: D+90 days from application receipt",
    documents_required: ["Incorporation Certificate", "PAN/Aadhaar/GST TIN", "Lease deed", "Employee details", "Udyog Aadhaar"],
    scheme_type: "Business & Entrepreneurship",
    target_beneficiaries: "IT Units in Goa",
    state: "Goa",
    website_url: "https://goaonline.gov.in/",
    tags: ["Lease", "Reimbursement", "Rent", "Company", "Business", "IT"]
  },
  {
    id: "411",
    scheme_name: "Land/Built-Up Area Rebate Scheme",
    scheme_slug: "LBUARS",
    ministry: "Department of Information Technology",
    department: "Government of Goa",
    description: "Provides Land/Built-up Area Rebate to IT Industry in Goa. A one-time rebate for purchase of land or built-up office space.",
    benefits: "₹40,000-₹50,000 per employee for land; up to 20% for built-up space; Maximum ₹1,50,00,000 for land, ₹1,00,00,000 for built-up",
    eligibility: "All New and Existing IT Units; Operations in Goa; Minimum 12 months employment requirement",
    application_process: "Online via Goa Online portal. Three tranches of disbursement over time",
    documents_required: ["Sale deed", "Business plan", "Nil encumbrance certificate", "Bank guarantee", "Employee details"],
    scheme_type: "Business & Entrepreneurship",
    target_beneficiaries: "IT Companies in Goa",
    state: "Goa",
    website_url: "https://goaonline.gov.in/",
    tags: ["Land", "Rebate", "Employee", "Office", "Business"]
  },
  {
    id: "412",
    scheme_name: "Mukhyamantri Alpasankhyak Udyami Yojana",
    scheme_slug: "MAUYB",
    ministry: "Department of Industries",
    department: "Government of Bihar",
    description: "Promotes entrepreneurship among minority communities in Bihar. Financial assistance up to ₹10,00,000 for establishing business ventures.",
    benefits: "50% non-repayable grant up to ₹5,00,000 + 50% interest-free loan up to ₹5,00,000; Mandatory skill training",
    eligibility: "Permanent residents of Bihar; Minority communities; Age 18-50 years; 10+2 or equivalent education",
    application_process: "Online via MMUY portal. Quarterly/bi-annually/annual basis",
    documents_required: ["Matriculation certificate", "Intermediate certificate", "Caste certificate", "Permanent residence certificate", "Photograph", "Signature"],
    scheme_type: "Business & Entrepreneurship",
    target_beneficiaries: "Minority Communities in Bihar",
    state: "Bihar",
    website_url: "https://udyami.bihar.gov.in/",
    tags: ["Entrepreneurship", "Self Employment", "Youth", "Business", "Minority"]
  },
  {
    id: "413",
    scheme_name: "Laghu Vyavassay Scheme",
    scheme_slug: "LVSH",
    ministry: "Department of Social Welfare",
    department: "Government of Haryana",
    description: "Provides loans to Scheduled Castes for self-employment and income-generating activities in Haryana.",
    benefits: "Loan up to ₹2,00,000; Margin money 10% of project cost; Subsidy up to ₹10,000 (50% of total cost)",
    eligibility: "Permanent resident of Haryana; Scheduled Caste; Age 18-45 years; Annual family income ₹1,50,000-₹3,00,000",
    application_process: "Online via SARAL portal or offline at Antyodaya/SARAL Kendras and CSC centres",
    documents_required: ["Aadhaar Card", "Ration Card", "Caste Certificate"],
    scheme_type: "Business & Entrepreneurship",
    target_beneficiaries: "Scheduled Castes in Haryana",
    state: "Haryana",
    website_url: "https://saralharyana.gov.in/",
    tags: ["Entrepreneurship", "Subsidy", "Scheduled Caste", "Employment", "Loan"]
  },
  {
    id: "414",
    scheme_name: "Marketing Assistance Scheme",
    scheme_slug: "MAS",
    ministry: "Department of Social Welfare",
    department: "Government of Karnataka",
    description: "Empowers SC leather artisans by marketing products through Lidkar Leather Emporia brand. Provides regular procurement assistance.",
    benefits: "Financial assistance ₹50,000-₹1,00,000 worth of product procurement; Regular purchases every 1-2 months; Branding support",
    eligibility: "Leather artisans from specified SC sub-castes; Age 18+; Annual family income ₹30,000 (rural)/₹25,000 (urban)",
    application_process: "Online via Seva Sindhu Portal after DigiLocker verification",
    documents_required: ["Aadhaar Card", "Caste Certificate with RD number", "Income Certificate", "Ration Card", "Photograph", "Bank Passbook"],
    scheme_type: "Skills & Employment",
    target_beneficiaries: "SC Leather Artisans in Karnataka",
    state: "Karnataka",
    website_url: "https://sevasindhu.karnataka.gov.in/",
    tags: ["Financial Assistance", "Artisans", "Marketing", "Skills", "Leather"]
  },
];

export const getUniqueMistries = (schemes: Scheme[]): string[] => {
  const ministries = new Set(schemes.map(s => s.ministry).filter(Boolean));
  return Array.from(ministries).sort();
};

export const getUniqueStates = (schemes: Scheme[]): string[] => {
  const states = new Set(schemes.map(s => s.state).filter(Boolean));
  return Array.from(states).sort();
};

export const getUniqueSchemeTypes = (schemes: Scheme[]): string[] => {
  const types = new Set(schemes.map(s => s.scheme_type).filter(Boolean));
  return Array.from(types).sort();
};

export const filterSchemes = (
  schemes: Scheme[],
  ministry?: string,
  state?: string,
  schemeType?: string,
  targetBeneficiary?: string,
  searchTerm?: string
): Scheme[] => {
  return schemes.filter(scheme => {
    if (ministry && scheme.ministry !== ministry) return false;
    if (state && scheme.state !== state) return false;
    if (schemeType && scheme.scheme_type !== schemeType) return false;
    if (targetBeneficiary && !scheme.target_beneficiaries.toLowerCase().includes(targetBeneficiary.toLowerCase())) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return scheme.scheme_name.toLowerCase().includes(term) ||
        scheme.description.toLowerCase().includes(term) ||
        scheme.tags.some(tag => tag.toLowerCase().includes(term));
    }
    return true;
  });
};
