import {
  summarizeDays,
  syntheticCortisol,
  syntheticHistory,
  withStressChannels,
  type DayMetrics,
  type UserProfile,
} from '@zoned/core';

export const DEMO_PROFILE: UserProfile = {
  age: 32,
  restingHr: 54,
  sex: 'unspecified',
  sleepNeedHours: 8,
};

/**
 * Six weeks of generated nights and workouts.
 *
 * The dashboard is fully usable before any hardware exists, which matters more
 * than it sounds: it is what lets the layout and the scoring be judged now
 * rather than after a month of wearing a strap.
 *
 * Seeded, so the demo looks the same on every reload and a screenshot stays
 * comparable across changes.
 */
let cached: DayMetrics[] | null = null;

export function demoDays(days = 42): DayMetrics[] {
  // Seeded and deterministic, so it is computed once per server process rather
  // than on every request — the EDA decomposition is the expensive part.
  if (cached) return cached;

  const endingAt = Date.UTC(2026, 8, 8, 12);
  const sessions = withStressChannels(
    syntheticHistory(days, { endingAt, seed: 20260908 }),
    { seed: 20260908 },
  );

  cached = summarizeDays(
    sessions,
    DEMO_PROFILE,
    syntheticCortisol(days, { endingAt, seed: 20260908 }),
  );
  return cached;
}
