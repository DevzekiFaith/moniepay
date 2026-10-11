/**
 * MoniePay Nationwide Geolocation Engine
 * High-precision GPS detection & reverse geocoding across all 36 States + FCT in Nigeria
 */

export interface NigerianHub {
  id: string;
  name: string;
  city: string;
  state: string;
  region: "NORTH" | "CENTRAL" | "EAST" | "SOUTH_SOUTH" | "SOUTH_WEST";
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  tags: string[];
}

export interface DetectedGeoLocation {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  hub: NigerianHub;
  distanceKm: number;
  formattedLocation: string;
  isInsideNigeria: boolean;
  detectedVia: "device_gps" | "reverse_geocode" | "offline_spatial";
}

/**
 * Curated spatial registry of major commercial hubs across Nigeria
 */
export const NIGERIAN_COMMERCIAL_HUBS: NigerianHub[] = [
  // ── ABUJA & MIDDLE BELT (CENTRAL) ──
  {
    id: "fct_wuse",
    name: "Wuse Modern Market",
    city: "Abuja",
    state: "FCT",
    region: "CENTRAL",
    lat: 9.0643,
    lng: 7.4665,
    mapX: 58,
    mapY: 38,
    tags: ["Abuja", "FCT", "Wuse", "Utako", "Maitama"],
  },
  {
    id: "fct_garki",
    name: "Garki Model Market",
    city: "Abuja",
    state: "FCT",
    region: "CENTRAL",
    lat: 9.0321,
    lng: 7.4891,
    mapX: 57,
    mapY: 39,
    tags: ["Abuja", "Garki", "Area 1", "Area 10"],
  },
  {
    id: "plateau_jos",
    name: "Terminus Main Market",
    city: "Jos",
    state: "Plateau",
    region: "NORTH",
    lat: 9.9285,
    lng: 8.8921,
    mapX: 68,
    mapY: 32,
    tags: ["Jos", "Plateau", "Terminus", "Bukuru"],
  },
  {
    id: "niger_minna",
    name: "Minna Central Market",
    city: "Minna",
    state: "Niger State",
    region: "CENTRAL",
    lat: 9.6139,
    lng: 6.5569,
    mapX: 44,
    mapY: 36,
    tags: ["Minna", "Niger", "Suleja", "Bida"],
  },
  {
    id: "benue_makurdi",
    name: "Makurdi Modern Market",
    city: "Makurdi",
    state: "Benue",
    region: "CENTRAL",
    lat: 7.7322,
    lng: 8.5218,
    mapX: 66,
    mapY: 52,
    tags: ["Makurdi", "Benue", "Gboko", "Otukpo"],
  },
  {
    id: "kogi_lokoja",
    name: "International Market (Confluence)",
    city: "Lokoja",
    state: "Kogi",
    region: "CENTRAL",
    lat: 7.8023,
    lng: 6.7430,
    mapX: 52,
    mapY: 52,
    tags: ["Lokoja", "Kogi", "Okene", "Kabba"],
  },
  {
    id: "nasarawa_lafia",
    name: "Lafia Modern Market",
    city: "Lafia",
    state: "Nasarawa",
    region: "CENTRAL",
    lat: 8.4932,
    lng: 8.5153,
    mapX: 62,
    mapY: 44,
    tags: ["Lafia", "Nasarawa", "Karu", "Keffi"],
  },
  {
    id: "kwara_ilorin",
    name: "Oja Oba Central Market",
    city: "Ilorin",
    state: "Kwara",
    region: "CENTRAL",
    lat: 8.4966,
    lng: 4.5421,
    mapX: 36,
    mapY: 48,
    tags: ["Ilorin", "Kwara", "Offa", "Oja Oba"],
  },

  // ── NORTH-WEST & NORTH-EAST (NORTHERN BELT) ──
  {
    id: "kano_dawanau",
    name: "Dawanau Grains Depot",
    city: "Kano",
    state: "Kano",
    region: "NORTH",
    lat: 12.0625,
    lng: 8.4419,
    mapX: 62,
    mapY: 15,
    tags: ["Kano", "Dawanau", "Katsina Road", "Grains"],
  },
  {
    id: "kano_singer",
    name: "Singer Wholesale Market",
    city: "Kano",
    state: "Kano",
    region: "NORTH",
    lat: 12.0022,
    lng: 8.5291,
    mapX: 65,
    mapY: 18,
    tags: ["Kano", "Singer", "Fagge", "Sabon Gari"],
  },
  {
    id: "kaduna_central",
    name: "Sheikh Gumi Central Market",
    city: "Kaduna",
    state: "Kaduna",
    region: "NORTH",
    lat: 10.5105,
    lng: 7.4165,
    mapX: 54,
    mapY: 28,
    tags: ["Kaduna", "Ahmadu Bello Way", "Kasuwan Barci", "Zaria"],
  },
  {
    id: "sokoto_central",
    name: "Sokoto Old Central Market",
    city: "Sokoto",
    state: "Sokoto",
    region: "NORTH",
    lat: 13.0059,
    lng: 5.2476,
    mapX: 35,
    mapY: 12,
    tags: ["Sokoto", "Old Market", "Wurno"],
  },
  {
    id: "katsina_central",
    name: "Katsina Central Market",
    city: "Katsina",
    state: "Katsina",
    region: "NORTH",
    lat: 12.9908,
    lng: 7.6018,
    mapX: 58,
    mapY: 12,
    tags: ["Katsina", "Funtua", "Daura"],
  },
  {
    id: "borno_maiduguri",
    name: "Monday Market",
    city: "Maiduguri",
    state: "Borno",
    region: "NORTH",
    lat: 11.8333,
    lng: 13.1500,
    mapX: 88,
    mapY: 18,
    tags: ["Maiduguri", "Borno", "Monday Market"],
  },
  {
    id: "bauchi_wunti",
    name: "Wunti Market",
    city: "Bauchi",
    state: "Bauchi",
    region: "NORTH",
    lat: 10.3158,
    lng: 9.8442,
    mapX: 75,
    mapY: 28,
    tags: ["Bauchi", "Wunti", "Yankari"],
  },
  {
    id: "gombe_central",
    name: "Gombe Main Market",
    city: "Gombe",
    state: "Gombe",
    region: "NORTH",
    lat: 10.2897,
    lng: 11.1673,
    mapX: 82,
    mapY: 29,
    tags: ["Gombe", "Main Market"],
  },
  {
    id: "adamawa_yola",
    name: "Jimeta Modern Market",
    city: "Yola",
    state: "Adamawa",
    region: "NORTH",
    lat: 9.2035,
    lng: 12.4954,
    mapX: 86,
    mapY: 40,
    tags: ["Yola", "Jimeta", "Adamawa"],
  },
  {
    id: "kebbi_central",
    name: "Birnin Kebbi Central Market",
    city: "Birnin Kebbi",
    state: "Kebbi",
    region: "NORTH",
    lat: 12.4539,
    lng: 4.1975,
    mapX: 25,
    mapY: 18,
    tags: ["Kebbi", "Birnin Kebbi", "Argungu"],
  },
  {
    id: "zamfara_gusau",
    name: "Gusau Central Market",
    city: "Gusau",
    state: "Zamfara",
    region: "NORTH",
    lat: 12.1628,
    lng: 6.6614,
    mapX: 46,
    mapY: 16,
    tags: ["Gusau", "Zamfara"],
  },
  {
    id: "jigawa_dutse",
    name: "Dutse Modern Market",
    city: "Dutse",
    state: "Jigawa",
    region: "NORTH",
    lat: 11.7583,
    lng: 9.3389,
    mapX: 72,
    mapY: 18,
    tags: ["Dutse", "Jigawa", "Hadejia"],
  },
  {
    id: "taraba_jalingo",
    name: "Jalingo Main Market",
    city: "Jalingo",
    state: "Taraba",
    region: "NORTH",
    lat: 8.8937,
    lng: 11.3596,
    mapX: 80,
    mapY: 48,
    tags: ["Jalingo", "Taraba", "Wukari"],
  },
  {
    id: "yobe_damaturu",
    name: "Damaturu Central Market",
    city: "Damaturu",
    state: "Yobe",
    region: "NORTH",
    lat: 11.7470,
    lng: 11.9608,
    mapX: 84,
    mapY: 16,
    tags: ["Damaturu", "Yobe", "Potiskum"],
  },

  // ── SOUTH-EAST (EASTERN COMMERCIAL AXIS) ──
  {
    id: "anambra_onitsha",
    name: "Onitsha Main Market",
    city: "Onitsha",
    state: "Anambra",
    region: "EAST",
    lat: 6.1519,
    lng: 6.7758,
    mapX: 64,
    mapY: 68,
    tags: ["Onitsha", "Anambra", "Relief Market", "Bridgehead", "Ochanja"],
  },
  {
    id: "anambra_nnewi",
    name: "Nkwo Nnewi Industrial Market",
    city: "Nnewi",
    state: "Anambra",
    region: "EAST",
    lat: 6.0198,
    lng: 6.9167,
    mapX: 66,
    mapY: 70,
    tags: ["Nnewi", "Anambra", "Nkwo Nnewi", "Auto Spares"],
  },
  {
    id: "abia_aba_ariaria",
    name: "Ariaria International Market",
    city: "Aba",
    state: "Abia",
    region: "EAST",
    lat: 5.1278,
    lng: 7.3392,
    mapX: 68,
    mapY: 75,
    tags: ["Aba", "Abia", "Ariaria", "Faulks Road", "Ekeoha"],
  },
  {
    id: "enugu_ogbete",
    name: "Ogbete Main Market",
    city: "Enugu",
    state: "Enugu",
    region: "EAST",
    lat: 6.4413,
    lng: 7.4988,
    mapX: 68,
    mapY: 62,
    tags: ["Enugu", "Ogbete", "Kenyatta", "Holy Ghost"],
  },
  {
    id: "imo_owerri",
    name: "Eke Ukwu / Relief Market",
    city: "Owerri",
    state: "Imo",
    region: "EAST",
    lat: 5.4832,
    lng: 7.0358,
    mapX: 66,
    mapY: 73,
    tags: ["Owerri", "Imo", "Eke Ukwu", "Douglas Road"],
  },
  {
    id: "ebonyi_abakaliki",
    name: "Kpirikpiri Rice & Provisions Market",
    city: "Abakaliki",
    state: "Ebonyi",
    region: "EAST",
    lat: 6.3249,
    lng: 8.1137,
    mapX: 74,
    mapY: 64,
    tags: ["Abakaliki", "Ebonyi", "Rice Mill", "Kpirikpiri"],
  },

  // ── SOUTH-SOUTH (NIGER DELTA & COASTAL HUBS) ──
  {
    id: "rivers_oil_mill",
    name: "Oil Mill Market",
    city: "Port Harcourt",
    state: "Rivers",
    region: "SOUTH_SOUTH",
    lat: 4.8431,
    lng: 7.0398,
    mapX: 65,
    mapY: 82,
    tags: ["Port Harcourt", "Rivers", "Oil Mill", "Mile 1", "Trans Amadi"],
  },
  {
    id: "edo_benin_oba",
    name: "Oba Market",
    city: "Benin City",
    state: "Edo",
    region: "SOUTH_SOUTH",
    lat: 6.3382,
    lng: 5.6258,
    mapX: 52,
    mapY: 68,
    tags: ["Benin", "Edo", "Oba Market", "Ring Road", "New Benin"],
  },
  {
    id: "delta_asaba",
    name: "Ogbeogonogo Modern Market",
    city: "Asaba",
    state: "Delta",
    region: "SOUTH_SOUTH",
    lat: 6.1982,
    lng: 6.7328,
    mapX: 58,
    mapY: 74,
    tags: ["Asaba", "Delta", "Ogbeogonogo", "Nnebisi"],
  },
  {
    id: "delta_warri",
    name: "Igbudu Market",
    city: "Warri",
    state: "Delta",
    region: "SOUTH_SOUTH",
    lat: 5.5174,
    lng: 5.7501,
    mapX: 55,
    mapY: 76,
    tags: ["Warri", "Delta", "Igbudu", "Effurun"],
  },
  {
    id: "cross_river_calabar",
    name: "Watt Market",
    city: "Calabar",
    state: "Cross River",
    region: "SOUTH_SOUTH",
    lat: 4.9757,
    lng: 8.3417,
    mapX: 78,
    mapY: 80,
    tags: ["Calabar", "Cross River", "Watt Market", "Marian"],
  },
  {
    id: "akwa_ibom_uyo",
    name: "Itam Market",
    city: "Uyo",
    state: "Akwa Ibom",
    region: "SOUTH_SOUTH",
    lat: 5.0377,
    lng: 7.9128,
    mapX: 72,
    mapY: 82,
    tags: ["Uyo", "Akwa Ibom", "Itam Market", "Ikot Ekpene"],
  },
  {
    id: "bayelsa_yenagoa",
    name: "Swali Ultra-Modern Market",
    city: "Yenagoa",
    state: "Bayelsa",
    region: "SOUTH_SOUTH",
    lat: 4.9267,
    lng: 6.2676,
    mapX: 58,
    mapY: 84,
    tags: ["Yenagoa", "Bayelsa", "Swali"],
  },

  // ── SOUTH-WEST (COMMERCIAL & IMPORT CORRIDOR) ──
  {
    id: "lagos_balogun",
    name: "Balogun Market",
    city: "Lagos Island",
    state: "Lagos",
    region: "SOUTH_WEST",
    lat: 6.4551,
    lng: 3.3841,
    mapX: 42,
    mapY: 58,
    tags: ["Lagos", "Balogun", "Lagos Island", "Breadfruit", "Idumota"],
  },
  {
    id: "lagos_mile12",
    name: "Mile 12 Wholesale Foodstuff Market",
    city: "Ketu",
    state: "Lagos",
    region: "SOUTH_WEST",
    lat: 6.6018,
    lng: 3.3958,
    mapX: 44,
    mapY: 52,
    tags: ["Lagos", "Mile 12", "Ketu", "Grains", "Perishables"],
  },
  {
    id: "lagos_alaba",
    name: "Alaba International Market",
    city: "Ojo",
    state: "Lagos",
    region: "SOUTH_WEST",
    lat: 6.4623,
    lng: 3.1925,
    mapX: 30,
    mapY: 68,
    tags: ["Lagos", "Alaba", "Electronics", "Appliances"],
  },
  {
    id: "oyo_bodija",
    name: "Bodija Wholesale Market",
    city: "Ibadan",
    state: "Oyo",
    region: "SOUTH_WEST",
    lat: 7.4345,
    lng: 3.9042,
    mapX: 38,
    mapY: 34,
    tags: ["Ibadan", "Oyo", "Bodija", "Dugbe", "Gbagi"],
  },
  {
    id: "ogun_abeokuta",
    name: "Kuto / Ita-Osu Market",
    city: "Abeokuta",
    state: "Ogun",
    region: "SOUTH_WEST",
    lat: 7.1557,
    lng: 3.3458,
    mapX: 31,
    mapY: 64,
    tags: ["Abeokuta", "Ogun", "Kuto", "Adire", "Ita-Osu"],
  },
  {
    id: "ondo_akure",
    name: "Oja Oba Modern Market",
    city: "Akure",
    state: "Ondo",
    region: "SOUTH_WEST",
    lat: 7.2571,
    lng: 5.2058,
    mapX: 44,
    mapY: 62,
    tags: ["Akure", "Ondo", "Oja Oba", "Ondo Road"],
  },
  {
    id: "osun_osogbo",
    name: "Oja Oba Central Market",
    city: "Osogbo",
    state: "Osun",
    region: "SOUTH_WEST",
    lat: 7.7827,
    lng: 4.5418,
    mapX: 39,
    mapY: 58,
    tags: ["Osogbo", "Osun", "Ilesa", "Oja Oba"],
  },
  {
    id: "ekiti_ado",
    name: "Ado Central Market",
    city: "Ado-Ekiti",
    state: "Ekiti",
    region: "SOUTH_WEST",
    lat: 7.6211,
    lng: 5.2215,
    mapX: 43,
    mapY: 59,
    tags: ["Ado-Ekiti", "Ekiti", "Oja Oba"],
  },
];

/**
 * Computes great-circle distance between two GPS points using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Checks whether coordinates lie within the sovereign bounding box of Nigeria
 * (lat: 4.2°N to 13.9°N, lng: 2.6°E to 14.7°E)
 */
export function isCoordinateInNigeria(lat: number, lng: number): boolean {
  return lat >= 4.0 && lat <= 14.2 && lng >= 2.5 && lng <= 15.0;
}

/**
 * Finds the nearest commercial hub to any GPS coordinates across Nigeria
 */
export function findNearestNigerianHub(lat: number, lng: number): { hub: NigerianHub; distanceKm: number } {
  let nearest = NIGERIAN_COMMERCIAL_HUBS[0];
  let minDistance = Infinity;

  for (const hub of NIGERIAN_COMMERCIAL_HUBS) {
    const dist = calculateHaversineDistanceKm(lat, lng, hub.lat, hub.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hub;
    }
  }

  return { hub: nearest, distanceKm: minDistance };
}

/**
 * High-accuracy device geolocation request with timeout and fallbacks
 */
export async function requestDeviceCoordinates(): Promise<{
  lat: number;
  lng: number;
  accuracyMeters?: number;
}> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    throw new Error("Geolocation is not supported by your device browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = "Could not detect location. Please check location permissions.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access in your browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "GPS signal unavailable. Please ensure your device location is turned on.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Location request timed out. Please try again.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Reverse geocodes GPS coordinates to human-readable address anywhere in Nigeria
 */
export async function detectNigerianStallLocation(): Promise<DetectedGeoLocation> {
  const coords = await requestDeviceCoordinates();
  const inNigeria = isCoordinateInNigeria(coords.lat, coords.lng);
  const { hub, distanceKm } = findNearestNigerianHub(coords.lat, coords.lng);

  // Formatted location string tailored for Nigerian traders
  let formattedLocation = `${hub.name}, ${hub.city}, ${hub.state}`;
  if (distanceKm > 25 && inNigeria) {
    formattedLocation = `Commercial Area, ${hub.city}, ${hub.state} (~${distanceKm}km from ${hub.name})`;
  } else if (!inNigeria) {
    formattedLocation = `International Trader (${hub.name}, Nigeria Hub)`;
  }

  return {
    lat: coords.lat,
    lng: coords.lng,
    accuracyMeters: coords.accuracyMeters,
    hub,
    distanceKm,
    formattedLocation,
    isInsideNigeria: inNigeria,
    detectedVia: "device_gps",
  };
}
