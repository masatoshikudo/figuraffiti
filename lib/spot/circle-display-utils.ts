import type { Spot } from "@/types/spot"
import { isSpotPubliclyVisible } from "@/lib/spot/spot-lifecycle"

const EARTH_RADIUS_METERS = 6371000

export function createRandomCircleCenter(
  lat: number,
  lng: number,
  maxOffsetMeters: number
) {
  const distance = Math.sqrt(Math.random()) * maxOffsetMeters
  const angle = Math.random() * Math.PI * 2

  const northOffset = Math.cos(angle) * distance
  const eastOffset = Math.sin(angle) * distance

  const latOffset =
    (northOffset / EARTH_RADIUS_METERS) * (180 / Math.PI)
  const lngOffset =
    (eastOffset /
      (EARTH_RADIUS_METERS * Math.cos((lat * Math.PI) / 180))) *
    (180 / Math.PI)

  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  }
}

export function getSpotCircleCenter(spot: Spot) {
  return {
    lat: spot.displayLat ?? spot.lat,
    lng: spot.displayLng ?? spot.lng,
  }
}

export function isSpotVisible(spot: Spot, now: Date = new Date()) {
  return isSpotPubliclyVisible(spot, now)
}
