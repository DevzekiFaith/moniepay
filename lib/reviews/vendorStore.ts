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
  malam_sanusi: {
    id: "malam_sanusi",
    name: "Malam Sanusi Dahiru",
    shopName: "Malam Sanusi Grains & Legumes Depot",
    category: "Wholesale Foodstuff & Grains",
    market: "Dawanau International Grains Depot, Kano",
    fullAddress: "Shed 19, Main Grains Terminal, Dawanau Market, Kano",
    landmark: "Northern Grain Trailers Bay, Gate 3, Katsina Road",
    phone: "+234 803 444 8899",
    whatsapp: "2348034448899",
    image: "/images/traders/alhaji_garba.jpg",
    code: "MP-KAN-91024",
    coordinates: {
      lat: 12.0625,
      lng: 8.4419,
      mapX: 60,
      mapY: 16,
    },
    openingHours: "Mon - Sun: 6:00 AM - 6:30 PM",
    verified: true,
    tags: ["Wholesale Bags", "Clean Measure", "Accurate Weighing", "Direct Farm Supply"],
  },
  hajiya_zainab: {
    id: "hajiya_zainab",
    name: "Hajiya Zainab Umar",
    shopName: "Zainab Gold & Royal Fabrics Hub",
    category: "Fabrics, Lace & Aso-Ebi",
    market: "Wuse Modern Market, Abuja FCT",
    fullAddress: "Block C, Shop 18, Textile Plaza, Wuse Modern Market, Zone 5, Abuja",
    landmark: "Opposite Kashim Ibrahim Way Main Entrance Gate",
    phone: "+234 812 666 3322",
    whatsapp: "2348126663322",
    image: "/images/traders/blessing_fabrics.jpg",
    code: "MP-ABJ-82015",
    coordinates: {
      lat: 9.0643,
      lng: 7.4665,
      mapX: 52,
      mapY: 42,
    },
    openingHours: "Mon - Sat: 8:00 AM - 7:00 PM",
    verified: true,
    tags: ["Quality Swiss Lace", "Wholesale Aso-Ebi", "Polite & Respectful", "Original Ankara"],
  },
  chief_okeke: {
    id: "chief_okeke",
    name: "Chief Innocent Okeke",
    shopName: "Okeke & Sons Hardware & Machinery Tools",
    category: "Auto Parts & Hardware",
    market: "Onitsha Main / Relief Market, Anambra",
    fullAddress: "Line 4, Shop 28, Industrial Tools Section, Onitsha Main Market, Anambra",
    landmark: "Beside Holy Trinity Cathedral axis, along River Niger bank road",
    phone: "+234 806 777 4411",
    whatsapp: "2348067774411",
    image: "/images/traders/emeka_electronics.jpg",
    code: "MP-ONT-73910",
    coordinates: {
      lat: 6.1519,
      lng: 6.7758,
      mapX: 62,
      mapY: 68,
    },
    openingHours: "Mon - Sat: 7:30 AM - 6:00 PM",
    verified: true,
    tags: ["Heavy Industrial Grade", "Tested & Working", "Direct Importer", "Warranty Included"],
  },
  ugochi_leather: {
    id: "ugochi_leather",
    name: "Ugochi Nnamdi",
    shopName: "Ugochi Handmade Footwear & Leather Works",
    category: "General Retail & Provisions",
    market: "Ariaria International Market, Aba, Abia",
    fullAddress: "A-Line, Shop 45, Leather & Shoe Section, Ariaria Int'l Market, Aba, Abia",
    landmark: "Faulks Road Gate 1, beside Powerline transformer",
    phone: "+234 813 888 9955",
    whatsapp: "2348138889955",
    image: "/images/traders/mama_chidi.jpg",
    code: "MP-ABA-65230",
    coordinates: {
      lat: 5.1278,
      lng: 7.3392,
      mapX: 64,
      mapY: 80,
    },
    openingHours: "Mon - Sat: 8:00 AM - 6:30 PM",
    verified: true,
    tags: ["100% Genuine Leather", "Bulk Export Quality", "Fast Production", "Fair Deal"],
  },
  tamuno_stores: {
    id: "tamuno_stores",
    name: "Tamuno Briggs",
    shopName: "Tamuno Oil Mill & Provisions Store",
    category: "Provisions & Groceries",
    market: "Oil Mill / Mile 1 Market, Port Harcourt",
    fullAddress: "Shop 12, Block B, Oil Mill Commercial Depot, Port Harcourt, Rivers",
    landmark: "Near Aba-Port Harcourt Expressway Flyover Ramp",
    phone: "+234 805 111 2244",
    whatsapp: "2348051112244",
    image: "/images/traders/emeka_electronics.jpg",
    code: "MP-PHC-51920",
    coordinates: {
      lat: 4.8431,
      lng: 7.0398,
      mapX: 54,
      mapY: 85,
    },
    openingHours: "Mon - Sat: 7:00 AM - 7:00 PM",
    verified: true,
    tags: ["Clean Palm Oil", "Original Goods Only", "Always Has Change", "Prompt Service"],
  },
  iyabo_foodstuff: {
    id: "iyabo_foodstuff",
    name: "Alhaja Iyabo Adewale",
    shopName: "Iyabo Farm Produce & Yam Flour Store",
    category: "Wholesale Foodstuff & Grains",
    market: "Bodija Market, Ibadan, Oyo State",
    fullAddress: "Line 7, Shed 33, Foodstuff & Grains Wing, Bodija Market, Ibadan, Oyo",
    landmark: "Directly beside Bodija Railway Station Loading Bay",
    phone: "+234 802 333 7788",
    whatsapp: "2348023337788",
    image: "/images/traders/blessing_fabrics.jpg",
    code: "MP-IBD-42810",
    coordinates: {
      lat: 7.4345,
      lng: 3.9042,
      mapX: 28,
      mapY: 62,
    },
    openingHours: "Mon - Sat: 7:00 AM - 6:30 PM",
    verified: true,
    tags: ["Zero Dirt / Clean Elubo", "Accurate Measure", "Fresh Farm Supply", "Wholesale Bags"],
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
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
  {
    id: "rev_seed_7",
    shopKey: "malam_sanusi",
    shopName: "Malam Sanusi Grains & Legumes Depot",
    rating: 5,
    comment: "Best grains supplier in Dawanau Kano! Supplied 50 bags of white beans and sorghum. Zero weevils, honest weighing scale.",
    tags: ["Wholesale Bags", "Accurate Weighing", "Direct Farm Supply"],
    customerName: "Aliyu Danladi",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    moderationStatus: "published",
  },
  {
    id: "rev_seed_8",
    shopKey: "hajiya_zainab",
    shopName: "Zainab Gold & Royal Fabrics Hub",
    rating: 5,
    comment: "Hajiya Zainab is the number one fabric store in Wuse Market Abuja. Original Swiss voile and fast invoice receipt.",
    tags: ["Quality Swiss Lace", "Wholesale Aso-Ebi", "Polite & Respectful"],
    customerName: "Halima B.",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    moderationStatus: "published",
  },
  {
    id: "rev_seed_9",
    shopKey: "chief_okeke",
    shopName: "Okeke & Sons Hardware & Machinery Tools",
    rating: 5,
    comment: "Chief Okeke is the most trusted machinery dealer in Onitsha Main Market. Tested our industrial generator before dispatch.",
    tags: ["Heavy Industrial Grade", "Tested & Working", "Warranty Included"],
    customerName: "Chibueze M.",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    moderationStatus: "published",
  },
  {
    id: "rev_seed_10",
    shopKey: "tamuno_stores",
    shopName: "Tamuno Oil Mill & Provisions Store",
    rating: 5,
    comment: "Top quality unadulterated red palm oil and wholesale provisions in Port Harcourt. Smooth QR payment confirmation.",
    tags: ["Clean Palm Oil", "Original Goods Only", "Prompt Service"],
    customerName: "Precious D.",
    isVerifiedCustomer: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    moderationStatus: "published",
  },
];

const STORAGE_KEY = "moniepay_customer_ratings_v2";
const COOLDOWN_KEY = "moniepay_review_cooldowns";
const CUSTOM_VENDORS_KEY = "moniepay_custom_vendors";

// ── Helper to resolve market coordinates & landmarks for any Nigerian address ──
function hashStringToRange(str: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return Math.round(min + normalized * (max - min));
}

function extractDynamicLandmark(address: string): string {
  const parts = address.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  
  // Find a part that sounds like a plaza, complex, building, junction, or street
  const landmarkPart = parts.find((p) =>
    /(plaza|complex|mall|shopping|building|centre|center|junction|bus stop|line|block|shed|gate|roundabout|expressway|street|road|avenue|close|way)/i.test(p)
  );

  if (landmarkPart) {
    if (/(plaza|complex|mall|shopping|building|centre|center)/i.test(landmarkPart)) {
      return `Inside ${landmarkPart}`;
    }
    if (/(junction|bus stop|roundabout|gate)/i.test(landmarkPart)) {
      return `Close to ${landmarkPart}`;
    }
    if (/(street|road|avenue|close|way|expressway)/i.test(landmarkPart)) {
      return `Located along ${landmarkPart}`;
    }
    return `Stall situated at ${landmarkPart}`;
  }

  if (parts.length >= 2) {
    return `Directly within ${parts.slice(1).join(", ")}`;
  }

  return address.trim() ? `Stall situated at ${address.trim()}` : "Central Commercial Trading Stall";
}

export function inferCategory(nameOrGoods?: string): string {
  const text = (nameOrGoods || "").toLowerCase();
  if (/(grain|food|rice|bean|garri|semo|yam|flour|oil|grocer|foodstuff)/i.test(text)) {
    return "Wholesale Foodstuff & Grains";
  }
  if (/(tech|phone|mobile|gadget|electronic|computer|laptop|charger|accessories|audio)/i.test(text)) {
    return "Electronics & Gadgets";
  }
  if (/(fabric|lace|ankara|aso-ebi|fashion|textile|boutique|wear|cloth|tailor)/i.test(text)) {
    return "Fabrics, Lace & Aso-Ebi";
  }
  if (/(pharmacy|chemist|drug|medicine|clinic|health)/i.test(text)) {
    return "Pharmacy & Healthcare";
  }
  if (/(auto|spare|part|motor|car|vehicle|tyre|battery|hardware)/i.test(text)) {
    return "Auto Parts & Hardware";
  }
  if (/(provision|super|market|retail|store|kiosk|mart)/i.test(text)) {
    return "Provisions & Groceries";
  }
  return "General Retail & Provisions";
}

export function getCategoryTags(category: string): string[] {
  switch (category) {
    case "Wholesale Foodstuff & Grains":
      return ["Accurate Measure / Derica", "Clean Bag / Zero Stones", "Fair Market Price", "Always Has Change"];
    case "Electronics & Gadgets":
      return ["100% Genuine Tech", "Warranty Included", "Fast Transfer Confirmation", "Original Accessories"];
    case "Fabrics, Lace & Aso-Ebi":
      return ["Original Lace", "Quality Aso-Ebi", "Polite & Patient", "Fair Price"];
    case "Pharmacy & Healthcare":
      return ["NAFDAC Approved", "Genuine Medicine", "Qualified Advice", "Fast Dispensing"];
    case "Auto Parts & Hardware":
      return ["Original Parts", "Tested & Working", "Direct Depot Supply", "Fair Deal"];
    default:
      return ["Original Goods Only", "Fair Market Price", "Always Has Change", "Fast Packaging"];
  }
}

export function resolveMarketCoordinates(addressOrMarket: string): {
  market: string;
  landmark: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
} {
  const text = (addressOrMarket || "").toLowerCase();
  const dynamicLandmark = extractDynamicLandmark(addressOrMarket || "");

  const withSpecific = (defaultLandmark: string) => {
    if (
      dynamicLandmark.startsWith("Inside ") ||
      dynamicLandmark.startsWith("Close to ") ||
      dynamicLandmark.startsWith("Located along ")
    ) {
      return `${dynamicLandmark}, near ${defaultLandmark.replace(/^near\s+/i, "")}`;
    }
    return defaultLandmark;
  };

  // 1. Lagos Trading Hubs
  if (text.includes("mile 12") || text.includes("ketu") || text.includes("kosofe")) {
    return {
      market: "Mile 12 Wholesale Market, Ketu",
      landmark: withSpecific("Near Main Truck Offloading Bay, Gate 2"),
      lat: 6.6018,
      lng: 3.3958,
      mapX: 68,
      mapY: 28,
    };
  }
  if ((text.includes("alaba") && !text.includes("calabar")) || /\bojo\b/i.test(text) || text.includes("alaba int")) {
    return {
      market: "Alaba International Market, Ojo",
      landmark: withSpecific("Near St. Patrick's Cathedral entrance, Alaba expressway"),
      lat: 6.4623,
      lng: 3.1925,
      mapX: 20,
      mapY: 72,
    };
  }
  if (text.includes("tejuosho") || text.includes("yaba") || text.includes("ojuelegba")) {
    return {
      market: "Tejuosho Ultra-Modern Market, Yaba",
      landmark: withSpecific("Right by Yaba train station flyover escalator"),
      lat: 6.5165,
      lng: 3.3752,
      mapX: 52,
      mapY: 42,
    };
  }
  if (text.includes("computer village") || text.includes("otigba") || (text.includes("ikeja") && text.includes("village"))) {
    return {
      market: "Computer Village, Ikeja, Lagos",
      landmark: withSpecific("Otigba Street junction, opposite Medical Road"),
      lat: 6.5956,
      lng: 3.3369,
      mapX: 48,
      mapY: 24,
    };
  }
  if (text.includes("trade fair") || text.includes("badagry") || text.includes("aspamda") || text.includes("bba")) {
    return {
      market: "Trade Fair Complex, Badagry Expressway",
      landmark: withSpecific("BBA Hall 4, Trade Fair main gate"),
      lat: 6.4632,
      lng: 3.2384,
      mapX: 26,
      mapY: 65,
    };
  }
  if (text.includes("idumota") || text.includes("dosunmu") || text.includes("carter bridge")) {
    return {
      market: "Idumota Wholesale Market, Lagos Island",
      landmark: withSpecific("Beside Idumota cenotaph & Carter Bridge entrance"),
      lat: 6.459,
      lng: 3.3892,
      mapX: 45,
      mapY: 55,
    };
  }
  if (text.includes("daleko") || (text.includes("mushin") && text.includes("oil"))) {
    return {
      market: "Daleko Wholesale Oil & Rice Market, Mushin",
      landmark: withSpecific("Daleko Main Gate, near Railway Line Crossing"),
      lat: 6.5298,
      lng: 3.3518,
      mapX: 46,
      mapY: 38,
    };
  }
  if (text.includes("iddo") || text.includes("oyingbo") || text.includes("ebute metta")) {
    return {
      market: "Iddo Wholesale Food Depot, Lagos",
      landmark: withSpecific("Near Railway Terminus & Carter Bridge Ramp"),
      lat: 6.4789,
      lng: 3.3802,
      mapX: 44,
      mapY: 50,
    };
  }
  if (text.includes("ladipo") || (text.includes("toyota") && text.includes("parts"))) {
    return {
      market: "Ladipo International Auto Parts Market, Mushin",
      landmark: withSpecific("Beside Toyota Bus Stop, Apapa-Oshodi Expressway"),
      lat: 6.5367,
      lng: 3.3442,
      mapX: 45,
      mapY: 36,
    };
  }
  if (text.includes("oshodi") || text.includes("arena")) {
    return {
      market: "Oshodi Ultra-Modern / Arena Market, Lagos",
      landmark: withSpecific("Oshodi Transport Interchange, Terminal 2"),
      lat: 6.5562,
      lng: 3.3533,
      mapX: 49,
      mapY: 32,
    };
  }
  if (text.includes("lekki") || text.includes("ajah") || text.includes("victoria island") || /\bvi\b/i.test(text) || text.includes("ikoyi")) {
    return {
      market: "Lekki Commercial District & Palms Hub, Lagos",
      landmark: withSpecific("Admiralty Way / Lekki Phase 1 Junction"),
      lat: 6.4474,
      lng: 3.4849,
      mapX: 78,
      mapY: 68,
    };
  }
  if (text.includes("balogun") || text.includes("breadfruit") || text.includes("lagos island")) {
    return {
      market: "Balogun Market, Lagos Island",
      landmark: withSpecific("Directly opposite First Bank junction, Beside Breadfruit street"),
      lat: 6.4551,
      lng: 3.3841,
      mapX: 42,
      mapY: 58,
    };
  }

  // 2. Kano State & Northern Hubs
  if (text.includes("dawanau") || text.includes("dawakin tofa")) {
    return {
      market: "Dawanau International Grains Depot, Kano",
      landmark: withSpecific("Main Grains Offloading Bay, Katsina Road, Kano"),
      lat: 12.0625,
      lng: 8.4419,
      mapX: 62,
      mapY: 15,
    };
  }
  if (text.includes("singer") || text.includes("kurmi") || text.includes("sabon gari") || text.includes("fagge")) {
    return {
      market: "Singer Wholesale Market, Kano",
      landmark: withSpecific("Bompai Road / Fagge Central Mosque Axis"),
      lat: 12.0022,
      lng: 8.5291,
      mapX: 65,
      mapY: 18,
    };
  }

  // 3. Anambra & South-East Hubs
  if (text.includes("onitsha") || text.includes("relief market") || text.includes("bridgehead") || text.includes("ogbaru")) {
    return {
      market: "Onitsha Main / Relief Market, Anambra",
      landmark: withSpecific("Beside Holy Trinity Cathedral & River Niger Bank"),
      lat: 6.1519,
      lng: 6.7758,
      mapX: 72,
      mapY: 60,
    };
  }
  if (text.includes("nnewi") || text.includes("nkwo nnewi")) {
    return {
      market: "Nkwo Nnewi Industrial Market, Anambra",
      landmark: withSpecific("Near Nkwo Nnewi Triangle & Bank Road"),
      lat: 6.0198,
      lng: 6.9167,
      mapX: 74,
      mapY: 62,
    };
  }
  if (text.includes("ariaria") || (/\baba\b/i.test(text) && !text.includes("calabar")) || text.includes("ekeoha") || text.includes("faulks")) {
    return {
      market: "Ariaria International Market, Aba, Abia",
      landmark: withSpecific("Faulks Road Gate, near A-Line Leather Section"),
      lat: 5.1278,
      lng: 7.3392,
      mapX: 76,
      mapY: 66,
    };
  }
  if (text.includes("ogbete") || text.includes("enugu")) {
    return {
      market: "Ogbete Main Market, Enugu",
      landmark: withSpecific("Near Holy Ghost Cathedral & Peace Mass Park"),
      lat: 6.4413,
      lng: 7.4988,
      mapX: 78,
      mapY: 55,
    };
  }

  // 4. Oyo State & South-West Hubs
  if (text.includes("bodija") || text.includes("dugbe") || text.includes("gbagi") || text.includes("ibadan") || text.includes("ogunpa")) {
    return {
      market: "Bodija Market, Ibadan, Oyo State",
      landmark: withSpecific("Near Bodija Railway Station & Foodstuff Depot"),
      lat: 7.4345,
      lng: 3.9042,
      mapX: 38,
      mapY: 34,
    };
  }

  // 5. Abuja (FCT) Hubs
  if (text.includes("wuse") || text.includes("utako") || text.includes("garki") || text.includes("abuja") || text.includes("banex")) {
    return {
      market: "Wuse Modern Market, Abuja FCT",
      landmark: withSpecific("Kashim Ibrahim Way Gate, Wuse Zone 5"),
      lat: 9.0643,
      lng: 7.4665,
      mapX: 58,
      mapY: 38,
    };
  }

  // 6. Rivers & South-South Hubs
  if (text.includes("oil mill") || text.includes("mile 1") || text.includes("port harcourt") || text.includes("trans amadi") || text.includes("rivers")) {
    return {
      market: "Oil Mill / Mile 1 Market, Port Harcourt",
      landmark: withSpecific("Aba-Port Harcourt Expressway Flyover Junction"),
      lat: 4.8431,
      lng: 7.0398,
      mapX: 70,
      mapY: 82,
    };
  }

  // 7. Plateau State
  if (text.includes("terminus") || text.includes("jos") || text.includes("plateau")) {
    return {
      market: "Terminus Main Market, Jos, Plateau",
      landmark: withSpecific("Ahmadu Bello Way, Jos Central"),
      lat: 9.9285,
      lng: 8.8921,
      mapX: 68,
      mapY: 32,
    };
  }

  // 8. Kaduna State
  if (text.includes("kaduna") || text.includes("sheikh gumi") || text.includes("kasuwan barci")) {
    return {
      market: "Sheikh Gumi Central Market, Kaduna",
      landmark: withSpecific("Ahmadu Bello Way / Station Roundabout, Kaduna"),
      lat: 10.5105,
      lng: 7.4165,
      mapX: 55,
      mapY: 26,
    };
  }

  // 9. Edo State
  if (text.includes("benin") || text.includes("oba market") || text.includes("edo")) {
    return {
      market: "Oba Market, Benin City, Edo State",
      landmark: withSpecific("Ring Road Roundabout, opposite Oba's Palace"),
      lat: 6.3382,
      lng: 5.6258,
      mapX: 60,
      mapY: 64,
    };
  }

  // 10. Delta State
  if (text.includes("asaba") || text.includes("warri") || text.includes("delta") || text.includes("ogbeogonogo")) {
    return {
      market: "Ogbeogonogo / Igbudu Market, Delta State",
      landmark: withSpecific("Nnebisi Road / Warri Sapele Road Axis"),
      lat: 6.1982,
      lng: 6.7328,
      mapX: 64,
      mapY: 70,
    };
  }

  // ── DYNAMIC EXTRACTION FOR CUSTOM ADDRESSES ──
  // Extract clean landmark and location centroid from trader's real custom address anywhere in Nigeria
  const dynamicMapX = hashStringToRange(addressOrMarket || "default", 28, 72);
  const dynamicMapY = hashStringToRange(addressOrMarket || "default_y", 28, 72);

  // Detect state / city coordinates across all 36 States + FCT
  let lat = 9.0765; // Nigeria Central Centroid (Abuja)
  let lng = 7.3986;
  let defaultX = dynamicMapX;
  let defaultY = dynamicMapY;

  // North-West
  if (text.includes("kano")) {
    lat = 12.0022; lng = 8.5291; defaultX = 64; defaultY = 16;
  } else if (text.includes("kaduna")) {
    lat = 10.5105; lng = 7.4165; defaultX = 54; defaultY = 28;
  } else if (text.includes("katsina")) {
    lat = 12.9908; lng = 7.6018; defaultX = 58; defaultY = 12;
  } else if (text.includes("sokoto")) {
    lat = 13.0059; lng = 5.2476; defaultX = 35; defaultY = 12;
  } else if (text.includes("kebbi") || text.includes("birnin kebbi")) {
    lat = 12.4539; lng = 4.1975; defaultX = 25; defaultY = 18;
  } else if (text.includes("zamfara") || text.includes("gusau")) {
    lat = 12.1628; lng = 6.6614; defaultX = 46; defaultY = 16;
  } else if (text.includes("jigawa") || text.includes("dutse")) {
    lat = 11.7583; lng = 9.3389; defaultX = 72; defaultY = 18;
  // North-East
  } else if (text.includes("maiduguri") || text.includes("borno")) {
    lat = 11.8333; lng = 13.1500; defaultX = 88; defaultY = 18;
  } else if (text.includes("bauchi")) {
    lat = 10.3158; lng = 9.8442; defaultX = 75; defaultY = 28;
  } else if (text.includes("gombe")) {
    lat = 10.2897; lng = 11.1673; defaultX = 82; defaultY = 29;
  } else if (text.includes("adamawa") || text.includes("yola") || text.includes("jimeta")) {
    lat = 9.2035; lng = 12.4954; defaultX = 86; defaultY = 40;
  } else if (text.includes("taraba") || text.includes("jalingo")) {
    lat = 8.8937; lng = 11.3596; defaultX = 80; defaultY = 48;
  } else if (text.includes("yobe") || text.includes("damaturu")) {
    lat = 11.7470; lng = 11.9608; defaultX = 84; defaultY = 16;
  // North-Central / Middle Belt
  } else if (text.includes("abuja") || text.includes("fct")) {
    lat = 9.0765; lng = 7.3986; defaultX = 54; defaultY = 38;
  } else if (text.includes("jos") || text.includes("plateau")) {
    lat = 9.9285; lng = 8.8921; defaultX = 68; defaultY = 32;
  } else if (text.includes("minna") || text.includes("niger state") || text.includes("suleja")) {
    lat = 9.6139; lng = 6.5569; defaultX = 44; defaultY = 36;
  } else if (text.includes("benue") || text.includes("makurdi") || text.includes("gboko")) {
    lat = 7.7322; lng = 8.5218; defaultX = 66; defaultY = 52;
  } else if (text.includes("kogi") || text.includes("lokoja") || text.includes("okene")) {
    lat = 7.8023; lng = 6.7430; defaultX = 52; defaultY = 52;
  } else if (text.includes("nasarawa") || text.includes("lafia") || text.includes("karu")) {
    lat = 8.4932; lng = 8.5153; defaultX = 62; defaultY = 44;
  } else if (text.includes("ilorin") || text.includes("kwara")) {
    lat = 8.4966; lng = 4.5421; defaultX = 36; defaultY = 48;
  // South-West
  } else if (text.includes("lagos") || text.includes("ikeja") || text.includes("lekki") || text.includes("surulere")) {
    lat = 6.5244; lng = 3.3792; defaultX = 30; defaultY = 70;
  } else if (text.includes("ibadan") || /\boyo\b/i.test(text)) {
    lat = 7.3775; lng = 3.9470; defaultX = 35; defaultY = 62;
  } else if (text.includes("abeokuta") || text.includes("ogun") || text.includes("sagamu") || text.includes("ijebu")) {
    lat = 7.1557; lng = 3.3458; defaultX = 31; defaultY = 64;
  } else if (text.includes("akure") || text.includes("ondo")) {
    lat = 7.2571; lng = 5.2058; defaultX = 44; defaultY = 62;
  } else if (text.includes("osogbo") || text.includes("osun") || text.includes("ilesa") || text.includes("ife")) {
    lat = 7.7827; lng = 4.5418; defaultX = 39; defaultY = 58;
  } else if (text.includes("ado") || text.includes("ekiti")) {
    lat = 7.6211; lng = 5.2215; defaultX = 43; defaultY = 59;
  // South-East
  } else if (text.includes("onitsha") || text.includes("anambra") || text.includes("awka") || text.includes("nnewi")) {
    lat = 6.1519; lng = 6.7758; defaultX = 64; defaultY = 68;
  } else if ((/\baba\b/i.test(text) && !text.includes("calabar")) || text.includes("abia") || text.includes("umuahia")) {
    lat = 5.1278; lng = 7.3392; defaultX = 68; defaultY = 75;
  } else if (text.includes("enugu") || text.includes("nsukka")) {
    lat = 6.4413; lng = 7.4988; defaultX = 68; defaultY = 62;
  } else if (text.includes("owerri") || text.includes("imo")) {
    lat = 5.4832; lng = 7.0358; defaultX = 66; defaultY = 73;
  } else if (text.includes("abakaliki") || text.includes("ebonyi")) {
    lat = 6.3249; lng = 8.1137; defaultX = 74; defaultY = 64;
  // South-South
  } else if (text.includes("port harcourt") || text.includes("rivers") || text.includes("obio-akpor")) {
    lat = 4.8156; lng = 7.0498; defaultX = 65; defaultY = 82;
  } else if (text.includes("benin") || /\bedo\b/i.test(text)) {
    lat = 6.3382; lng = 5.6258; defaultX = 52; defaultY = 68;
  } else if (text.includes("warri") || text.includes("asaba") || text.includes("delta")) {
    lat = 5.5174; lng = 5.7501; defaultX = 55; defaultY = 76;
  } else if (text.includes("calabar") || text.includes("cross river")) {
    lat = 4.9757; lng = 8.3417; defaultX = 78; defaultY = 80;
  } else if (text.includes("uyo") || text.includes("eket") || text.includes("akwa ibom")) {
    lat = 5.0377; lng = 7.9128; defaultX = 72; defaultY = 82;
  } else if (text.includes("yenagoa") || text.includes("bayelsa")) {
    lat = 4.9267; lng = 6.2676; defaultX = 58; defaultY = 84;
  }

  const cleanMarket = (addressOrMarket || "").trim() || "Commercial Trading Market, Nigeria";

  return {
    market: cleanMarket,
    landmark: dynamicLandmark,
    lat,
    lng,
    mapX: defaultX,
    mapY: defaultY,
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
 * Synchronizes the logged-in merchant's active profile and real address across the entire app
 */
export function getCurrentUserVendor(user?: {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
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

  const isExplicitDemoMamaChidi =
    activeUser?.id === "user_owner_01" ||
    (activeUser?.name === "Mama Chidi" &&
      activeUser?.businessName === "Mama Chidi Super Provisions" &&
      (!activeUser.marketLocation || activeUser.marketLocation.includes("Balogun")));

  const hasCustomLocation = Boolean(activeUser?.marketLocation?.trim() && !activeUser.marketLocation.toLowerCase().includes("balogun") && activeUser.marketLocation !== "Commercial Market Stall, Nigeria");
  const shopId = activeUser?.id || (activeUser?.name ? `usr_${activeUser.name.toLowerCase().replace(/\s+/g, "_")}` : "usr_merchant");
  const shopName =
    activeUser?.businessName ||
    (activeUser?.name ? `${activeUser.name}'s Shop` : "Registered Merchant Stall");
  const traderName = activeUser?.name || "Registered Merchant";
  const fullAddress =
    activeUser?.marketLocation?.trim() ||
    "Commercial Market Stall, Nigeria";
  const avatarUrl = activeUser?.avatarUrl || "/images/traders/mama_chidi.jpg";

  const resolved = resolveMarketCoordinates(fullAddress);
  const displayMarket = hasCustomLocation ? resolved.market : shopName;
  const category = inferCategory(shopName);
  const tags = getCategoryTags(category);

  // Phone and WhatsApp resolution for real trader without leaking Mama Chidi
  let phone = activeUser?.phone || "";
  if (!phone && activeUser?.email && /^(\+?234|0)\d{9,10}$/.test(activeUser.email.replace(/\s+/g, ""))) {
    phone = activeUser.email.trim();
  }
  if (!phone) {
    phone = "+234 800 000 0000";
  }

  const cleanDigits = phone.replace(/\D/g, "");
  const whatsapp = cleanDigits.startsWith("0") ? `234${cleanDigits.slice(1)}` : cleanDigits || "2348000000000";

  const vendorProfile: VendorProfile = {
    id: shopId,
    name: traderName,
    shopName,
    category,
    market: displayMarket,
    fullAddress,
    landmark: resolved.landmark,
    phone,
    whatsapp,
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
    tags,
  };

  saveCustomVendor(vendorProfile);
  return vendorProfile;
}

// ── 3. CLIENT STORE ACCESS METHODS ──────────────────────────────────
export function getAllVendors(): VendorProfile[] {
  const custom = Object.values(getCustomVendors());
  const activeUserVendor = getCurrentUserVendor();
  
  // Combine real registered custom vendors and active user vendor, deduplicated by id and shopName
  const vendorMap = new Map<string, VendorProfile>();
  const seenShopNames = new Set<string>();
  
  // Put active user vendor first
  if (activeUserVendor) {
    vendorMap.set(activeUserVendor.id, activeUserVendor);
    seenShopNames.add(activeUserVendor.shopName.toLowerCase().trim());
  }
  
  // Add other real custom registered vendors, preventing duplicates of the logged-in trader
  custom.forEach((v) => {
    const normShop = v.shopName.toLowerCase().trim();
    const isSameAsActive =
      activeUserVendor &&
      (v.id === activeUserVendor.id ||
      seenShopNames.has(normShop) ||
      (v.name.toLowerCase().trim() === activeUserVendor.name.toLowerCase().trim() && activeUserVendor.name !== "Mama Chidi"));

    if (!isSameAsActive && !vendorMap.has(v.id)) {
      seenShopNames.add(normShop);
      vendorMap.set(v.id, v);
    }
  });

  return Array.from(vendorMap.values());
}

export function getVendor(
  id?: string | null,
  fallbackMeta?: {
    name?: string;
    shopName?: string;
    marketLocation?: string;
    phone?: string;
  }
): VendorProfile {
  if (!id) return getCurrentUserVendor();

  const custom = getCustomVendors();
  if (custom[id]) {
    // If fallbackMeta has more accurate address or name, update it
    if (fallbackMeta?.marketLocation && fallbackMeta.marketLocation !== custom[id].fullAddress) {
      const resolved = resolveMarketCoordinates(fallbackMeta.marketLocation);
      custom[id].fullAddress = fallbackMeta.marketLocation;
      custom[id].market = resolved.market;
      custom[id].landmark = resolved.landmark;
      custom[id].coordinates = {
        lat: resolved.lat,
        lng: resolved.lng,
        mapX: resolved.mapX,
        mapY: resolved.mapY,
      };
      saveCustomVendor(custom[id]);
    }
    return custom[id];
  }

  const activeUserVendor = getCurrentUserVendor();
  if (id === activeUserVendor.id || id === "current" || id === "my_shop" || id === "user_owner_01") {
    return activeUserVendor;
  }

  if (INITIAL_VENDORS[id]) {
    return INITIAL_VENDORS[id];
  }

  // If fallback metadata is provided (e.g. from URL query params or stand props):
  if (fallbackMeta?.marketLocation || fallbackMeta?.shopName) {
    const fullAddress = fallbackMeta.marketLocation || "Commercial Stall, Lagos, Nigeria";
    const resolved = resolveMarketCoordinates(fullAddress);
    const shopName = fallbackMeta.shopName || `${fallbackMeta.name || "Merchant"}'s Shop`;
    const traderName = fallbackMeta.name || "Shop Owner";
    
    const phone = fallbackMeta.phone || "+234 800 000 0000";
    const cleanDigits = phone.replace(/\D/g, "");
    const whatsapp = cleanDigits.startsWith("0") ? `234${cleanDigits.slice(1)}` : cleanDigits || "2348000000000";

    const dynamicVendor: VendorProfile = {
      id,
      name: traderName,
      shopName,
      category: inferCategory(shopName),
      market: resolved.market,
      fullAddress,
      landmark: resolved.landmark,
      phone,
      whatsapp,
      image: "/images/traders/mama_chidi.jpg",
      code: `MP-${id.replace(/[^a-zA-Z0-9]/g, "").slice(-5).toUpperCase() || "84920"}`,
      coordinates: {
        lat: resolved.lat,
        lng: resolved.lng,
        mapX: resolved.mapX,
        mapY: resolved.mapY,
      },
      openingHours: "Mon - Sat: 7:30 AM - 6:30 PM",
      verified: true,
      tags: ["Verified Shop", "Fair Market Price", "Fast Transfer Confirmation"],
    };

    saveCustomVendor(dynamicVendor);
    return dynamicVendor;
  }

  return activeUserVendor;
}

export function getAllReviews(): CustomerReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
      average: 0,
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
  
  const params = new URLSearchParams();
  params.set("shop", vendor.id);
  if (vendor.shopName) params.set("name", vendor.shopName);
  if (vendor.name) params.set("trader", vendor.name);
  if (vendor.fullAddress) params.set("loc", vendor.fullAddress);

  const queryStr = params.toString();
  const reviewUrl = `${baseUrl}/rate?${queryStr}`;
  const profileUrl = `${baseUrl}/vendors/${encodeURIComponent(vendor.id)}?${queryStr}`;
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
