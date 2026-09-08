import { describe, expect, it } from 'vitest';
import { dayKey, summarizeDays } from '../daily';
import { syntheticHistory, syntheticNight, syntheticWorkout } from '../synthetic';
import type { UserProfile } from '../types';

const profile: UserProfile = { age: 32, restingHr: 54, sex: 'male', sleepNeedHours: 8 };

describe('dayKey', () => {
  it('formats a local calendar day', () => {
    expect(dayKey(new Date(2026, 0, 5, 13, 0).getTime())).toBe('2026-01-05');
  });
});

describe('summarizeDays', () => {
  const history = syntheticHistory(30, { endingAt: Date.parse('2026-03-01T12:00:00Z') });
  const days = summarizeDays(history, profile);

  it('produces one row per day of recording', () => {
    expect(days.length).toBeGreaterThan(25);
    expect(new Set(days.map((d) => d.day)).size).toBe(days.length);
  });

  it('returns days in chronological order', () => {
    const sorted = [...days].map((d) => d.day).sort();
    expect(days.map((d) => d.day)).toEqual(sorted);
  });

  it('scores recovery once there is a night to score', () => {
    const scored = days.filter((d) => d.recovery !== null);
    expect(scored.length).toBeGreaterThan(20);
    for (const day of scored) {
      expect(day.recovery!.score).toBeGreaterThanOrEqual(1);
      expect(day.recovery!.score).toBeLessThanOrEqual(100);
    }
  });

  it('is unconfident early and confident later', () => {
    const scored = days.filter((d) => d.recovery !== null);
    expect(scored[0]!.recovery!.confident).toBe(false);
    expect(scored[scored.length - 1]!.recovery!.confident).toBe(true);
  });

  it('derives overnight metrics that sit in physiological ranges', () => {
    const withSleep = days.filter((d) => d.restingHr !== null);
    expect(withSleep.length).toBeGreaterThan(20);
    for (const day of withSleep) {
      expect(day.restingHr!).toBeGreaterThan(35);
      expect(day.restingHr!).toBeLessThan(90);
      expect(day.sleepMinutes!).toBeGreaterThan(180);
    }
  });

  it('scores strain only on days with a workout', () => {
    const withStrain = days.filter((d) => d.strain !== null);
    const withoutStrain = days.filter((d) => d.strain === null);
    expect(withStrain.length).toBeGreaterThan(5);
    expect(withoutStrain.length).toBeGreaterThan(0);
    for (const day of withStrain) {
      expect(day.strain!.strain).toBeGreaterThan(0);
      expect(day.strain!.strain).toBeLessThanOrEqual(21);
    }
  });

  it('scores a night against the morning it ends on, not the evening it began', () => {
    // Sleep from 23:00 on the 1st to 07:00 on the 2nd belongs to the 2nd.
    const bedtime = new Date(2026, 4, 1, 23, 0).getTime();
    const night = syntheticNight(bedtime, 8);
    const result = summarizeDays(
      [
        {
          id: 'n',
          kind: 'sleep',
          startedAt: bedtime,
          endedAt: bedtime + 8 * 3_600_000,
          samples: night.hr,
          motion: night.motion,
        },
      ],
      profile,
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.day).toBe('2026-05-02');
  });

  it('handles a day with a workout and no sleep recording', () => {
    const start = new Date(2026, 4, 10, 18, 0).getTime();
    const result = summarizeDays(
      [
        {
          id: 'w',
          kind: 'workout',
          startedAt: start,
          endedAt: start + 40 * 60_000,
          samples: syntheticWorkout(start, 40),
        },
      ],
      profile,
    );
    expect(result[0]!.strain).not.toBeNull();
    expect(result[0]!.recovery).toBeNull();
    expect(result[0]!.sleepMinutes).toBeNull();
  });

  it('returns nothing for no sessions', () => {
    expect(summarizeDays([], profile)).toEqual([]);
  });
});
