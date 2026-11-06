import type { DeliveryTier } from '@/types'

// Al Maas Bakery shop coordinates (Sultan Palya Main Road, Bengaluru)
export const SHOP_COORDS = {
  lat: 13.0279242,
  lng: 77.5282725,
}

/**
 * Haversine formula – calculates straight-line distance between two lat/lng points in km.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return parseFloat((R * c).toFixed(2))
}

function toRad(value: number): number {
  return (value * Math.PI) / 180
}

/**
 * Returns the delivery charge for a given distance using the configured tiers.
 * Returns null if delivery is unavailable (beyond max distance or null charge).
 */
export function getDeliveryCharge(
  distanceKm: number,
  tiers: DeliveryTier[],
): number | null {
  for (const tier of tiers) {
    const withinMax = tier.max_km === null || distanceKm <= tier.max_km
    if (distanceKm >= tier.min_km && withinMax) {
      return tier.charge // null means unavailable
    }
  }
  return null // beyond all tiers = unavailable
}

/** Default delivery pricing tiers */
export const DEFAULT_TIERS: DeliveryTier[] = [
  { min_km: 0, max_km: 2, charge: 20 },
  { min_km: 2, max_km: 5, charge: 40 },
  { min_km: 5, max_km: 8, charge: 60 },
  { min_km: 8, max_km: null, charge: null },
]

