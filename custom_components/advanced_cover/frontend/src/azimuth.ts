/**
 * Compass-point math, free of any rendering import so it can be unit-tested
 * and shared with the scenario summaries.
 */

/** The eight compass points and their azimuth in degrees. */
export const COMPASS: Array<[string, number]> = [
  ["N", 0],
  ["NE", 45],
  ["E", 90],
  ["SE", 135],
  ["S", 180],
  ["SW", 225],
  ["W", 270],
  ["NW", 315],
];

export const COMPASS_BY_DEG: Record<number, string> = Object.fromEntries(
  COMPASS.map(([label, deg]) => [deg, label]),
);

/** Show the compass label for exact matches, otherwise the raw degrees. */
export function formatAzimuth(deg: number): string {
  return COMPASS_BY_DEG[deg] ?? `${deg}°`;
}

/**
 * Bucket an azimuth to the nearest of the eight compass points (returned as
 * degrees: 0, 45, … 315). A window at 200° maps to S (180°), at 210° to SW.
 */
export function nearestCompassDeg(azimuth: number): number {
  const a = ((azimuth % 360) + 360) % 360;
  return (Math.round(a / 45) % 8) * 45;
}
