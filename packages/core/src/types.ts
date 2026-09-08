/**
 * Shared vocabulary for the whole system.
 *
 * Every layer above this one — the BLE reader on the phone, the database, the
 * web dashboard — speaks in these types, so swapping the chest strap for a
 * wrist band later changes only the code that produces `HeartRateSample`.
 */

/** Milliseconds since the Unix epoch. */
export type EpochMs = number;

/**
 * One notification from a heart-rate sensor.
 *
 * `rrIntervals` is the interesting part: the precise time in milliseconds
 * between consecutive heartbeats. HRV is computed from these, not from `bpm`.
 * Cheap optical sensors often omit them, which is why the chest strap comes
 * first — see docs/HARDWARE.md.
 */
export interface HeartRateSample {
  t: EpochMs;
  bpm: number;
  /** Beat-to-beat intervals in ms, oldest first. Empty if unsupported. */
  rrIntervals: number[];
  /** Sensor contact, when the device reports it. */
  contact?: boolean;
  /** Cumulative kJ since session start, when the device reports it. */
  energyKj?: number;
}

/** Accelerometer magnitude sample, used for sleep/wake detection. */
export interface MotionSample {
  t: EpochMs;
  /** Vector magnitude in g, gravity already removed. */
  magnitudeG: number;
}

/** A contiguous stretch of recording — a workout, a night, or an idle hour. */
export interface Session {
  id: string;
  startedAt: EpochMs;
  endedAt: EpochMs;
  kind: SessionKind;
  samples: HeartRateSample[];
  motion?: MotionSample[];
}

export type SessionKind = 'workout' | 'sleep' | 'rest' | 'daily';

/** Time-domain HRV, all computed over artifact-corrected NN intervals. */
export interface HrvMetrics {
  /** Root mean square of successive differences, ms. The headline number. */
  rmssd: number;
  /** Natural log of RMSSD. More normally distributed; better for baselines. */
  lnRmssd: number;
  /** Standard deviation of NN intervals, ms. */
  sdnn: number;
  /** Share of successive pairs differing by more than 50 ms, 0..1. */
  pnn50: number;
  /** Mean heart rate over the window, bpm. */
  meanHr: number;
  /** Beats kept after artifact rejection. */
  beatsUsed: number;
  /** Share of raw beats discarded as artifacts, 0..1. */
  artifactRate: number;
}

/** A rolling personal normal for one metric. */
export interface Baseline {
  metric: string;
  /** Exponentially weighted mean. */
  mean: number;
  /** Exponentially weighted standard deviation. */
  sd: number;
  /** Days of data folded in so far. */
  samples: number;
  /** False until enough days exist for the baseline to mean anything. */
  ready: boolean;
}

export interface RecoveryInput {
  /** This morning's HRV, measured during the last slow-wave sleep window. */
  lnRmssd: number;
  /** This morning's resting heart rate, bpm. */
  restingHr: number;
  /** Overnight respiratory rate, breaths per minute. Optional. */
  respiratoryRate?: number;
  /** Sleep performance 0..1 — hours slept over hours needed. Optional. */
  sleepPerformance?: number;
  baselines: {
    lnRmssd: Baseline;
    restingHr: Baseline;
    respiratoryRate?: Baseline;
  };
}

export interface RecoveryScore {
  /** 0..100. Green >= 67, yellow >= 34, red below. */
  score: number;
  band: 'red' | 'yellow' | 'green';
  /** How far each input sits from your own normal, in standard deviations. */
  contributions: {
    hrv: number;
    restingHr: number;
    respiratoryRate?: number;
    sleep?: number;
  };
  /** False while baselines are still filling; show the number greyed out. */
  confident: boolean;
}

export interface StrainScore {
  /** 0..21, logarithmic — the top of the scale is deliberately hard to reach. */
  strain: number;
  /** Banister TRIMP, the raw training load this is derived from. */
  trimp: number;
  /** Minutes spent in each of the five heart-rate zones. */
  zoneMinutes: [number, number, number, number, number];
  averageHr: number;
  maxHr: number;
  durationMin: number;
}

export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';

export interface SleepEpoch {
  t: EpochMs;
  stage: SleepStage;
  meanHr: number;
  motion: number;
}

export interface SleepSummary {
  startedAt: EpochMs;
  endedAt: EpochMs;
  /** Minutes actually asleep, excluding wake epochs. */
  asleepMin: number;
  /** Minutes between falling asleep and final wake, including wake epochs. */
  inBedMin: number;
  /** asleepMin / inBedMin, 0..1. */
  efficiency: number;
  stageMinutes: Record<SleepStage, number>;
  /** How many times you woke. */
  disturbances: number;
  epochs: SleepEpoch[];
}

/** Everything a person's profile needs for the scores to be personal. */
export interface UserProfile {
  /** Used only to estimate maxHr when `maxHr` is absent. */
  age: number;
  /** Measured max HR beats a formula every time. */
  maxHr?: number;
  restingHr: number;
  sex?: 'male' | 'female' | 'unspecified';
  /** Hours of sleep this person needs. Defaults to 8. */
  sleepNeedHours?: number;
}
