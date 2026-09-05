// ─────────────────────────────────────────────
// Merchant Normalization Rules
// Maps messy bank descriptions to clean merchant names
// ─────────────────────────────────────────────

export interface MerchantRule {
  normalizedName: string;
  displayName: string;
  categorySlug: string;
  patterns: (string | RegExp)[]; // string = partial match, RegExp = full pattern
}

export const MERCHANT_RULES: MerchantRule[] = [
  // ── Ride-hailing ────────────────────────────
  {
    normalizedName: "uber",
    displayName: "Uber",
    categorySlug: "transport",
    patterns: ["UBER", /UBER[\s*]/i, "UBR*", /UBEREATS/i],
  },
  {
    normalizedName: "bolt",
    displayName: "Bolt",
    categorySlug: "transport",
    patterns: ["BOLT", "TAXIFY", /BOLT (TRIP|RIDE)/i],
  },

  // ── Food Delivery ────────────────────────────
  {
    normalizedName: "jumia-food",
    displayName: "Jumia Food",
    categorySlug: "food-dining",
    patterns: ["JUMIA FOOD", "EFRITIN FOOD"],
  },
  {
    normalizedName: "bolt-food",
    displayName: "Bolt Food",
    categorySlug: "food-dining",
    patterns: [/BOLT FOOD/i],
  },
  {
    normalizedName: "chowdeck",
    displayName: "Chowdeck",
    categorySlug: "food-dining",
    patterns: ["CHOWDECK", "CHOW DECK"],
  },

  // ── Restaurants ──────────────────────────────
  {
    normalizedName: "chicken-republic",
    displayName: "Chicken Republic",
    categorySlug: "food-dining",
    patterns: ["CHICKEN REPUBLIC", "CHK REPUBLIC", "CHICKENREP"],
  },
  {
    normalizedName: "kfc",
    displayName: "KFC",
    categorySlug: "food-dining",
    patterns: ["KFC", "KENTUCKY FRIED"],
  },
  {
    normalizedName: "dominos",
    displayName: "Domino's Pizza",
    categorySlug: "food-dining",
    patterns: ["DOMINOS", "DOMINO'S", "DOMINO PIZZA"],
  },

  // ── Streaming ────────────────────────────────
  {
    normalizedName: "netflix",
    displayName: "Netflix",
    categorySlug: "entertainment",
    patterns: ["NETFLIX", "NETFLIX.COM"],
  },
  {
    normalizedName: "spotify",
    displayName: "Spotify",
    categorySlug: "entertainment",
    patterns: ["SPOTIFY", "SPOTIFY AB"],
  },
  {
    normalizedName: "dstv",
    displayName: "DStv",
    categorySlug: "entertainment",
    patterns: ["DSTV", "MULTICHOICE", "GOTV", "STARTIMES"],
  },
  {
    normalizedName: "showmax",
    displayName: "Showmax",
    categorySlug: "entertainment",
    patterns: ["SHOWMAX"],
  },

  // ── Telecoms ─────────────────────────────────
  {
    normalizedName: "mtn",
    displayName: "MTN",
    categorySlug: "airtime-data",
    patterns: ["MTN", /MTN (AIRTIME|DATA|RECHARGE)/i],
  },
  {
    normalizedName: "airtel",
    displayName: "Airtel",
    categorySlug: "airtime-data",
    patterns: ["AIRTEL", /AIRTEL (AIRTIME|DATA)/i],
  },
  {
    normalizedName: "glo",
    displayName: "Glo",
    categorySlug: "airtime-data",
    patterns: ["GLO", /GLO (AIRTIME|DATA)/i, "GLOBACOM"],
  },
  {
    normalizedName: "9mobile",
    displayName: "9mobile",
    categorySlug: "airtime-data",
    patterns: ["9MOBILE", "ETISALAT", "9 MOBILE"],
  },

  // ── Electricity ──────────────────────────────
  {
    normalizedName: "ekedc",
    displayName: "Eko Electricity (EKEDC)",
    categorySlug: "utilities",
    patterns: ["EKEDC", "EKO ELECTRIC", "EKO DISCO"],
  },
  {
    normalizedName: "ikedc",
    displayName: "Ikeja Electric (IKEDC)",
    categorySlug: "utilities",
    patterns: ["IKEDC", "IKEJA ELECTRIC", "IKEJA DISCO"],
  },
  {
    normalizedName: "aedc",
    displayName: "Abuja Electric (AEDC)",
    categorySlug: "utilities",
    patterns: ["AEDC", "ABUJA ELECTRIC", "ABUJA DISCO"],
  },

  // ── E-commerce ───────────────────────────────
  {
    normalizedName: "jumia",
    displayName: "Jumia",
    categorySlug: "shopping",
    patterns: ["JUMIA", "EFRITIN"],
  },
  {
    normalizedName: "konga",
    displayName: "Konga",
    categorySlug: "shopping",
    patterns: ["KONGA"],
  },

  // ── Supermarkets ─────────────────────────────
  {
    normalizedName: "shoprite",
    displayName: "Shoprite",
    categorySlug: "groceries",
    patterns: ["SHOPRITE"],
  },
  {
    normalizedName: "spar",
    displayName: "Spar",
    categorySlug: "groceries",
    patterns: ["SPAR", /SPAR (SUPERMARKET|STORE)/i],
  },

  // ── Fuel ─────────────────────────────────────
  {
    normalizedName: "total-energies",
    displayName: "TotalEnergies",
    categorySlug: "transport",
    patterns: ["TOTAL", "TOTALENERGIES", "TOTAL PETROL"],
  },
  {
    normalizedName: "ardova",
    displayName: "Ardova (AP) Petrol",
    categorySlug: "transport",
    patterns: ["ARDOVA", "AP STATION", "AFRICAN PETROLEUM"],
  },

  // ── Banks / Transfers ────────────────────────
  {
    normalizedName: "access-bank",
    displayName: "Access Bank Transfer",
    categorySlug: "transfers",
    patterns: [/TRANSFER (TO|FROM) ACCESS/i, "ACCESS BANK TRF"],
  },
  {
    normalizedName: "gtbank",
    displayName: "GTBank Transfer",
    categorySlug: "transfers",
    patterns: [/TRANSFER (TO|FROM) GT/i, "GTBANK TRF", "GTB TRF"],
  },
  {
    normalizedName: "zenith-bank",
    displayName: "Zenith Bank Transfer",
    categorySlug: "transfers",
    patterns: [/TRANSFER (TO|FROM) ZENITH/i, "ZENITH TRF"],
  },

  // ── SaaS / Tech ──────────────────────────────
  {
    normalizedName: "google",
    displayName: "Google",
    categorySlug: "subscriptions",
    patterns: ["GOOGLE *", "GOOGLE LLC", /GOOGLE (STORAGE|CLOUD|ADS)/i],
  },
  {
    normalizedName: "apple",
    displayName: "Apple",
    categorySlug: "subscriptions",
    patterns: ["APPLE.COM/BILL", "APPLE MUSIC", /APPLE (STORE|ICLOUD)/i],
  },
  {
    normalizedName: "microsoft",
    displayName: "Microsoft",
    categorySlug: "subscriptions",
    patterns: ["MICROSOFT", "MSFT", "OFFICE 365"],
  },
];

/**
 * Try to match a merchant description to a known rule.
 * Returns the matching rule or null.
 */
export function findMerchantRule(description: string): MerchantRule | null {
  const upper = description.toUpperCase();
  for (const rule of MERCHANT_RULES) {
    for (const pattern of rule.patterns) {
      if (typeof pattern === "string") {
        if (upper.includes(pattern.toUpperCase())) return rule;
      } else if (pattern instanceof RegExp) {
        if (pattern.test(description)) return rule;
      }
    }
  }
  return null;
}
