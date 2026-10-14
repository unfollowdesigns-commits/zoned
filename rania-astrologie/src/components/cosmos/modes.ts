export const sceneModes = [
  "home", "natal", "psychological", "relational", "karmic", "progressed", "degrees", "healing",
  "about", "pricing", "contact", "journal", "quiet",
] as const;
export type SceneMode = (typeof sceneModes)[number];

export type ModeParams = {
  x: number; y: number; scale: number; tilt: number; opacity: number;
  wheelB: number; nodes: number; spiral: number; pulse: number; aspects: number; moonGlow: number; ticks: number;
  tint: [number, number, number];
};

const base: ModeParams = {
  x: 2.7, y: 0, scale: 0.88, tilt: -0.32, opacity: 0.9,
  wheelB: 0, nodes: 0, spiral: 0, pulse: 0, aspects: 1, moonGlow: 0, ticks: 1,
  tint: [0.42, 0.36, 0.77],
};

export const MODES: Record<SceneMode, ModeParams> = {
  home: { ...base, x: 2.35, y: 0.1, scale: 1.08, tilt: -0.22, opacity: 1 },
  natal: { ...base },
  psychological: { ...base, moonGlow: 1, tint: [0.36, 0.42, 0.85] },
  relational: { ...base, x: 2.5, scale: 0.78, wheelB: 1, tint: [0.66, 0.38, 0.62] },
  karmic: { ...base, nodes: 1, aspects: 0.35, tint: [0.75, 0.45, 0.4] },
  progressed: { ...base, spiral: 1, aspects: 0.3, tint: [0.45, 0.4, 0.85] },
  degrees: { ...base, x: 5.6, y: -0.3, scale: 2.1, tilt: -0.08, ticks: 1.8, aspects: 0.5 },
  healing: { ...base, pulse: 1, tint: [0.75, 0.62, 0.38] },
  about: { ...base, x: 3, scale: 0.8, opacity: 0.6 },
  pricing: { ...base, x: 3.3, scale: 0.72, opacity: 0.42 },
  contact: { ...base, x: 3.3, scale: 0.72, opacity: 0.45 },
  journal: { ...base, x: 3.4, scale: 0.7, opacity: 0.38 },
  quiet: { ...base, x: 3.4, scale: 0.68, opacity: 0.3, aspects: 0.4 },
};

export function modeFromPath(pathname: string): SceneMode {
  const parts = pathname.split("/").filter(Boolean);
  const [, section, sub] = parts;
  if (!section) return "home";
  if (section === "consultations") {
    if (!sub) return "natal";
    return (sceneModes as readonly string[]).includes(sub) ? (sub as SceneMode) : "natal";
  }
  if (section === "about") return "about";
  if (section === "pricing" || section === "reservation") return "pricing";
  if (section === "contact") return "contact";
  if (section === "journal") return "journal";
  return "quiet";
}
