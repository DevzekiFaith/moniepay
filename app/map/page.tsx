"use client";

// ─────────────────────────────────────────────────────────────────
// MoniePay — Public Business & Vendor Discovery Map
// Fast, Lightweight, Mobile-First • Fixed Business Locations • Directions
// ─────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  Store,
  Navigation,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Phone,
  MessageCircle,
  Clock,
  Layers,
  List,
  Compass,
  X,
  ThumbsUp,
  Award,
  Crosshair,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MoniePayMark } from "@/components/ui/MoniePayLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  getAllVendors,
  INITIAL_VENDORS,
  getVendor,
  calculateVendorStats,
  VendorProfile,
} from "@/lib/reviews/vendorStore";
import {
  calculateHaversineDistanceKm,
  requestDeviceCoordinates,
  findNearestNigerianHub,
} from "@/lib/geo/geolocation";

const CATEGORIES = [
  "All Categories",
  "Provisions & Groceries",
  "Wholesale Foodstuff & Grains",
  "Electronics & Gadgets",
  "Fabrics, Lace & Aso-Ebi",
];

const REGIONS = [
  { id: "ALL", name: "All Nigeria", short: "All Nigeria" },
  { id: "NORTH", name: "Northern Belt", short: "North (Kano/Jos/Kaduna)" },
  { id: "CENTRAL", name: "Abuja & Middle Belt", short: "Abuja / FCT" },
  { id: "EAST", name: "Eastern Axis", short: "East (Onitsha/Aba)" },
  { id: "SOUTH_SOUTH", name: "South-South Hubs", short: "South-South (PH/Warri)" },
  { id: "SOUTH_WEST", name: "South-West Corridors", short: "South-West (Lagos/Ibadan)" },
];

const MARKETS = [
  "All Markets Across Nigeria",
  "Wuse & Utako Markets, Abuja FCT",
  "Dawanau & Singer Grains Depots, Kano",
  "Onitsha Main & Relief Markets, Anambra",
  "Ariaria International Market, Aba",
  "Bodija & Dugbe Markets, Ibadan",
  "Oil Mill & Mile 1 Markets, Port Harcourt",
  "Balogun & Alaba Markets, Lagos",
  "Terminus Market, Jos",
  "Sheikh Gumi Central Market, Kaduna",
];

function VendorMapContent() {
  const searchParams = useSearchParams();
  const initialVendorId = searchParams?.get("vendor") || null;

  // Initialize with deterministic seed data during SSR to guarantee 100% hydration match,
  // then hydrate with active user session/custom vendors in useEffect on client mount
  const [vendors, setVendors] = useState<VendorProfile[]>(() => Object.values(INITIAL_VENDORS));
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
    setVendors(getAllVendors());

    const handleUpdate = () => setVendors(getAllVendors());
    window.addEventListener("moniepay:vendors-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("moniepay:vendors-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(initialVendorId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedMarket, setSelectedMarket] = useState("All Markets Across Nigeria");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // GPS Device Geolocation State
  const [userGps, setUserGps] = useState<{
    lat: number;
    lng: number;
    mapX: number;
    mapY: number;
    hubName: string;
    distanceKm: number;
  } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  const handleLocateUser = async () => {
    setIsLocatingUser(true);
    setGpsNotice(null);
    try {
      const coords = await requestDeviceCoordinates();
      const { hub, distanceKm } = findNearestNigerianHub(coords.lat, coords.lng);
      setUserGps({
        lat: coords.lat,
        lng: coords.lng,
        mapX: hub.mapX,
        mapY: hub.mapY,
        hubName: `${hub.name}, ${hub.state}`,
        distanceKm,
      });
      setSortByDistance(true);
      setGpsNotice(`GPS Active: Nearest commercial hub is ${hub.name} (~${distanceKm} km away)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not retrieve GPS coordinates.";
      setGpsNotice(msg);
    } finally {
      setIsLocatingUser(false);
    }
  };

  useEffect(() => {
    if (initialVendorId) {
      setSelectedVendorId(initialVendorId);
    }
  }, [initialVendorId]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    const list = vendors.filter((v) => {
      const matchSearch =
        !searchQuery.trim() ||
        v.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === "All Categories" || v.category === selectedCategory;

      const matchRegion = (() => {
        if (selectedRegion === "ALL") return true;
        const m = (v.market + " " + v.fullAddress + " " + v.landmark).toLowerCase();
        if (selectedRegion === "NORTH") {
          return (
            m.includes("kano") ||
            m.includes("kaduna") ||
            m.includes("jos") ||
            m.includes("plateau") ||
            m.includes("katsina") ||
            m.includes("sokoto") ||
            m.includes("borno") ||
            m.includes("maiduguri") ||
            m.includes("bauchi") ||
            m.includes("gombe") ||
            m.includes("yobe") ||
            m.includes("kebbi") ||
            m.includes("zamfara") ||
            m.includes("jigawa") ||
            m.includes("taraba") ||
            m.includes("adamawa") ||
            m.includes("dawanau") ||
            m.includes("singer")
          );
        }
        if (selectedRegion === "CENTRAL") {
          return (
            m.includes("abuja") ||
            m.includes("fct") ||
            m.includes("wuse") ||
            m.includes("utako") ||
            m.includes("garki") ||
            m.includes("minna") ||
            m.includes("niger") ||
            m.includes("benue") ||
            m.includes("makurdi") ||
            m.includes("kogi") ||
            m.includes("lokoja") ||
            m.includes("kwara") ||
            m.includes("ilorin") ||
            m.includes("nasarawa")
          );
        }
        if (selectedRegion === "EAST") {
          return (
            m.includes("onitsha") ||
            m.includes("anambra") ||
            m.includes("aba") ||
            m.includes("abia") ||
            m.includes("ariaria") ||
            m.includes("enugu") ||
            m.includes("ogbete") ||
            m.includes("owerri") ||
            m.includes("imo") ||
            m.includes("abakaliki") ||
            m.includes("ebonyi")
          );
        }
        if (selectedRegion === "SOUTH_SOUTH") {
          return (
            m.includes("port harcourt") ||
            m.includes("rivers") ||
            m.includes("oil mill") ||
            m.includes("benin") ||
            m.includes("edo") ||
            m.includes("warri") ||
            m.includes("delta") ||
            m.includes("asaba") ||
            m.includes("calabar") ||
            m.includes("cross river") ||
            m.includes("uyo") ||
            m.includes("akwa ibom") ||
            m.includes("bayelsa") ||
            m.includes("yenagoa")
          );
        }
        if (selectedRegion === "SOUTH_WEST") {
          return (
            m.includes("lagos") ||
            m.includes("balogun") ||
            m.includes("alaba") ||
            m.includes("mile 12") ||
            m.includes("ibadan") ||
            m.includes("bodija") ||
            m.includes("oyo") ||
            m.includes("ogun") ||
            m.includes("abeokuta") ||
            m.includes("akure") ||
            m.includes("ondo") ||
            m.includes("osun") ||
            m.includes("ekiti")
          );
        }
        return true;
      })();

      const matchMarket =
        selectedMarket === "All Markets Across Nigeria" ||
        selectedMarket === "All Markets" ||
        v.market.toLowerCase().includes(selectedMarket.split(",")[0].toLowerCase().trim()) ||
        selectedMarket.toLowerCase().includes(v.market.toLowerCase().split(",")[0].trim());

      return matchSearch && matchCategory && matchRegion && matchMarket;
    });

    if (sortByDistance && userGps) {
      return [...list].sort((a, b) => {
        const distA = calculateHaversineDistanceKm(userGps.lat, userGps.lng, a.coordinates.lat, a.coordinates.lng);
        const distB = calculateHaversineDistanceKm(userGps.lat, userGps.lng, b.coordinates.lat, b.coordinates.lng);
        return distA - distB;
      });
    }

    return list;
  }, [vendors, searchQuery, selectedCategory, selectedRegion, selectedMarket, sortByDistance, userGps]);

  // Precompute vendor review stats to avoid recomputing during touch scroll gestures
  const vendorStatsMap = useMemo(() => {
    const map = new Map<string, { average: number; total: number }>();
    for (const v of vendors) {
      map.set(v.id, calculateVendorStats(v.id));
    }
    return map;
  }, [vendors]);

  const activeVendor = selectedVendorId
    ? vendors.find((v) => v.id === selectedVendorId) || filteredVendors[0]
    : filteredVendors[0];

  const activeStats = activeVendor ? vendorStatsMap.get(activeVendor.id) || null : null;

  return (
    <div className="min-h-screen bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
            <MoniePayMark size={32} />
            <div>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                MoniePay
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 block leading-none">
                Vendor Map
              </span>
            </div>
          </Link>

          {/* Search Input in Navbar */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shop across Nigeria (Wuse, Dawanau, Onitsha, Ariaria, Balogun)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl clay-input text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* GPS Locate Me Button */}
            <button
              type="button"
              onClick={handleLocateUser}
              disabled={isLocatingUser}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                sortByDistance && userGps
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-white/10 hover:border-emerald-400"
              }`}
              title="Detect my GPS location and show nearby shops"
            >
              {isLocatingUser ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Crosshair className={`h-3.5 w-3.5 ${sortByDistance && userGps ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
              )}
              <span className="text-[11px] font-black hidden sm:inline">
                {userGps ? "Near Me Active" : "Near Me GPS"}
              </span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "map"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs"
                    : "text-slate-500"
                }`}
                title="Map View"
              >
                <Compass className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs"
                    : "text-slate-500"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 relative sm:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trader, market or category..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl clay-input text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="max-w-5xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-bold text-[11px] transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-blue-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Nationwide Regional Filter Pills */}
        <div className="max-w-5xl mx-auto flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs border-t border-slate-200/50 dark:border-white/5 mt-1">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 shrink-0 uppercase tracking-wider mr-1">
            Zone:
          </span>
          {REGIONS.map((r) => {
            const isSelected = selectedRegion === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRegion(r.id)}
                className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap font-black text-[10.5px] transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-emerald-400"
                }`}
              >
                {r.short}
              </button>
            );
          })}
        </div>

        {/* GPS Active Notice Banner */}
        {gpsNotice && (
          <div className="max-w-5xl mx-auto mt-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-1.5">
              <Crosshair className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{gpsNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => { setGpsNotice(null); setSortByDistance(false); }}
              className="text-emerald-700 dark:text-emerald-300 hover:underline text-[10.5px] font-black shrink-0 cursor-pointer ml-2"
            >
              Reset GPS
            </button>
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ── LEFT / MAIN: INTERACTIVE MARKET MAP STAGE (7 COLS ON DESKTOP) ── */}
        <div className={`lg:col-span-7 space-y-3 ${viewMode === "list" ? "hidden lg:block" : "block"}`}>
          {/* Visual Interactive All-Nigeria Commercial Hubs SVG Canvas */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-[28px] overflow-hidden bg-slate-900 border-2 border-white dark:border-slate-800 shadow-2xl relative">
            {/* Ambient Map Grid Background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="market-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(148, 163, 184, 0.22)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#market-grid)" />
            </svg>

            {/* Authentic Nigeria Rivers & Commercial Trade Arteries (Niger-Benue Confluence & Atlantic Coast) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Atlantic Ocean / Bight of Benin / Biafra Coastline */}
              <path
                d="M 0 88 Q 28 85 52 90 T 100 89 L 100 100 L 0 100 Z"
                fill="#0a192f"
                opacity="0.9"
              />
              <path
                d="M 0 88 Q 28 85 52 90 T 100 89"
                fill="none"
                stroke="#0284c7"
                strokeWidth="1.2"
                opacity="0.6"
              />

              {/* River Niger (North-West entering down to Lokoja Confluence) */}
              <path
                d="M 18 24 Q 32 38 42 46 T 52 54"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="4 2"
                opacity="0.45"
              />

              {/* River Benue (North-East entering to meet River Niger at Lokoja) */}
              <path
                d="M 90 38 Q 74 46 63 50 T 52 54"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="4 2"
                opacity="0.45"
              />

              {/* Combined River Niger Southward to Niger Delta */}
              <path
                d="M 52 54 Q 54 68 53 78 Q 49 85 45 92"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                opacity="0.5"
              />
              <path
                d="M 53 78 Q 59 84 66 92"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                opacity="0.4"
              />

              {/* Lokoja Confluence Node Indicator */}
              <circle cx="52" cy="54" r="2.2" fill="#38bdf8" opacity="0.7" />
              <circle cx="52" cy="54" r="5" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" />
            </svg>

            {/* Stylized Nationwide Region Watermarks */}
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between text-[9.5px] font-black tracking-widest text-slate-500/40 select-none">
              <div className="flex justify-between items-start">
                <span>NORTH-WEST (KANO / SOKOTO)</span>
                <span>NORTH-EAST (MAIDUGURI / BAUCHI)</span>
              </div>
              <div className="flex justify-center items-center gap-2 text-slate-400/50">
                <span>• ABUJA FCT • LOKOJA CONFLUENCE •</span>
              </div>
              <div className="flex justify-between items-end pb-3">
                <span>SOUTH-WEST (LAGOS / IBADAN)</span>
                <span>SOUTH-EAST (ONITSHA / ABA) • NIGER DELTA</span>
              </div>
            </div>

            {/* Market Area Landmarks Overlays */}
            <div className="absolute top-3 left-3 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-slate-900/95 text-sky-300 text-[10px] font-black border border-sky-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All-Nigeria Commercial Trading Grid • 36 States & FCT</span>
              </span>
            </div>

            <div
              suppressHydrationWarning
              className="absolute bottom-2.5 left-3 text-[10px] text-slate-300 font-bold pointer-events-none bg-slate-950/90 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10 shadow-md"
            >
              Nationwide Verified Merchants • {filteredVendors.length} Active Shops
            </div>

            {/* ── REAL-TIME USER GPS RADAR BEACON ── */}
            {userGps && (
              <div
                style={{
                  left: `${userGps.mapX}%`,
                  top: `${userGps.mapY}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none"
              >
                <div className="relative flex flex-col items-center">
                  <span className="absolute -inset-2.5 rounded-full bg-emerald-400/40 animate-ping" />
                  <div className="h-7 w-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-xs">
                    📍
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-950/95 text-emerald-200 border border-emerald-400/60 text-[9px] font-black shadow-lg whitespace-nowrap">
                    You Are Here
                  </span>
                </div>
              </div>
            )}

            {/* ── INTERACTIVE VENDOR MAP PINS ── */}
            {filteredVendors.map((vendor) => {
              const isSelected = selectedVendorId === vendor.id;
              const stats = calculateVendorStats(vendor.id);
              const distanceKm = userGps
                ? calculateHaversineDistanceKm(userGps.lat, userGps.lng, vendor.coordinates.lat, vendor.coordinates.lng)
                : null;
              return (
                <div
                  key={vendor.id}
                  style={{
                    left: `${vendor.coordinates.mapX}%`,
                    top: `${vendor.coordinates.mapY}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedVendorId(vendor.id)}
                    className={`group relative flex flex-col items-center cursor-pointer transition-transform ${
                      isSelected ? "scale-115 z-30" : "hover:scale-105"
                    }`}
                  >
                    {/* Floating Shop Label Chip */}
                    <div
                      className={`px-2.5 py-1 rounded-xl whitespace-nowrap text-[10.5px] font-black shadow-lg flex items-center gap-1 mb-1 transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white ring-2 ring-white scale-105"
                          : "bg-slate-900/90 text-slate-100 hover:bg-slate-800 border border-white/20"
                      }`}
                    >
                      <span>{vendor.shopName.split(" ")[0]}</span>
                      <span className="flex items-center text-amber-300 font-black text-[9.5px]">
                        ★ {stats.average}
                      </span>
                      {distanceKm !== null && (
                        <span className="text-emerald-300 font-bold text-[9px]">
                          • {distanceKm}km
                        </span>
                      )}
                    </div>

                    {/* Pin Icon & Pulse Ring */}
                    <div className="relative">
                      {isSelected && (
                        <span className="absolute -inset-2 rounded-full bg-blue-500/40 animate-ping" />
                      )}
                      <div
                        className={`h-9 w-9 rounded-2xl flex items-center justify-center shadow-xl transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white ring-2 ring-white"
                            : "bg-white text-slate-900 border border-slate-300"
                        }`}
                      >
                        <Store className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Info Box under Map */}
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-xs flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tap any pin to see shop reviews, verified stall landmark & directions</span>
            </span>
            <span
              suppressHydrationWarning
              className="text-[11px] font-black text-blue-600 dark:text-sky-400"
            >
              {filteredVendors.length} found
            </span>
          </div>
        </div>

        {/* ── RIGHT: ACTIVE VENDOR PREVIEW CARD & VENDOR DIRECTORY (5 COLS) ── */}
        <div className="lg:col-span-5 space-y-3">
          {/* Active Vendor Highlight Card */}
          {activeVendor && (
            <motion.div
              key={activeVendor.id}
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="clay-card p-4 sm:p-5 space-y-3.5 bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-white/10 shadow-xl rounded-[24px] sm:rounded-[28px]"
            >
              {/* Card Header */}
              <div className="flex items-start gap-3.5">
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
                  <img
                    src={activeVendor.image}
                    alt={activeVendor.shopName}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                    <span className="px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase">
                      {activeVendor.category.split("&")[0]}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9.5px] font-bold flex items-center gap-0.5">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Verified
                    </span>
                    {userGps && (
                      <span className="px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 text-[9.5px] font-black flex items-center gap-1">
                        <Navigation className="h-2.5 w-2.5" />
                        {calculateHaversineDistanceKm(userGps.lat, userGps.lng, activeVendor.coordinates.lat, activeVendor.coordinates.lng)} km away
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug truncate">
                    {activeVendor.shopName}
                  </h3>

                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{activeStats?.average} pts</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({activeStats?.total} verified reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Address & Landmark */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-white/10 space-y-1 text-xs">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>{activeVendor.fullAddress}</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  <strong>Landmark:</strong> {activeVendor.landmark}
                </p>
              </div>

              {/* Action Buttons: View Profile + Get Directions + Review */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/vendors/${activeVendor.id}`}
                    className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>View Full Profile</span>
                  </Link>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      activeVendor.fullAddress || `${activeVendor.coordinates.lat},${activeVendor.coordinates.lng}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all text-center"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>Get Directions</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/rate?shop=${activeVendor.id}`}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Leave Review</span>
                  </Link>

                  <a
                    href={`https://wa.me/${activeVendor.whatsapp}?text=Hello%20${encodeURIComponent(activeVendor.name)}!%20I%20found%20your%20shop%20on%20MoniePay.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Directory List of All Matching Vendors */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between px-1 flex-wrap gap-1.5 pb-0.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h4
                  suppressHydrationWarning
                  className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider"
                >
                  All Verified Market Stalls ({filteredVendors.length})
                </h4>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[9.5px] border border-emerald-300 dark:border-emerald-800 shadow-2xs whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Verified Live Traders 🇳🇬</span>
              </span>
            </div>

            {/* Glitch-free scrolling: Natural document scroll on mobile phones, smooth max-height scrollbox on tablets/desktops */}
            <div className="space-y-2.5 sm:max-h-[520px] sm:overflow-y-auto pr-0 sm:pr-1 overscroll-contain [-webkit-overflow-scrolling:touch] touch-pan-y">
              {filteredVendors.map((vendor) => {
                const isSelected = selectedVendorId === vendor.id;
                const stats = vendorStatsMap.get(vendor.id) || { average: 5, total: 0 };
                const distanceKm = userGps
                  ? calculateHaversineDistanceKm(userGps.lat, userGps.lng, vendor.coordinates.lat, vendor.coordinates.lng)
                  : null;

                return (
                  <div
                    key={vendor.id}
                    onClick={() => {
                      setSelectedVendorId(vendor.id);
                      if (viewMode === "list") setViewMode("map");
                    }}
                    className={`p-3 rounded-2xl border transition-colors cursor-pointer flex items-center gap-3 touch-manipulation ${
                      isSelected
                        ? "bg-blue-50/95 dark:bg-blue-950/80 border-blue-500 dark:border-blue-600 shadow-sm ring-1 ring-blue-500/30"
                        : "bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800/90 border-slate-200/80 dark:border-white/10 shadow-2xs"
                    }`}
                  >
                    {/* Trader Avatar with Live Badge */}
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700">
                      <img
                        src={vendor.image}
                        alt={vendor.shopName}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/traders/mama_chidi.jpg";
                        }}
                      />
                      <span
                        className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs"
                        title="Verified Live Trader Online"
                      />
                    </div>

                    {/* Trader Info & Verified Live Badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate leading-tight">
                          {vendor.shopName}
                        </p>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-[9px] border border-emerald-200 dark:border-emerald-800/80 whitespace-nowrap">
                          <ShieldCheck className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Verified Live Trader</span>
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{vendor.name}</span>
                        <span>•</span>
                        <span className="truncate">{vendor.market}</span>
                        {distanceKm !== null && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">{distanceKm}km</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Review Ratings Badge */}
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-black text-[11px]">
                        ★ {stats.average}
                      </span>
                      <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block mt-0.5 font-medium">
                        {stats.total} reviews
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VendorMapPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#edf3fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <VendorMapContent />
    </React.Suspense>
  );
}
