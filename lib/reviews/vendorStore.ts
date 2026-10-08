// ─────────────────────────────────────────────────────────────────
// MoniePay — Public Vendor & Customer Reviews Store
// Simple, Lightweight, Mobile-First Data Layer with Anti-Spam & Moderation
// ─────────────────────────────────────────────────────────────────

export interface VendorProfile {
  id: string;
  name: string;
  shopName: string;
  category: string;
  market: string;
  fullAddress: string;
  landmark: string;
  phone: string;
  whatsapp: string;
  image: string;
  bannerImage?: string;
  code: string;
  coordinates: {
    lat: number;
    lng: number;
    mapX: number; // Percentage X for visual SVG market map (0-100)
    mapY: number; // Percentage Y for visual SVG market map (0-100)
  };
  openingHours: string;
  verified: boolean;
  tags: string[];
}

export interface ReviewReply {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  shopKey: string;
  shopName: string;
  rating: number; // 1 to 5
  comment: string;
  tags: string[];
  customerName: string; // Public display name (e.g. "Chidinma O." or "Market Customer")
  isVerifiedCustomer: boolean; // True when created via scanned QR interaction
  createdAt: string;
  reply?: ReviewReply;
  isReported?: boolean;
  reportReason?: string;
  reportNote?: string;
  reportedAt?: string;
  moderationStatus?: "published" | "under_review" | "hidden";
}

// ── 1. REALISTIC REGISTERED MONIEPAY VENDORS ───────────────────────
export const INITIAL_VENDORS: Record<string, VendorProfile> = {
  mama_chidi: {
    id: "mama_chidi",
    name: "Mama Chidi",
    shopName: "Mama Chidi Super Provisions",
    category: "Provisions & Groceries",
    market: "Balogun Market, Lagos Island",
    fullAddress: "Shop 14, Line 3, Main Plaza, Balogun Market, Lagos Island, Lagos",
    landmark: "Directly opposite First Bank junction, Beside Breadfruit street",
    phone: "+234 803 123 4567",
    whatsapp: "2348031234567",
    image: "/images/traders/mama_chidi.jpg",
    code: "MP-BAL-84920",
    coordinates: {
      lat: 6.4551,
      lng: 3.3841,
      mapX: 42,
      mapY: 58,
    },
    openingHours: "Mon - Sat: 7:30 AM - 6:30 PM",
    verified: true,
    tags: ["Original Goods Only", "Fair Market Price", "Always Has Change", "Fast Packaging"],
  },
  alhaji_garba: {
    id: "alhaji_garba",
    name: "Alhaji Garba",
    shopName: "Alhaji Garba Grains & Foodstuff",
    category: "Wholesale Foodstuff & Grains",
    market: "Mile 12 Wholesale Market, Ketu",
    fullAddress: "Shed 42, Grains & Rice Section, Mile 12 Market, Ketu, Lagos",
    landmark: "Near Main Truck Offloading Bay, Gate 2",
    phone: "+234 802 987 6543",
    whatsapp: "2348029876543",
    image: "/images/traders/alhaji_garba.jpg",
    code: "MP-M12-92140",
    coordinates: {
      lat: 6.6018,
      lng: 3.3958,
      mapX: 68,
      mapY: 28,
    },
    openingHours: "Mon - Sun: 6:00 AM - 7:00 PM",
    verified: true,
    tags: ["Accurate Measure / Derica", "Wholesale Bags", "Polite & Respectful", "Fast Loading"],
  },
  emeka: {
    id: "emeka",
    name: "Emeka Okonkwo",
    shopName: "Emeka Mobile & Electronics Hub",
    category: "Electronics & Gadgets",
    market: "Alaba International Market, Ojo",
    fullAddress: "Block D, Shop 9, Electronics Plaza, Alaba Int'l Market, Ojo, Lagos",
    landmark: "Near St. Patrick's Cathedral entrance, Alaba expressway",
    phone: "+234 814 555 7890",
    whatsapp: "2348145557890",
    image: "/images/traders/emeka_electronics.jpg",
    code: "MP-ALA-73010",
    coordinates: {
      lat: 6.4623,
      lng: 3.1925,
      mapX: 20,
      mapY: 72,
    },
    openingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
    verified: true,
    tags: ["100% Genuine Tech", "Warranty Included", "Fast Transfer Confirmation", "Original Accessories"],
  },
  blessing: {
    id: "blessing",
    name: "Blessing Adebayo",
    shopName: "Blessing Fabrics & Lace Store",
    category: "Fabrics, Lace & Aso-Ebi",
    market: "Tejuosho Ultra-Modern Market, Yaba",
    fullAddress: "Shop G-28, Ground Floor, Tejuosho Ultra Modern Complex, Yaba, Lagos",
    landmark: "Right by Yaba train station flyover escalator",
    phone: "+234 809 333 1122",
    whatsapp: "2348093331122",
    image: "/images/traders/blessing_fabrics.jpg",
    code: "MP-TEJ-61840",
    coordinates: {
      lat: 6.5165,
      lng: 3.3752,
      mapX: 52,
      mapY: 42,
    },
    openingHours: "Mon - Sat: 8:30 AM - 7:00 PM",
    verified: true,
    tags: ["Original Lace", "Fair Price", "Polite & Patient", "Quality Aso-Ebi"],
  },
};

// ── 2. SEED REALISTIC REVIEWS ──────────────────────────────────────
export const SEED_REVIEWS: CustomerReview[] = [
  {
    id: "rev_seed_1",
    shopKey: "mama_chidi",
    shopName: "Mama Chidi Super Provisions",
    rating: 5,
    comment: "Mama Chidi is the most honest provision seller in Balogun! Her prices are always fair and she gave me my change complete in clean notes. Very fast!",
    tags: ["Original Goods Only", "Fair Market Price", "Always Has Change"],
    customerName: "Mrs. Nkechi E.",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    reply: {
      id: "rep_1",
      text: "Thank you so much Mrs. Nkechi! We always appreciate your customer loyalty. May God bless your business too! 🙏",
      authorName: "Mama Chidi (Shop Owner)",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
    },
    moderationStatus: "published",
  },
  {
    id: "rev_seed_2",
    shopKey: "mama_chidi",
    shopName: "Mama Chidi Super Provisions",
    rating: 5,
    comment: "Scanned the MoniePay counter QR code after buying 3 cartons of milk. Transfer confirmed instantly within 5 seconds without waiting.",
    tags: ["Fast Transfer Confirmation", "Polite & Respectful"],
    customerName: "Tunde Bakare",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    moderationStatus: "published",
  },
  {
    id: "rev_seed_3",
    shopKey: "mama_chidi",
    shopName: "Mama Chidi Super Provisions",
    rating: 4,
    comment: "Very polite shop girl and original goods. Market was crowded today but service was still fast.",
    tags: ["Original Goods Only", "Clean Stall"],
    customerName: "Amina Yusuf",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    moderationStatus: "published",
  },
  {
    id: "rev_seed_4",
    shopKey: "alhaji_garba",
    shopName: "Alhaji Garba Grains & Foodstuff",
    rating: 5,
    comment: "Alhaji Garba derica measure is 100% accurate. No cheating, clean rice with zero stones. Recommended for anyone buying bulk in Mile 12!",
    tags: ["Accurate Measure / Derica", "Wholesale Bags", "Polite & Respectful"],
    customerName: "Ibrahim S.",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    reply: {
      id: "rep_2",
      text: "Nagode Ibrahim! Honesty is our motto in this stall. We look forward to your next order.",
      authorName: "Alhaji Garba (Shop Owner)",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    moderationStatus: "published",
  },
  {
    id: "rev_seed_5",
    shopKey: "emeka",
    shopName: "Emeka Mobile & Electronics Hub",
    rating: 5,
    comment: "Bought an original fast charger and power bank. Tested everything before leaving shop. Authentic product with 6 months warranty.",
    tags: ["100% Genuine Tech", "Warranty Included", "Fast Transfer Confirmation"],
    customerName: "David O.",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    moderationStatus: "published",
  },
  {
    id: "rev_seed_6",
    shopKey: "blessing",
    shopName: "Blessing Fabrics & Lace Store",
    rating: 5,
    comment: "Sister Blessing has the most beautiful French and Swiss lace designs in Tejuosho. She was very patient with me while choosing colors for our wedding Aso-Ebi.",
    tags: ["Original Lace", "Polite & Patient", "Quality Aso-Ebi"],
    customerName: "Folashade A.",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    moderationStatus: "published",
  },
];

const STORAGE_KEY = "moniepay_customer_ratings_v2";
const COOLDOWN_KEY = "moniepay_review_cooldowns";
const CUSTOM_VENDORS_KEY = "moniepay_custom_vendors";

// ── Helper to resolve market coordinates & landmarks for any Nigerian address ──
export function resolveMarketCoordinates(addressOrMarket: string): {
  market: string;
  landmark: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
} {
  const text = (addressOrMarket || "").toLowerCase();

  if (text.includes("mile 12") || text.includes("ketu") || text.includes("kosofe")) {
    return {
      market: "Mile 12 Wholesale Market, Ketu",
      landmark: "Near Main Truck Offloading Bay, Gate 2",
      lat: 6.6018,
      lng: 3.3958,
      mapX: 68,
      mapY: 28,
    };
  }
  if (text.includes("alaba") || text.includes("ojo") || text.includes("electronics")) {
    return {
      market: "Alaba International Market, Ojo",
      landmark: "Near St. Patrick's Cathedral entrance, Alaba expressway",
      lat: 6.4623,
      lng: 3.1925,
      mapX: 20,
      mapY: 72,
    };
  }
  if (text.includes("tejuosho") || text.includes("yaba") || text.includes("ojuelegba")) {
    return {
      market: "Tejuosho Ultra-Modern Market, Yaba",
      landmark: "Right by Yaba train station flyover escalator",
      lat: 6.5165,
      lng: 3.3752,
      mapX: 52,
      mapY: 42,
    };
  }
  if (text.includes("computer village") || text.includes("ikeja") || text.includes("otigba")) {
    return {
      market: "Computer Village, Ikeja, Lagos",
      landmark: "Otigba Street junction, opposite Medical Road",
      lat: 6.5956,
      lng: 3.3369,
      mapX: 48,
      mapY: 24,
    };
  }
  if (text.includes("trade fair") || text.includes("badagry") || text.includes("festac")) {
    return {
      market: "Trade Fair Complex, Badagry Expressway",
      landmark: "BBA Hall 4, Trade Fair main gate",
      lat: 6.4632,
      lng: 3.2384,
      mapX: 26,
      mapY: 65,
    };
  }
  if (text.includes("idumota") || text.includes("dosunmu") || text.includes("nnamdi azikiwe")) {
    return {
      market: "Idumota Wholesale Market, Lagos Island",
      landmark: "Beside Idumota cenotaph & Carter Bridge entrance",
      lat: 6.459,
      lng: 3.3892,
      mapX: 45,
      mapY: 55,
    };
  }
  if (text.includes("lekki") || text.includes("ajah") || text.includes("victoria island") || text.includes("vi")) {
    return {
      market: "Lekki Market & Palms Hub, Lagos",
      landmark: "Admiralty Way / Lekki Phase 1 Junction",
      lat: 6.4474,
      lng: 3.4849,
      mapX: 78,
      mapY: 68,
    };
  }

  // Default / Balogun Market with custom address
  return {
    market: addressOrMarket || "Balogun Market, Lagos Island",
    landmark: "Directly opposite First Bank junction, Beside Breadfruit street",
    lat: 6.4551,
    lng: 3.3841,
    mapX: 42,
    mapY: 58,
  };
}

export function getCustomVendors(): Record<string, VendorProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOM_VENDORS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomVendor(vendor: VendorProfile) {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomVendors();
    existing[vendor.id] = vendor;
    localStorage.setItem(CUSTOM_VENDORS_KEY, JSON.stringify(existing));
  } catch {}
}

/**
 * Synchronizes the logged-in merchant's active profile and address across the entire app
 */
export function getCurrentUserVendor(user?: {
  id?: string;
  name?: string;
  businessName?: string;
  marketLocation?: string;
  avatarUrl?: string;
} | null): VendorProfile {
  let activeUser = user;
  if (!activeUser && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("moniepay_session") || localStorage.getItem("ajo_session");
      if (raw) activeUser = JSON.parse(raw);
    } catch {}
  }

  const shopId = activeUser?.id || "mama_chidi";
  const shopName = activeUser?.businessName || "Mama Chidi Super Provisions";
  const traderName = activeUser?.name || "Mama Chidi";
  const fullAddress = activeUser?.marketLocation || "Shop 14, Line 3, Main Plaza, Balogun Market, Lagos Island, Lagos";
  const avatarUrl = activeUser?.avatarUrl || "/images/traders/mama_chidi.jpg";

  const resolved = resolveMarketCoordinates(fullAddress);

  const vendorProfile: VendorProfile = {
    id: shopId,
    name: traderName,
    shopName,
    category: "Provisions & Groceries",
    market: resolved.market,
    fullAddress,
    landmark: resolved.landmark,
    phone: "+234 803 123 4567",
    whatsapp: "2348031234567",
    image: avatarUrl,
    code: `MP-${shopId.replace(/[^a-zA-Z0-9]/g, "").slice(-5).toUpperCase() || "84920"}`,
    coordinates: {
      lat: resolved.lat,
      lng: resolved.lng,
      mapX: resolved.mapX,
      mapY: resolved.mapY,
    },
    openingHours: "Mon - Sat: 7:30 AM - 6:30 PM",
    verified: true,
    tags: ["Original Goods Only", "Fair Market Price", "Always Has Change", "Fast Packaging"],
  };

  saveCustomVendor(vendorProfile);
  return vendorProfile;
}

// ── 3. CLIENT STORE ACCESS METHODS ──────────────────────────────────
export function getAllVendors(): VendorProfile[] {
  const custom = Object.values(getCustomVendors());
  const initial = Object.values(INITIAL_VENDORS);

  const activeUserVendor = getCurrentUserVendor();
  const otherVendors = initial.filter((v) => v.id !== activeUserVendor.id && v.id !== "mama_chidi");

  // Put the active owner's shop first, followed by custom and other market shops
  return [activeUserVendor, ...otherVendors];
}

export function getVendor(id?: string | null): VendorProfile {
  if (!id) return getCurrentUserVendor();

  const custom = getCustomVendors();
  if (custom[id]) return custom[id];

  const activeUserVendor = getCurrentUserVendor();
  if (id === activeUserVendor.id || id === "current" || id === "my_shop" || id === "user_owner_01") {
    return activeUserVendor;
  }

  if (id === "mama_chidi") {
    if (
      activeUserVendor.shopName !== INITIAL_VENDORS.mama_chidi.shopName ||
      activeUserVendor.fullAddress !== INITIAL_VENDORS.mama_chidi.fullAddress
    ) {
      return activeUserVendor;
    }
    return INITIAL_VENDORS.mama_chidi;
  }

  return INITIAL_VENDORS[id] || activeUserVendor;
}

export function getAllReviews(): CustomerReview[] {
  if (typeof window === "undefined") return SEED_REVIEWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
      return SEED_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_REVIEWS;
  } catch {
    return SEED_REVIEWS;
  }
}

export function getVendorReviews(shopKey: string, includeHidden = false): CustomerReview[] {
  const reviews = getAllReviews();
  return reviews.filter((r) => {
    if (r.shopKey !== shopKey) return false;
    if (!includeHidden && r.moderationStatus === "hidden") return false;
    return true;
  });
}

export function calculateVendorStats(shopKey: string) {
  const reviews = getVendorReviews(shopKey, false);
  const total = reviews.length;
  if (total === 0) {
    return {
      average: 5.0,
      total: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      topTags: [] as { tag: string; count: number }[],
    };
  }

  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const average = Number((sum / total).toFixed(1));

  const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const tagCounts: Record<string, number> = {};

  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    breakdown[star] = (breakdown[star] || 0) + 1;
    (r.tags || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    average,
    total,
    breakdown,
    topTags,
  };
}

// ── 4. ANTI-SPAM & SUBMISSION ───────────────────────────────────────
export interface SubmitReviewInput {
  shopKey: string;
  rating: number;
  comment: string;
  tags: string[];
  customerName: string;
  customerPhone?: string;
  isVerifiedCustomer?: boolean;
}

export function checkReviewCooldown(shopKey: string, phoneOrIdentifier?: string): { canSubmit: boolean; message?: string } {
  if (typeof window === "undefined") return { canSubmit: true };
  try {
    const cooldowns = JSON.parse(localStorage.getItem(COOLDOWN_KEY) || "{}");
    const identifier = (phoneOrIdentifier && phoneOrIdentifier.trim()) || "anonymous_session";
    const key = `${shopKey}_${identifier}`;
    const lastSubmitTime = cooldowns[key];

    if (lastSubmitTime) {
      const elapsedMs = Date.now() - Number(lastSubmitTime);
      const cooldownPeriodMs = 1000 * 60 * 60 * 24; // 24 hours cooldown per vendor
      if (elapsedMs < cooldownPeriodMs) {
        const remainingHours = Math.ceil((cooldownPeriodMs - elapsedMs) / (1000 * 60 * 60));
        return {
          canSubmit: false,
          message: `You already submitted a review for this shop recently. Please wait ${remainingHours} hour(s) before reviewing again to prevent duplicate ratings.`,
        };
      }
    }
    return { canSubmit: true };
  } catch {
    return { canSubmit: true };
  }
}

export function submitReview(input: SubmitReviewInput): { success: boolean; review?: CustomerReview; error?: string } {
  const vendor = getVendor(input.shopKey);
  if (!vendor) {
    return { success: false, error: "Invalid shop or vendor profile." };
  }

  // Anti-spam checks
  const cooldown = checkReviewCooldown(input.shopKey, input.customerPhone);
  if (!cooldown.canSubmit) {
    return { success: false, error: cooldown.message };
  }

  // Sanitize name: Mask sensitive details, format nicely
  const rawName = input.customerName?.trim() || "Market Customer";
  let formattedName = rawName;
  if (rawName.includes(" ") && rawName.split(" ").length > 1) {
    const parts = rawName.split(" ");
    formattedName = `${parts[0]} ${parts[1][0]}.`; // e.g. "Chidinma O."
  }

  const newReview: CustomerReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    shopKey: input.shopKey,
    shopName: vendor.shopName,
    rating: Math.max(1, Math.min(5, input.rating)),
    comment: (input.comment || "").trim(),
    tags: input.tags || [],
    customerName: formattedName,
    isVerifiedCustomer: input.isVerifiedCustomer !== false, // Verified by default via QR scan
    createdAt: new Date().toISOString(),
    moderationStatus: "published",
  };

  const existing = getAllReviews();
  const updated = [newReview, ...existing];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Record cooldown timestamp
      const cooldowns = JSON.parse(localStorage.getItem(COOLDOWN_KEY) || "{}");
      const identifier = (input.customerPhone && input.customerPhone.trim()) || "anonymous_session";
      cooldowns[`${input.shopKey}_${identifier}`] = Date.now();
      localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
    } catch (e) {
      console.error("Failed to save review:", e);
    }
  }

  return { success: true, review: newReview };
}

// ── 5. VENDOR REPLY FLOW ───────────────────────────────────────────
export function addVendorReply(reviewId: string, replyText: string, authorName = "Shop Owner"): boolean {
  if (!replyText?.trim()) return false;
  const reviews = getAllReviews();
  const targetIndex = reviews.findIndex((r) => r.id === reviewId);
  if (targetIndex === -1) return false;

  reviews[targetIndex].reply = {
    id: `rep_${Date.now()}`,
    text: replyText.trim(),
    authorName,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      return false;
    }
  }
  return true;
}

// ── 6. VENDOR REPORT & ADMIN MODERATION ────────────────────────────
export function reportReview(reviewId: string, reason: string, note?: string): boolean {
  const reviews = getAllReviews();
  const targetIndex = reviews.findIndex((r) => r.id === reviewId);
  if (targetIndex === -1) return false;

  reviews[targetIndex].isReported = true;
  reviews[targetIndex].reportReason = reason;
  reviews[targetIndex].reportNote = note?.trim();
  reviews[targetIndex].reportedAt = new Date().toISOString();
  reviews[targetIndex].moderationStatus = "under_review";

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      return false;
    }
  }
  return true;
}

export function moderateReviewAction(reviewId: string, action: "approve" | "hide" | "dismiss_report"): boolean {
  const reviews = getAllReviews();
  const targetIndex = reviews.findIndex((r) => r.id === reviewId);
  if (targetIndex === -1) return false;

  if (action === "approve" || action === "dismiss_report") {
    reviews[targetIndex].moderationStatus = "published";
    reviews[targetIndex].isReported = false;
  } else if (action === "hide") {
    reviews[targetIndex].moderationStatus = "hidden";
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      return false;
    }
  }
  return true;
}

// ── 7. EASY SHARING HELPERS ────────────────────────────────────────
export function getVendorShareLinks(vendorId: string, customOrigin?: string) {
  const vendor = getVendor(vendorId) || INITIAL_VENDORS.mama_chidi;
  const baseUrl = customOrigin || "https://moniepay.app";
  
  const reviewUrl = `${baseUrl}/rate?shop=${encodeURIComponent(vendor.id)}`;
  const profileUrl = `${baseUrl}/vendors/${encodeURIComponent(vendor.id)}`;
  const mapUrl = `${baseUrl}/map?vendor=${encodeURIComponent(vendor.id)}`;

  const whatsappReviewMessage = `Hello! Thank you for buying from *${vendor.shopName}* (${vendor.market}). 🙏\n\nPlease tap here to leave us a quick review on MoniePay:\n${reviewUrl}`;
  const whatsappProfileMessage = `Check out *${vendor.shopName}* on MoniePay:\n📍 ${vendor.fullAddress}\n⭐ See verified reviews & get directions:\n${profileUrl}`;

  const whatsappReviewLink = `https://wa.me/?text=${encodeURIComponent(whatsappReviewMessage)}`;
  const whatsappProfileLink = `https://wa.me/?text=${encodeURIComponent(whatsappProfileMessage)}`;

  return {
    reviewUrl,
    profileUrl,
    mapUrl,
    whatsappReviewLink,
    whatsappProfileLink,
    whatsappReviewMessage,
  };
}
