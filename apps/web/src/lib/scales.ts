/** Tiny scale helpers — enough for these charts, no plotting library needed. */

export interface Scale {
  (value: number): number;
  domain: [number, number];
  range: [number, number];
}

export function linearScale(
  domain: [number, number],
  range: [number, number],
): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  const scale = ((value: number) => r0 + ((value - d0) / span) * (r1 - r0)) as Scale;
  scale.domain = domain;
  scale.range = range;
  return scale;
}

/**
 * A rounded domain and its ticks, derived from one shared step.
 *
 * Computing them separately is how axes end up with a single lonely label: the
 * domain rounds to one step and the ticks are spaced by another, so most of
 * them fall outside the range.
 */
export function niceScale(
  values: readonly number[],
  {
    padding = 0.1,
    count = 4,
    includeZero = false,
  }: { padding?: number; count?: number; includeZero?: boolean } = {},
): { domain: [number, number]; ticks: number[] } {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return { domain: [0, 1], ticks: [0, 1] };

  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (includeZero) min = Math.min(0, min);
  if (min === max) {
    min -= 1;
    max += 1;
  }

  const pad = (max - min) * padding;
  min -= pad;
  max += pad;

  const step = tickStep(min, max, count);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 1000; v += step) {
    ticks.push(Number(v.toFixed(6)));
  }

  return { domain: [lo, hi], ticks };
}

function tickStep(min: number, max: number, count: number): number {
  const raw = (max - min) / Math.max(1, count);
  const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
  const normalized = raw / magnitude;
  const step = normalized >= 5 ? 10 : normalized >= 2 ? 5 : normalized >= 1 ? 2 : 1;
  return step * magnitude;
}

/** An SVG path through the points, skipping gaps where data is missing. */
export function linePath(
  points: ReadonlyArray<{ x: number; y: number | null }>,
): string {
  let path = '';
  let penDown = false;
  for (const point of points) {
    if (point.y === null) {
      penDown = false;
      continue;
    }
    path += `${penDown ? 'L' : 'M'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    penDown = true;
  }
  return path;
}

export function shortDay(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}/${month}`;
}
