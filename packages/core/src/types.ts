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

// ---------------------------------------------------------------------------
// Stress channels
//
// Heart rate alone cannot separate "excited" from "stressed". These are the
// signals that can: electrodermal activity is a direct readout of sympathetic
// nervous system drive, skin temperature tracks peripheral vasoconstriction,
// and cortisol is the hormone itself.
// ---------------------------------------------------------------------------

/**
 * Electrodermal activity — skin conductance in microsiemens.
 *
 * Sweat glands are driven exclusively by the sympathetic branch of the nervous
 * system, with no parasympathetic input at all. That makes EDA the cleanest
 * non-invasive window onto arousal there is: when conductance rises, something
 * has switched you on.
 *
 * Requires two skin-contact electrodes and an impedance front end — see
 * docs/HARDWARE.md. A chest strap cannot produce this.
 */
export interface EdaSample {
  t: EpochMs;
  /** Skin conductance, microsiemens. Typical resting range 1-20 µS. */
  microSiemens: number;
}

/** Skin temperature, which falls as stress constricts peripheral blood flow. */
export interface TemperatureSample {
  t: EpochMs;
  celsius: number;
}

/**
 * A cortisol measurement.
 *
 * As of now this comes from a lab, not from your wrist: a saliva kit, a blood
 * draw, or a hair segment. `sweat` exists so that a future biosensor strip
 * needs no schema change — the electrochemical front end in the recommended
 * build can already drive one.
 */
export interface CortisolReading {
  t: EpochMs;
  /** Concentration in nmol/L. Saliva and serum differ by ~20x — see cortisol.ts. */
  nmolPerL: number;
  source: 'saliva' | 'serum' | 'hair' | 'sweat';
  /** When you woke that day. Cortisol means nothing without it. */
  wakeTime?: EpochMs;
  note?: string;
}

/** Electrodermal activity summarised over a window. */
export interface EdaMetrics {
  /** Tonic skin conductance level, µS — the slow baseline. */
  meanScl: number;
  /**
   * Skin conductance responses per minute — discrete bursts of sympathetic
   * activity. The headline arousal number; more responses means more drive.
   */
  scrPerMin: number;
  /** Mean height of those bursts, µS. */
  meanScrAmplitude: number;
  scrCount: number;
  /** Share of the window discarded as electrode noise or lost contact, 0..1. */
  artifactRate: number;
  durationMin: number;
}

export interface StressScore {
  /** 0..100, higher means more sympathetic load. The inverse of recovery. */
  score: number;
  band: 'calm' | 'moderate' | 'elevated' | 'high';
  /** Deviation from your own normal, in standard deviations, per channel. */
  contributions: {
    eda?: number;
    hrv?: number;
    heartRate?: number;
    skinTemperature?: number;
  };
  /** Which channels were actually available. */
  channels: string[];
  /** False while baselines are still filling. */
  confident: boolean;
}

/** A day's worth of cortisol samples, interpreted against the diurnal rhythm. */
export interface CortisolProfile {
  day: string;
  /**
   * Cortisol awakening response: the rise from waking to roughly 30 minutes
   * later, as a fraction of the waking value. The most validated single marker
   * of HPA-axis function. Null unless both samples exist.
   */
  car: number | null;
  /**
   * Diurnal slope: regression of ln(cortisol) against hours since waking.
   * Healthy is steeply negative. A flattened slope is the signature associated
   * with chronic stress. Null with fewer than three samples.
   */
  diurnalSlope: number | null;
  /** Total exposure across the day, area under the curve. */
  auc: number | null;
  /**
   * How far each sample sat from the population reference curve, as ln(ratio).
   * Positive means higher than typical for that time of day.
   */
  deviations: Array<{ t: EpochMs; hoursSinceWake: number; lnRatio: number }>;
  readings: CortisolReading[];
}
