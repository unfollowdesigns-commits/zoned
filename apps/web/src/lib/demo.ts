import { summarizeDays, syntheticHistory, type DayMetrics, type UserProfile } from '@zoned/core';

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
export function demoDays(days = 42): DayMetrics[] {
  return summarizeDays(
    syntheticHistory(days, { endingAt: Date.UTC(2026, 8, 8, 12), seed: 20260908 }),
    DEMO_PROFILE,
  );
}
