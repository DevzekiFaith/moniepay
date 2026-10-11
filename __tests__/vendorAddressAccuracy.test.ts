import { describe, it, expect, beforeEach } from "vitest";
import {
  resolveMarketCoordinates,
  getCurrentUserVendor,
  getVendor,
  getVendorShareLinks,
  inferCategory,
  getCategoryTags,
  INITIAL_VENDORS,
} from "../lib/reviews/vendorStore";

describe("Real Vendor Address & Shop Accuracy Suite", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  describe("resolveMarketCoordinates", () => {
    it("resolves major Lagos market depots accurately", () => {
      const mile12 = resolveMarketCoordinates("Shed 12, Mile 12 Wholesale Market, Lagos");
      expect(mile12.market).toBe("Mile 12 Wholesale Market, Ketu");
      expect(mile12.landmark).toContain("Truck Offloading Bay");
      expect(mile12.lat).toBeCloseTo(6.6018, 2);

      const alaba = resolveMarketCoordinates("Block C, Shop 4, Alaba International Market");
      expect(alaba.market).toBe("Alaba International Market, Ojo");
      expect(alaba.landmark).toContain("Alaba expressway");
      expect(alaba.lat).toBeCloseTo(6.4623, 2);

      const balogun = resolveMarketCoordinates("Shop 14, Balogun Market, Lagos Island");
      expect(balogun.market).toBe("Balogun Market, Lagos Island");
      expect(balogun.landmark).toContain("Breadfruit street");
    });

    it("resolves multi-state Nigerian trading hubs accurately without defaulting to Balogun", () => {
      // Kano
      const dawanau = resolveMarketCoordinates("Stall 55, Dawanau Grains Depot, Kano");
      expect(dawanau.market).toBe("Dawanau International Grains Depot, Kano");
      expect(dawanau.landmark).toContain("Katsina Road, Kano");
      expect(dawanau.lat).toBeCloseTo(12.0625, 2);

      const singer = resolveMarketCoordinates("Singer Market, Kano");
      expect(singer.market).toBe("Singer Wholesale Market, Kano");
      expect(singer.landmark).toContain("Fagge Central Mosque");

      // Anambra
      const onitsha = resolveMarketCoordinates("Line 3, Relief Market, Onitsha");
      expect(onitsha.market).toBe("Onitsha Main / Relief Market, Anambra");
      expect(onitsha.landmark).toContain("River Niger Bank");
      expect(onitsha.lat).toBeCloseTo(6.1519, 2);

      // Abia
      const aba = resolveMarketCoordinates("A-Line, Ariaria International Market, Aba");
      expect(aba.market).toBe("Ariaria International Market, Aba, Abia");
      expect(aba.landmark).toContain("Faulks Road");

      // Oyo
      const bodija = resolveMarketCoordinates("Bodija Market, Ibadan");
      expect(bodija.market).toBe("Bodija Market, Ibadan, Oyo State");
      expect(bodija.landmark).toContain("Bodija Railway Station");

      // Abuja
      const wuse = resolveMarketCoordinates("Zone 5, Wuse Market, Abuja");
      expect(wuse.market).toBe("Wuse Modern Market, Abuja FCT");
      expect(wuse.landmark).toContain("Wuse Zone 5");

      // Rivers
      const ph = resolveMarketCoordinates("Oil Mill Market, Port Harcourt");
      expect(ph.market).toBe("Oil Mill / Mile 1 Market, Port Harcourt");
      expect(ph.landmark).toContain("Aba-Port Harcourt Expressway");

      // Plateau
      const jos = resolveMarketCoordinates("Terminus Market, Jos");
      expect(jos.market).toBe("Terminus Main Market, Jos, Plateau");
      expect(jos.landmark).toContain("Jos Central");
    });

    it("accurately detects cities across all 6 geopolitical zones of Nigeria", () => {
      // North-East: Maiduguri, Borno
      const borno = resolveMarketCoordinates("Shop 5, Monday Market, Maiduguri");
      expect(borno.lat).toBeCloseTo(11.8333, 2);
      expect(borno.lng).toBeCloseTo(13.1500, 2);

      // North-West: Sokoto
      const sokoto = resolveMarketCoordinates("Old Market, Sokoto State");
      expect(sokoto.lat).toBeCloseTo(13.0059, 2);
      expect(sokoto.lng).toBeCloseTo(5.2476, 2);

      // North-Central: Minna, Niger
      const minna = resolveMarketCoordinates("Minna Central Market, Niger State");
      expect(minna.lat).toBeCloseTo(9.6139, 2);

      // South-South: Calabar, Cross River
      const calabar = resolveMarketCoordinates("Watt Market, Calabar, Cross River");
      expect(calabar.lat).toBeCloseTo(4.9757, 2);

      // South-South: Benin City, Edo
      const benin = resolveMarketCoordinates("Oba Market, Benin City");
      expect(benin.lat).toBeCloseTo(6.3382, 2);

      // South-East: Owerri, Imo
      const owerri = resolveMarketCoordinates("Eke Ukwu Market, Owerri, Imo State");
      expect(owerri.lat).toBeCloseTo(5.4832, 2);

      // South-West: Akure, Ondo
      const akure = resolveMarketCoordinates("Oja Oba, Akure, Ondo State");
      expect(akure.lat).toBeCloseTo(7.2571, 2);
    });

    it("falls back to central Nigeria coordinates when location is generic, never forcing Lagos", () => {
      const generic = resolveMarketCoordinates("Block 3, General Provisions Store");
      expect(generic.lat).toBeCloseTo(9.0765, 2); // Nigeria Centroid (Abuja)
      expect(generic.lng).toBeCloseTo(7.3986, 2);
      expect(generic.market).not.toContain("Balogun");
    });

    it("dynamically extracts landmark for custom plaza and street addresses without Balogun hardcoding", () => {
      const customPlaza = resolveMarketCoordinates("Shop 12, Silver Plaza, Admiralty Way, Lekki");
      expect(customPlaza.landmark).toContain("Inside Silver Plaza");
      expect(customPlaza.landmark).not.toContain("Breadfruit");

      const customStreet = resolveMarketCoordinates("No. 45 Commercial Avenue, Yaba, Lagos");
      expect(customStreet.landmark).toContain("Commercial Avenue");
      expect(customStreet.landmark).not.toContain("Breadfruit");

      const customCity = resolveMarketCoordinates("Suite 8, Zenith House, Garki 2, Abuja");
      expect(customCity.lat).toBeCloseTo(9.0643, 2); // Abuja coords
      expect(customCity.landmark).not.toContain("Breadfruit");
    });
  });

  describe("getCurrentUserVendor", () => {
    it("uses real registered user data, address, and category", () => {
      const user = {
        id: "usr_998877",
        name: "Chukwuma Eze",
        phone: "+234 812 345 6789",
        businessName: "Chukwuma Heavy Auto Parts",
        marketLocation: "Shop 22, Ladipo Auto Parts Market, Mushin, Lagos",
      };

      const vendor = getCurrentUserVendor(user);

      expect(vendor.id).toBe("usr_998877");
      expect(vendor.name).toBe("Chukwuma Eze");
      expect(vendor.shopName).toBe("Chukwuma Heavy Auto Parts");
      expect(vendor.fullAddress).toBe("Shop 22, Ladipo Auto Parts Market, Mushin, Lagos");
      expect(vendor.market).toContain("Ladipo International Auto Parts Market");
      expect(vendor.landmark).toContain("Toyota Bus Stop");
      expect(vendor.category).toBe("Auto Parts & Hardware");
      expect(vendor.phone).toBe("+234 812 345 6789");
      expect(vendor.whatsapp).toBe("2348123456789");
    });

    it("defaults new custom user without location to Commercial Market Stall, Nigeria", () => {
      const newUser = {
        id: "usr_kaduna_trader_55",
        name: "Ibrahim Bello",
        businessName: "Bello Agricultural Supplies",
      };

      const vendor = getCurrentUserVendor(newUser);
      expect(vendor.fullAddress).toBe("Commercial Market Stall, Nigeria");
      expect(vendor.coordinates.lat).toBeCloseTo(9.0765, 2); // Central Nigeria
      expect(vendor.coordinates.lng).toBeCloseTo(7.3986, 2);
    });

    it("does not leak Mama Chidi contact or Balogun address for custom registered users", () => {
      const user = {
        id: "usr_kado_01",
        name: "Fatima Aliyu",
        businessName: "Kano Royal Grains Store",
        marketLocation: "Shed 19, Dawanau Grains Market, Kano",
      };

      const vendor = getCurrentUserVendor(user);

      expect(vendor.shopName).toBe("Kano Royal Grains Store");
      expect(vendor.fullAddress).toBe("Shed 19, Dawanau Grains Market, Kano");
      expect(vendor.landmark).toContain("Katsina Road, Kano");
      expect(vendor.phone).not.toBe("+234 803 123 4567");
      expect(vendor.whatsapp).not.toBe("2348031234567");
    });
  });

  describe("getVendor with fallback metadata & getVendorShareLinks", () => {
    it("resolves dynamic shop on customer device via URL search parameters", () => {
      const vendor = getVendor("usr_new_client_44", {
        shopName: "Oasis Fabrics Boutique",
        name: "Aisha Bello",
        marketLocation: "Shop 10, Tejuosho Ultra-Modern Market, Yaba",
      });

      expect(vendor.id).toBe("usr_new_client_44");
      expect(vendor.shopName).toBe("Oasis Fabrics Boutique");
      expect(vendor.fullAddress).toBe("Shop 10, Tejuosho Ultra-Modern Market, Yaba");
      expect(vendor.market).toBe("Tejuosho Ultra-Modern Market, Yaba");
      expect(vendor.category).toBe("Fabrics, Lace & Aso-Ebi");
    });

    it("embeds real shop name and address in share links query params", () => {
      const links = getVendorShareLinks("mama_chidi");
      expect(links.reviewUrl).toContain("shop=mama_chidi");
      expect(links.reviewUrl).toContain("loc=");
      expect(links.profileUrl).toContain("shop=mama_chidi");
    });
  });

  describe("inferCategory & tags", () => {
    it("infers realistic Nigerian business categories", () => {
      expect(inferCategory("Golden Penny Rice & Semo Depo")).toBe("Wholesale Foodstuff & Grains");
      expect(inferCategory("Slot Tech Mobile Phone Hub")).toBe("Electronics & Gadgets");
      expect(inferCategory("Aso Ebi Lace World")).toBe("Fabrics, Lace & Aso-Ebi");
      expect(inferCategory("St. Jude Community Pharmacy")).toBe("Pharmacy & Healthcare");
      expect(inferCategory("Alaba Genuine Motor Spare Parts")).toBe("Auto Parts & Hardware");
    });
  });
});
