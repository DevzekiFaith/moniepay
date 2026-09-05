// ─────────────────────────────────────────────
// Category Configuration
// All spending categories — configurable, not hard-coded in UI.
// ─────────────────────────────────────────────

export interface CategoryConfig {
  slug: string;
  name: string;
  icon: string;
  color: string;
  isIncome: boolean;
  sortOrder: number;
  keywords: string[]; // for keyword-based classification
}

export const CATEGORIES: CategoryConfig[] = [
  // ── Income ──────────────────────────────────
  {
    slug: "income-salary",
    name: "Salary",
    icon: "💰",
    color: "#10B981",
    isIncome: true,
    sortOrder: 0,
    keywords: ["salary", "payroll", "wages", "payslip", "income", "pay credit"],
  },
  {
    slug: "income-freelance",
    name: "Freelance",
    icon: "💼",
    color: "#059669",
    isIncome: true,
    sortOrder: 1,
    keywords: ["freelance", "contract", "consulting", "project payment"],
  },
  {
    slug: "income-transfer",
    name: "Received Transfer",
    icon: "↩️",
    color: "#34D399",
    isIncome: true,
    sortOrder: 2,
    keywords: ["transfer from", "credit from", "received from"],
  },
  {
    slug: "income-other",
    name: "Other Income",
    icon: "📈",
    color: "#6EE7B7",
    isIncome: true,
    sortOrder: 3,
    keywords: ["dividend", "interest", "refund", "cashback", "bonus", "commission"],
  },

  // ── Expenses ─────────────────────────────────
  {
    slug: "food-dining",
    name: "Food & Dining",
    icon: "🍽️",
    color: "#F59E0B",
    isIncome: false,
    sortOrder: 10,
    keywords: [
      "restaurant", "cafe", "coffee", "food", "eatery", "canteen", "kitchen",
      "chicken republic", "mr biggs", "dominos", "pizza", "burger", "shawarma",
      "kfc", "suya", "jollof", "eatgoodng", "chopnownow", "jumia food", "bolt food",
    ],
  },
  {
    slug: "groceries",
    name: "Groceries",
    icon: "🛒",
    color: "#D97706",
    isIncome: false,
    sortOrder: 11,
    keywords: [
      "shoprite", "market", "supermarket", "grocery", "provision", "spar",
      "ebeano", "grand square", "justrite", "fresh", "foodco",
    ],
  },
  {
    slug: "transport",
    name: "Transportation",
    icon: "🚗",
    color: "#3B82F6",
    isIncome: false,
    sortOrder: 20,
    keywords: [
      "uber", "bolt", "taxify", "indriver", "lyft", "ride", "transport",
      "fuel", "petrol", "diesel", "vehicle", "bus", "danfo", "okada",
      "ridepool", "gokada", "moov", "oride",
    ],
  },
  {
    slug: "housing",
    name: "Housing",
    icon: "🏠",
    color: "#8B5CF6",
    isIncome: false,
    sortOrder: 30,
    keywords: ["rent", "landlord", "property", "apartment", "house", "mortgage", "lease"],
  },
  {
    slug: "utilities",
    name: "Utilities",
    icon: "⚡",
    color: "#EC4899",
    isIncome: false,
    sortOrder: 31,
    keywords: [
      "nepa", "ekedc", "ikedc", "aedc", "kaedco", "electricity", "eedc",
      "water", "phcn", "disco", "power bill", "internet", "spectranet",
      "smile", "ipnx", "swift", "eko electricity",
    ],
  },
  {
    slug: "airtime-data",
    name: "Airtime & Data",
    icon: "📱",
    color: "#F97316",
    isIncome: false,
    sortOrder: 32,
    keywords: [
      "mtn", "airtel", "glo", "9mobile", "etisalat", "airtime", "recharge",
      "data bundle", "vtu", "top up",
    ],
  },
  {
    slug: "shopping",
    name: "Shopping",
    icon: "🛍️",
    color: "#EF4444",
    isIncome: false,
    sortOrder: 40,
    keywords: [
      "jumia", "konga", "amazon", "aliexpress", "payporte", "fashion",
      "clothing", "shoes", "accessories", "mall", "store",
    ],
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    icon: "🎬",
    color: "#A855F7",
    isIncome: false,
    sortOrder: 50,
    keywords: [
      "netflix", "spotify", "youtube premium", "apple music", "showmax",
      "cinema", "genesis", "silverbird", "filmhouse", "concert", "event",
      "ticket", "dstv", "gotv", "startimes",
    ],
  },
  {
    slug: "subscriptions",
    name: "Subscriptions",
    icon: "🔄",
    color: "#6366F1",
    isIncome: false,
    sortOrder: 51,
    keywords: [
      "subscription", "monthly plan", "annual plan", "membership",
      "saas", "software", "app", "service fee",
    ],
  },
  {
    slug: "education",
    name: "Education",
    icon: "📚",
    color: "#14B8A6",
    isIncome: false,
    sortOrder: 60,
    keywords: [
      "school fee", "tuition", "course", "training", "certification",
      "udemy", "coursera", "learning", "book", "stationery",
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    icon: "🏥",
    color: "#10B981",
    isIncome: false,
    sortOrder: 70,
    keywords: [
      "pharmacy", "hospital", "clinic", "doctor", "medicine", "drug",
      "healthplan", "reliance hmo", "hygeia", "medicine", "lab", "test",
    ],
  },
  {
    slug: "travel",
    name: "Travel",
    icon: "✈️",
    color: "#0EA5E9",
    isIncome: false,
    sortOrder: 80,
    keywords: [
      "hotel", "flight", "airline", "airport", "booking", "airbnb",
      "arik", "air peace", "dana air", "united", "emirates", "visa",
    ],
  },
  {
    slug: "personal-care",
    name: "Personal Care",
    icon: "💅",
    color: "#FB7185",
    isIncome: false,
    sortOrder: 90,
    keywords: [
      "salon", "barber", "spa", "beauty", "haircut", "nails", "makeup",
      "gym", "fitness", "laundry",
    ],
  },
  {
    slug: "business",
    name: "Business",
    icon: "💼",
    color: "#78716C",
    isIncome: false,
    sortOrder: 100,
    keywords: [
      "office", "printing", "supplies", "advertisement", "ads", "google ads",
      "facebook ads", "domain", "hosting", "tools",
    ],
  },
  {
    slug: "family",
    name: "Family",
    icon: "👨‍👩‍👧",
    color: "#F472B6",
    isIncome: false,
    sortOrder: 110,
    keywords: ["family", "children", "school", "tuition", "allowance", "dependent"],
  },
  {
    slug: "gifts",
    name: "Gifts & Donations",
    icon: "🎁",
    color: "#FB923C",
    isIncome: false,
    sortOrder: 120,
    keywords: ["gift", "donation", "charity", "tithe", "offering", "zakat"],
  },
  {
    slug: "transfers",
    name: "Transfers",
    icon: "↔️",
    color: "#94A3B8",
    isIncome: false,
    sortOrder: 900,
    keywords: ["transfer", "trf", "inter-bank", "intra-bank", "nip"],
  },
  {
    slug: "other",
    name: "Other",
    icon: "📌",
    color: "#64748B",
    isIncome: false,
    sortOrder: 999,
    keywords: [],
  },
];

export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.slug, c]));

export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.isIncome);
export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => !c.isIncome);

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORY_MAP.get(slug);
}
