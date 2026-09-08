import { describe, expect, it } from 'vitest';
import { mergeSession, mergeSessions, mergeTimeSeries } from '../merge';
import { summarizeDays } from '../daily';
import { syntheticNight, syntheticWorkout } from '../synthetic';
import type { RecordedSession } from '../daily';
import type { HeartRateSample, UserProfile } from '../types';

const profile: UserProfile = { age: 32, restingHr: 54, sex: 'male' };

function hr(t: number, bpm = 60): HeartRateSample {
  return { t, bpm, rrIntervals: [60000 / bpm] };
}

describe('mergeTimeSeries', () => {
  it('returns an empty series from two empty ones', () => {
    expect(mergeTimeSeries([], [])).toEqual([]);
  });

  it('sorts a single side that arrived out of order', () => {
    const merged = mergeTimeSeries([hr(3000), hr(1000), hr(2000)], []);
    expect(merged.map((s) => s.t)).toEqual([1000, 2000, 3000]);
  });

  it('interleaves two disjoint series', () => {
    const merged = mergeTimeSeries([hr(1000), hr(3000)], [hr(2000), hr(4000)]);
    expect(merged.map((s) => s.t)).toEqual([1000, 2000, 3000, 4000]);
  });

  it('drops an exact duplicate rather than counting it twice', () => {
    const merged = mergeTimeSeries([hr(1000), hr(2000)], [hr(1000), hr(2000)]);
    expect(merged.map((s) => s.t)).toEqual([1000, 2000]);
  });

  it('treats near-identical timestamps as one sample', () => {
    // The band's clock drifted 80 ms against the phone's.
    const merged = mergeTimeSeries([hr(1000), hr(2000)], [hr(1080), hr(2080)]);
    expect(merged).toHaveLength(2);
    expect(merged.map((s) => s.t)).toEqual([1000, 2000]);
  });

  it('keeps genuinely distinct samples just outside the tolerance', () => {
    const merged = mergeTimeSeries([hr(1000)], [hr(1300)], { toleranceMs: 250 });
    expect(merged.map((s) => s.t)).toEqual([1000, 1300]);
  });

  it('prefers the sample already held, timestamped by the phone', () => {
    const merged = mergeTimeSeries([hr(1000, 60)], [hr(1050, 99)]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.bpm).toBe(60);
  });

  it('is idempotent — merging the same backlog twice changes nothing', () => {
    const live = [hr(1000), hr(2000), hr(3000)];
    const backlog = [hr(1010), hr(2010), hr(3010), hr(4000)];
    const once = mergeTimeSeries(live, backlog);
    const twice = mergeTimeSeries(once, backlog);
    expect(twice).toEqual(once);
    expect(mergeTimeSeries(twice, backlog)).toEqual(once);
  });

  it('fills a gap where the phone was out of range', () => {
    const live = [hr(1000), hr(2000), hr(9000), hr(10_000)];
    const backlog = Array.from({ length: 9 }, (_, i) => hr(2000 + (i + 1) * 700));
    const merged = mergeTimeSeries(live, backlog);
    expect(merged.length).toBeGreaterThan(live.length);
    // Still strictly ordered, with no duplicated instants.
    for (let i = 1; i < merged.length; i++) {
      expect(merged[i]!.t).toBeGreaterThan(merged[i - 1]!.t);
    }
  });

  it('adds nothing when the whole backlog duplicates what is held', () => {
    const held = Array.from({ length: 200 }, (_, i) => hr(i * 100));
    const shifted = held.map((s) => hr(s.t + 40));
    expect(mergeTimeSeries(held, shifted)).toHaveLength(held.length);
  });

  it('never drops data the caller already had, however dense', () => {
    // Existing samples closer together than the tolerance are the caller's own
    // data, not duplicates. Deduplication applies to the incoming backlog only:
    // silently discarding stored samples would be a worse bug than keeping a
    // redundant one.
    const dense = Array.from({ length: 50 }, (_, i) => hr(i * 40));
    expect(mergeTimeSeries(dense, [])).toHaveLength(50);
    expect(mergeTimeSeries(dense, [hr(20)])).toHaveLength(50);
  });
});

describe('mergeSessions', () => {
  const start = Date.parse('2026-04-01T22:00:00Z');

  function session(overrides: Partial<RecordedSession> = {}): RecordedSession {
    return {
      id: 'a',
      kind: 'sleep',
      startedAt: start,
      endedAt: start + 3_600_000,
      samples: [hr(start), hr(start + 1000)],
      ...overrides,
    };
  }

  it('adds an unrelated session rather than merging it', () => {
    const merged = mergeSessions(
      [session()],
      [session({ id: 'b', startedAt: start + 86_400_000, endedAt: start + 90_000_000 })],
    );
    expect(merged).toHaveLength(2);
  });

  it('merges sessions sharing an id', () => {
    const merged = mergeSessions(
      [session()],
      [session({ samples: [hr(start + 2000), hr(start + 3000)] })],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]!.samples).toHaveLength(4);
  });

  it('merges differently-named sessions covering the same window', () => {
    const fromPhone = session({ id: 'phone-1' });
    const fromBand = session({
      id: 'band-77',
      samples: [hr(start + 500), hr(start + 1500)],
    });
    const merged = mergeSessions([fromPhone], [fromBand]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.id).toBe('phone-1');
  });

  it('does not merge different kinds that happen to overlap', () => {
    const merged = mergeSessions(
      [session({ kind: 'sleep' })],
      [session({ id: 'w', kind: 'workout' })],
    );
    expect(merged).toHaveLength(2);
  });

  it('does not merge sessions that barely touch', () => {
    const merged = mergeSessions(
      [session({ id: 'a', startedAt: start, endedAt: start + 3_600_000 })],
      [
        session({
          id: 'b',
          startedAt: start + 3_500_000,
          endedAt: start + 7_200_000,
          samples: [hr(start + 3_600_000)],
        }),
      ],
    );
    expect(merged).toHaveLength(2);
  });

  it('widens the window to span both views of the recording', () => {
    const merged = mergeSessions(
      [session({ startedAt: start + 60_000, endedAt: start + 3_600_000 })],
      [session({ id: 'band', startedAt: start, endedAt: start + 3_660_000 })],
    );
    expect(merged[0]!.startedAt).toBe(start);
    expect(merged[0]!.endedAt).toBe(start + 3_660_000);
  });

  it('returns sessions in chronological order', () => {
    const later = session({ id: 'later', startedAt: start + 86_400_000, endedAt: start + 90_000_000 });
    const merged = mergeSessions([later], [session()]);
    expect(merged.map((s) => s.id)).toEqual(['a', 'later']);
  });

  it('does not mutate the sessions it was given', () => {
    const original = session();
    const before = original.samples.length;
    mergeSessions([original], [session({ samples: [hr(start + 5000)] })]);
    expect(original.samples).toHaveLength(before);
  });

  it('merges every channel a screenless band records', () => {
    const phone = session({
      eda: [{ t: start, microSiemens: 5 }],
      temperature: [{ t: start, celsius: 33 }],
      motion: [{ t: start, magnitudeG: 0.01 }],
    });
    const band = session({
      id: 'band',
      eda: [{ t: start + 500, microSiemens: 5.2 }],
      temperature: [{ t: start + 60_000, celsius: 33.1 }],
      motion: [{ t: start + 1000, magnitudeG: 0.02 }],
    });
    const merged = mergeSessions([phone], [band])[0]!;
    expect(merged.eda).toHaveLength(2);
    expect(merged.temperature).toHaveLength(2);
    expect(merged.motion).toHaveLength(2);
  });

  it('keeps EDA neighbours that the heart-rate tolerance would have swallowed', () => {
    // 4 Hz EDA means samples 250 ms apart — exactly the default tolerance.
    const phone = session({
      eda: Array.from({ length: 8 }, (_, i) => ({
        t: start + i * 250,
        microSiemens: 5,
      })),
    });
    const merged = mergeSession(phone, session({ id: 'band', eda: [] }));
    expect(merged.eda).toHaveLength(8);
  });
});

describe('backfill does not corrupt a day', () => {
  const bedtime = Date.parse('2026-04-10T23:00:00Z');
  const night = syntheticNight(bedtime, 8);
  const sleep: RecordedSession = {
    id: 'night',
    kind: 'sleep',
    startedAt: bedtime,
    endedAt: bedtime + 8 * 3_600_000,
    samples: night.hr,
    motion: night.motion,
  };

  const workoutStart = Date.parse('2026-04-11T18:00:00Z');
  const workout: RecordedSession = {
    id: 'workout',
    kind: 'workout',
    startedAt: workoutStart,
    endedAt: workoutStart + 40 * 60_000,
    samples: syntheticWorkout(workoutStart, 40),
  };

  it('scores the same day identically after re-syncing the same backlog', () => {
    const once = summarizeDays(mergeSessions([sleep, workout], [sleep, workout]), profile);
    const twice = summarizeDays(
      mergeSessions(mergeSessions([sleep, workout], [sleep, workout]), [sleep, workout]),
      profile,
    );
    expect(twice).toEqual(once);
  });

  it('does not double-count strain when a workout arrives twice', () => {
    const single = summarizeDays([workout], profile);
    const resynced = summarizeDays(mergeSessions([workout], [workout]), profile);
    expect(resynced[0]!.strain!.strain).toBeCloseTo(single[0]!.strain!.strain, 6);
    expect(resynced[0]!.strain!.durationMin).toBeCloseTo(
      single[0]!.strain!.durationMin,
      6,
    );
  });

  it('does not distort HRV when a night arrives twice', () => {
    const single = summarizeDays([sleep], profile);
    const resynced = summarizeDays(mergeSessions([sleep], [sleep]), profile);
    expect(resynced[0]!.rmssd!).toBeCloseTo(single[0]!.rmssd!, 6);
    expect(resynced[0]!.restingHr!).toBeCloseTo(single[0]!.restingHr!, 6);
  });

  it('shows what going unmerged would have cost', () => {
    // The failure this module exists to prevent: the same night concatenated
    // rather than merged doubles every beat and moves the numbers.
    const naive: RecordedSession = {
      ...sleep,
      samples: [...sleep.samples, ...sleep.samples].sort((a, b) => a.t - b.t),
    };
    const merged = summarizeDays(mergeSessions([sleep], [sleep]), profile);
    const doubled = summarizeDays([naive], profile);
    expect(doubled[0]!.rmssd!).not.toBeCloseTo(merged[0]!.rmssd!, 1);
  });
});
