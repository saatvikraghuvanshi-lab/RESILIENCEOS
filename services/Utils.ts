
import { GeoLocation } from '../types';
import { NATIONAL_RESILIENCE_DATA, RegionData } from './RegionalData';

/**
 * Calculates the Haversine distance between two points in km
 */
export const calculateDistance = (loc1: GeoLocation, loc2: GeoLocation): number => {
  const R = 6371; // Earth radius in km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLng = (loc2.lng - loc1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) *
      Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Formats a timestamp into a human readable time string
 */
export const formatTime = (ts: number): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(ts);
};

/**
 * Buffer Zone Analysis Logic
 * Basic logic: Higher density requires more facilities
 */
export function calculateResilienceScore(facilitiesCount: number, density: number): string {
    if (density === 0) return "0.00";
    const score = (facilitiesCount / density) * 1000; 
    return score.toFixed(2);
}

/**
 * Approximate mapping of region centers to find the nearest density baseline
 */
const REGION_CENTERS: Record<string, GeoLocation> = {
  "North / Indo-Gangetic Plain": { lat: 26.8467, lng: 80.9462 },
  "East": { lat: 22.5726, lng: 88.3639 },
  "West": { lat: 19.0760, lng: 72.8777 },
  "South": { lat: 12.9716, lng: 77.5946 },
  "Himalayan & North-East": { lat: 26.1445, lng: 91.7362 }
};

export function getNearestRegionDensity(loc: GeoLocation): number {
  let nearestRegion = NATIONAL_RESILIENCE_DATA.regions[0];
  let minDist = Infinity;

  NATIONAL_RESILIENCE_DATA.regions.forEach(region => {
    const center = REGION_CENTERS[region.region];
    if (center) {
      const d = calculateDistance(loc, center);
      if (d < minDist) {
        minDist = d;
        nearestRegion = region;
      }
    }
  });

  return nearestRegion.density_2026_est;
}
