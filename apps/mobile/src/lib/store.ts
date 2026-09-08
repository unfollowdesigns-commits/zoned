/**
 * Local-first storage.
 *
 * The phone is the source of truth: a recording is written to disk the instant
 * it stops, and only then queued for upload. That ordering means a dead network
 * or an unconfigured Supabase project can never cost you a night's data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  emptyBaseline,
  updateBaseline,
  type Baseline,
  type DayMetrics,
  type HeartRateSample,
  type MotionSample,
  type RecordedSession,
  type UserProfile,
} from '@zoned/core';
import { supabase } from './supabase';

const KEYS = {
  sessions: 'zoned.sessions.v1',
  baselines: 'zoned.baselines.v1',
  profile: 'zoned.profile.v1',
  pending: 'zoned.pending.v1',
};

/** A recording as it sits on the phone: core's shape plus sync bookkeeping. */
export interface StoredSession extends RecordedSession {
  motion: MotionSample[];
  /** Set once uploaded, so a retry never duplicates a session. */
  syncedAt?: number;
}

export type { DayMetrics, RecordedSession };

export const DEFAULT_PROFILE: UserProfile = {
  age: 30,
  restingHr: 55,
  sex: 'unspecified',
  sleepNeedHours: 8,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const loadProfile = () => readJson<UserProfile>(KEYS.profile, DEFAULT_PROFILE);
export const saveProfile = (profile: UserProfile) => writeJson(KEYS.profile, profile);
export const loadSessions = () => readJson<StoredSession[]>(KEYS.sessions, []);

export async function saveSession(
  session: Omit<StoredSession, 'id'> & { id?: string },
): Promise<StoredSession> {
  const stored: StoredSession = {
    ...session,
    id: session.id ?? `${session.startedAt}-${session.kind}`,
  };
  const sessions = await loadSessions();
  const next = [...sessions.filter((s) => s.id !== stored.id), stored].sort(
    (a, b) => a.startedAt - b.startedAt,
  );
  await writeJson(KEYS.sessions, next);
  return stored;
}

export async function deleteSession(id: string): Promise<void> {
  const sessions = await loadSessions();
  await writeJson(KEYS.sessions, sessions.filter((s) => s.id !== id));
}

// The daily rollup lives in @zoned/core so the phone and the web dashboard
// cannot disagree about what your recovery was on a given day.
export { dayKey, summarizeDays } from '@zoned/core';

export async function loadBaselines(): Promise<Record<string, Baseline>> {
  return readJson<Record<string, Baseline>>(KEYS.baselines, {
    lnRmssd: emptyBaseline('lnRmssd'),
    restingHr: emptyBaseline('restingHr'),
    respiratoryRate: emptyBaseline('respiratoryRate'),
  });
}

export async function pushBaseline(metric: string, value: number): Promise<Baseline> {
  const baselines = await loadBaselines();
  const updated = updateBaseline(baselines[metric] ?? emptyBaseline(metric), value);
  await writeJson(KEYS.baselines, { ...baselines, [metric]: updated });
  return updated;
}

/**
 * Upload anything not yet synced. Safe to call repeatedly and safe to fail:
 * a session is marked synced only once the server has confirmed both the
 * session row and its samples, so an interrupted upload retries cleanly.
 */
export async function syncPending(): Promise<{ uploaded: number; failed: number }> {
  if (!supabase) return { uploaded: 0, failed: 0 };

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return { uploaded: 0, failed: 0 };

  const sessions = await loadSessions();
  let uploaded = 0;
  let failed = 0;

  for (const session of sessions) {
    if (session.syncedAt) continue;

    const { data: row, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        kind: session.kind,
        started_at: new Date(session.startedAt).toISOString(),
        ended_at: new Date(session.endedAt).toISOString(),
        summary: {
          localId: session.id,
          sampleCount: session.samples.length,
          motionCount: session.motion.length,
        },
      })
      .select('id')
      .single();

    if (sessionError || !row) {
      failed++;
      continue;
    }

    // Samples go up in chunks so one long night does not become a single
    // multi-megabyte request that times out on a phone connection.
    const chunkMinutes = 30;
    const chunkMs = chunkMinutes * 60_000;
    const chunks = new Map<number, { hr: HeartRateSample[]; motion: MotionSample[] }>();
    const bucketOf = (t: number) =>
      session.startedAt + Math.floor((t - session.startedAt) / chunkMs) * chunkMs;

    for (const sample of session.samples) {
      const key = bucketOf(sample.t);
      const chunk = chunks.get(key) ?? { hr: [], motion: [] };
      chunk.hr.push(sample);
      chunks.set(key, chunk);
    }
    for (const sample of session.motion) {
      const key = bucketOf(sample.t);
      const chunk = chunks.get(key) ?? { hr: [], motion: [] };
      chunk.motion.push(sample);
      chunks.set(key, chunk);
    }

    const payload = [...chunks.entries()].map(([startedAt, chunk]) => ({
      session_id: row.id,
      user_id: userId,
      started_at: new Date(startedAt).toISOString(),
      heart_rate: chunk.hr.map((s) => ({ t: s.t, bpm: s.bpm, rr: s.rrIntervals })),
      motion: chunk.motion.map((m) => ({ t: m.t, g: m.magnitudeG })),
    }));

    const { error: samplesError } = payload.length
      ? await supabase.from('samples').insert(payload)
      : { error: null };

    if (samplesError) {
      // Roll back the orphaned session row rather than leave a half-uploaded
      // day that would be counted twice on the next attempt.
      await supabase.from('sessions').delete().eq('id', row.id);
      failed++;
      continue;
    }

    session.syncedAt = Date.now();
    uploaded++;
  }

  await writeJson(KEYS.sessions, sessions);
  return { uploaded, failed };
}

export const storageKeys = KEYS;
