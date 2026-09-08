import { summarizeDays, type DayMetrics, type RecordedSession, type UserProfile } from '@zoned/core';
import { supabase } from './supabase';
import { DEMO_PROFILE } from './demo';

interface SampleChunk {
  heart_rate: Array<{ t: number; bpm: number; rr: number[] }> | null;
  motion: Array<{ t: number; g: number }> | null;
}

interface SessionRow {
  id: string;
  kind: RecordedSession['kind'];
  started_at: string;
  ended_at: string;
  samples: SampleChunk[] | null;
}

/**
 * Pull recent sessions and score them.
 *
 * Returns null when the query fails so the page can fall back to demo data
 * rather than render an empty dashboard with no explanation.
 */
export async function loadDays(days = 60): Promise<DayMetrics[] | null> {
  if (!supabase) return null;

  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from('sessions')
    .select('id, kind, started_at, ended_at, samples(heart_rate, motion)')
    .gte('started_at', since)
    .order('started_at', { ascending: true });

  if (error || !data) return null;

  const sessions: RecordedSession[] = (data as unknown as SessionRow[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    startedAt: Date.parse(row.started_at),
    endedAt: Date.parse(row.ended_at),
    samples: (row.samples ?? []).flatMap((chunk) =>
      (chunk.heart_rate ?? []).map((s) => ({
        t: s.t,
        bpm: s.bpm,
        rrIntervals: s.rr ?? [],
      })),
    ),
    motion: (row.samples ?? []).flatMap((chunk) =>
      (chunk.motion ?? []).map((m) => ({ t: m.t, magnitudeG: m.g })),
    ),
  }));

  return summarizeDays(sessions, profile());
}

/** Placeholder until profile loading is wired to the signed-in user. */
function profile(): UserProfile {
  return DEMO_PROFILE;
}
