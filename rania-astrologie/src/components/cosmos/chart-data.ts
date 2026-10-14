// A sample natal chart used for the decorative astrolabe. Longitudes in ecliptic degrees (0 = 0° Aries).

export const SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"] as const;

export type Body = { glyph: string; lon: number; key: string };

export const CHART_A: Body[] = [
  { key: "sun", glyph: "☉", lon: 84.5 },
  { key: "moon", glyph: "☽", lon: 203.2 },
  { key: "mercury", glyph: "☿", lon: 71.1 },
  { key: "venus", glyph: "♀", lon: 112.4 },
  { key: "mars", glyph: "♂", lon: 352.0 },
  { key: "jupiter", glyph: "♃", lon: 263.0 },
  { key: "saturn", glyph: "♄", lon: 296.3 },
  { key: "uranus", glyph: "♅", lon: 31.2 },
  { key: "neptune", glyph: "♆", lon: 327.6 },
  { key: "pluto", glyph: "♇", lon: 236.1 },
];

export const CHART_B: Body[] = [
  { key: "sun", glyph: "☉", lon: 205.0 },
  { key: "moon", glyph: "☽", lon: 86.0 },
  { key: "mercury", glyph: "☿", lon: 221.3 },
  { key: "venus", glyph: "♀", lon: 174.8 },
  { key: "mars", glyph: "♂", lon: 113.5 },
  { key: "jupiter", glyph: "♃", lon: 22.0 },
  { key: "saturn", glyph: "♄", lon: 141.0 },
  { key: "uranus", glyph: "♅", lon: 268.0 },
  { key: "neptune", glyph: "♆", lon: 294.0 },
  { key: "pluto", glyph: "♇", lon: 234.0 },
];

export const ASC = 160;
export const HOUSES = [160, 188, 219, 252, 286, 316, 340, 8, 39, 72, 106, 136];
export const NORTH_NODE = 140;

export type AspectType = "trine" | "sextile" | "square" | "opposition";

const ASPECTS: { type: AspectType; angle: number; orb: number }[] = [
  { type: "opposition", angle: 180, orb: 7 },
  { type: "trine", angle: 120, orb: 6 },
  { type: "square", angle: 90, orb: 6 },
  { type: "sextile", angle: 60, orb: 4 },
];

export function findAspects(bodies: Body[]): { a: Body; b: Body; type: AspectType }[] {
  const out: { a: Body; b: Body; type: AspectType }[] = [];
  for (let i = 0; i < bodies.length; i++)
    for (let j = i + 1; j < bodies.length; j++) {
      let d = Math.abs(bodies[i].lon - bodies[j].lon) % 360;
      if (d > 180) d = 360 - d;
      const hit = ASPECTS.find((x) => Math.abs(d - x.angle) <= x.orb);
      if (hit) out.push({ a: bodies[i], b: bodies[j], type: hit.type });
    }
  return out;
}

/** Formats an ecliptic longitude as degree/minute within its sign, e.g. 24°30′ ♊ */
export function formatLon(lon: number): string {
  const inSign = lon % 30;
  const deg = Math.floor(inSign);
  const min = Math.round((inSign - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′ ${SIGNS[Math.floor(lon / 30) % 12]}︎`;
}

// Approximate zodiac constellation figures, normalised to roughly [-1, 1].
export const CONSTELLATIONS: { name: string; stars: [number, number, number][]; edges: [number, number][] }[] = [
  {
    name: "leo",
    stars: [[0, 0, 1.6], [0.05, 0.35, 0.8], [0.12, 0.6, 1.2], [0, 0.85, 0.8], [-0.25, 0.95, 0.7], [-0.4, 0.8, 0.9], [0.9, 0.55, 1.0], [0.85, 0.2, 0.8], [1.35, 0.35, 1.2]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 8], [8, 7], [7, 0], [6, 7]],
  },
  {
    name: "scorpius",
    stars: [[-1, 0.9, 0.8], [-0.95, 0.6, 1.0], [-0.9, 0.3, 0.8], [-0.55, 0.25, 1.8], [-0.35, 0, 0.9], [-0.2, -0.3, 0.8], [-0.1, -0.6, 0.8], [0.15, -0.85, 0.9], [0.45, -0.92, 0.8], [0.7, -0.75, 1.0], [0.75, -0.5, 1.1], [0.6, -0.36, 0.8]],
    edges: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11]],
  },
  {
    name: "gemini",
    stars: [[-0.25, 0.95, 1.4], [-0.35, 0.4, 0.8], [-0.45, -0.2, 0.8], [-0.55, -0.8, 1.0], [0.25, 0.85, 1.6], [0.2, 0.35, 0.8], [0.15, -0.15, 0.9], [0.3, -0.75, 1.0], [-0.75, -0.35, 0.7], [0.6, -0.1, 0.7]],
    edges: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [1, 5], [2, 8], [6, 9]],
  },
  {
    name: "sagittarius",
    stars: [[0, 0, 1.0], [0.4, 0.05, 1.1], [0.45, -0.35, 1.2], [0.05, -0.4, 1.0], [0.25, 0.38, 0.9], [-0.35, 0.15, 0.8], [-0.42, -0.3, 0.9], [0.82, -0.18, 1.0]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 1], [0, 5], [5, 6], [6, 3], [1, 7], [2, 7]],
  },
  {
    name: "taurus",
    stars: [[0, 0, 1.8], [0.22, 0.12, 0.8], [0.42, 0.22, 0.8], [0.12, -0.14, 0.8], [0.34, -0.06, 0.8], [1.1, 0.7, 1.1], [1.0, -0.42, 1.0], [-0.7, 0.5, 0.6], [-0.76, 0.56, 0.5], [-0.66, 0.58, 0.5], [-0.73, 0.44, 0.5]],
    edges: [[0, 1], [1, 2], [2, 5], [0, 3], [3, 4], [4, 6], [0, 7]],
  },
  {
    name: "libra",
    stars: [[0, 0.6, 1.1], [-0.5, 0, 1.2], [0.5, 0.1, 1.0], [0, -0.3, 0.8], [-0.62, -0.7, 0.8], [0.58, -0.6, 0.8]],
    edges: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5]],
  },
];
