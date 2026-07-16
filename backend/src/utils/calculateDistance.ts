const EARTH_RADIUS_KM = 6371;

function toRadians(degree: number): number {
  return (degree * Math.PI) / 180;
}

// Haversine Formula -> calculates the shortest path along the Earth's surface.
export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // calculates angular separation between points.
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  // it gives angle between locations measured from the Earth's center.
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Convert Angle → Distance
  return EARTH_RADIUS_KM * c;
}
