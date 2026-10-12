import { describe, it, expect } from "vitest";
import {
  calculateHaversineDistanceKm,
  isCoordinateInNigeria,
  findNearestNigerianHub,
  NIGERIAN_COMMERCIAL_HUBS,
  projectGpsCoordinatesToMap,
} from "../lib/geo/geolocation";

describe("Nationwide Geolocation Engine Suite", () => {
  describe("isCoordinateInNigeria", () => {
    it("correctly validates points within Nigeria's geographic borders", () => {
      // Lagos
      expect(isCoordinateInNigeria(6.4551, 3.3841)).toBe(true);
      // Abuja (Centroid)
      expect(isCoordinateInNigeria(9.0765, 7.3986)).toBe(true);
      // Kano (North)
      expect(isCoordinateInNigeria(12.0022, 8.5291)).toBe(true);
      // Port Harcourt (South)
      expect(isCoordinateInNigeria(4.8156, 7.0498)).toBe(true);
      // Maiduguri (North-East)
      expect(isCoordinateInNigeria(11.8333, 13.1500)).toBe(true);
      // Sokoto (North-West)
      expect(isCoordinateInNigeria(13.0059, 5.2476)).toBe(true);
    });

    it("rejects points outside Nigeria", () => {
      // London, UK
      expect(isCoordinateInNigeria(51.5074, -0.1278)).toBe(false);
      // New York, USA
      expect(isCoordinateInNigeria(40.7128, -74.0060)).toBe(false);
      // Johannesburg, SA
      expect(isCoordinateInNigeria(-26.2041, 28.0473)).toBe(false);
    });
  });

  describe("calculateHaversineDistanceKm", () => {
    it("computes authentic distances between major Nigerian commercial cities", () => {
      // Lagos (Balogun) to Abuja (Wuse) is approximately 535 km as the crow flies
      const lagosToAbuja = calculateHaversineDistanceKm(6.4551, 3.3841, 9.0643, 7.4665);
      expect(lagosToAbuja).toBeGreaterThan(500);
      expect(lagosToAbuja).toBeLessThan(570);

      // Onitsha to Aba is approx 120-140 km
      const onitshaToAba = calculateHaversineDistanceKm(6.1519, 6.7758, 5.1278, 7.3392);
      expect(onitshaToAba).toBeGreaterThan(100);
      expect(onitshaToAba).toBeLessThan(160);

      // Same location is 0 km
      const zeroDist = calculateHaversineDistanceKm(9.0643, 7.4665, 9.0643, 7.4665);
      expect(zeroDist).toBe(0);
    });
  });

  describe("findNearestNigerianHub", () => {
    it("identifies the closest trading hub accurately for any coordinate across Nigeria", () => {
      // Point in Kano metropolis (12.01, 8.52) -> Singer or Dawanau
      const kanoMatch = findNearestNigerianHub(12.01, 8.52);
      expect(kanoMatch.hub.state).toBe("Kano");
      expect(kanoMatch.distanceKm).toBeLessThan(15);

      // Point in Maitama Abuja (9.088, 7.493) -> Wuse Modern Market
      const abujaMatch = findNearestNigerianHub(9.088, 7.493);
      expect(abujaMatch.hub.state).toBe("FCT");
      expect(abujaMatch.distanceKm).toBeLessThan(10);

      // Point near Port Harcourt Airport / Trans-Amadi (4.82, 7.03) -> Oil Mill Market
      const phMatch = findNearestNigerianHub(4.82, 7.03);
      expect(phMatch.hub.state).toBe("Rivers");
      expect(phMatch.distanceKm).toBeLessThan(12);

      // Point in Onitsha Bridgehead (6.14, 6.78) -> Onitsha Main Market
      const onitshaMatch = findNearestNigerianHub(6.14, 6.78);
      expect(onitshaMatch.hub.state).toBe("Anambra");
      expect(onitshaMatch.distanceKm).toBeLessThan(5);

      // Point in Ibadan ring road (7.36, 3.88) -> Bodija Wholesale Market
      const ibadanMatch = findNearestNigerianHub(7.36, 3.88);
      expect(ibadanMatch.hub.state).toBe("Oyo");
      expect(ibadanMatch.distanceKm).toBeLessThan(15);
    });

    it("has comprehensive representation across all 5 zones in Nigeria", () => {
      const regions = new Set(NIGERIAN_COMMERCIAL_HUBS.map((h) => h.region));
      expect(regions.has("NORTH")).toBe(true);
      expect(regions.has("CENTRAL")).toBe(true);
      expect(regions.has("EAST")).toBe(true);
      expect(regions.has("SOUTH_SOUTH")).toBe(true);
      expect(regions.has("SOUTH_WEST")).toBe(true);
    });
  });

  describe("projectGpsCoordinatesToMap", () => {
    it("accurately projects Nigerian GPS coordinates to map canvas percentages", () => {
      // Lagos Island (6.45, 3.38) -> mapX ~ 25-35%, mapY ~ 65-75%
      const lagos = projectGpsCoordinatesToMap(6.4551, 3.3841);
      expect(lagos.mapX).toBeGreaterThanOrEqual(25);
      expect(lagos.mapX).toBeLessThanOrEqual(35);
      expect(lagos.mapY).toBeGreaterThanOrEqual(65);
      expect(lagos.mapY).toBeLessThanOrEqual(75);

      // Kano (12.00, 8.53) -> Northern quadrant (mapY ~ 15-25%)
      const kano = projectGpsCoordinatesToMap(12.0022, 8.5291);
      expect(kano.mapY).toBeGreaterThanOrEqual(15);
      expect(kano.mapY).toBeLessThanOrEqual(28);

      // Maiduguri (11.83, 13.15) -> Eastern quadrant (mapX > 75%)
      const maiduguri = projectGpsCoordinatesToMap(11.8333, 13.1500);
      expect(maiduguri.mapX).toBeGreaterThanOrEqual(75);
    });
  });
});
