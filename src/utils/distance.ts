import type { DeliverySettings, DeliveryTier } from '../data/types'

/**
 * Calculates distance between two latitude/longitude points in kilometers using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Number(distance.toFixed(2)) // Round to 2 decimal places
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export interface DeliveryCalculationResult {
  isAvailable: boolean
  distanceKm: number
  deliveryFee: number
  reason?: string
}

/**
 * Calculates the delivery fee based on customer coordinates, shop coordinates, and delivery tiers.
 */
export function calculateDeliveryFee(
  customerLat: number,
  customerLng: number,
  settings: DeliverySettings,
  subtotal: number
): DeliveryCalculationResult {
  if (!settings.isDeliveryEnabled) {
    return {
      isAvailable: false,
      distanceKm: 0,
      deliveryFee: 0,
      reason: 'Delivery is temporarily paused. Please contact bakery for custom inquiries.',
    }
  }

  if (settings.minOrderAmount > 0 && subtotal < settings.minOrderAmount) {
    return {
      isAvailable: false,
      distanceKm: 0,
      deliveryFee: 0,
      reason: `Minimum order amount for delivery is ₹${settings.minOrderAmount}. Current subtotal is ₹${subtotal}.`,
    }
  }

  const distanceKm = calculateHaversineDistance(
    settings.shopLat,
    settings.shopLng,
    customerLat,
    customerLng
  )

  if (distanceKm > settings.maxDeliveryDistance) {
    return {
      isAvailable: false,
      distanceKm,
      deliveryFee: 0,
      reason: `Your delivery location is ${distanceKm} km away. We deliver up to ${settings.maxDeliveryDistance} km.`,
    }
  }

  // Find matching tier
  for (const tier of settings.tiers) {
    const minMatch = distanceKm >= tier.minKm
    const maxMatch = tier.maxKm === null ? true : distanceKm <= tier.maxKm

    if (minMatch && maxMatch) {
      if (tier.price === null) {
        return {
          isAvailable: false,
          distanceKm,
          deliveryFee: 0,
          reason: `Delivery is unavailable for locations between ${tier.minKm} km and ${tier.maxKm ?? 'above'} km.`,
        }
      }
      return {
        isAvailable: true,
        distanceKm,
        deliveryFee: tier.price,
      }
    }
  }

  // Fallback if no tier directly matches but within max distance
  return {
    isAvailable: false,
    distanceKm,
    deliveryFee: 0,
    reason: `Delivery pricing not configured for distance of ${distanceKm} km.`,
  }
}

