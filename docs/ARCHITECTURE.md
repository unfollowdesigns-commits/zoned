# Architecture

```
   chest strap                 phone                        cloud            browser
  ┌──────────┐        ┌─────────────────────┐        ┌──────────────┐    ┌─────────────┐
  │ Polar H10│  BLE   │  apps/mobile        │  HTTPS │  Supabase    │    │  apps/web   │
  │  or your ├───────>│  scan · connect     ├───────>│  Postgres    │<───┤  dashboard  │
  │  own band│  0x180D│  record · score     │        │  + RLS       │    │             │
  └──────────┘        └──────────┬──────────┘        └──────────────┘    └──────┬──────┘
                                 │                                              │
                                 └───────────────┬──────────────────────────────┘
                                                 v
                                        ┌──────────────────┐
                                        │  packages/core   │
                                        │  the physiology  │
                                        └──────────────────┘
```

## The one rule

**`packages/core` knows nothing about Bluetooth, networks, React or the DOM.**
It is pure functions over plain data. Everything else depends on it; it depends
on nothing.

That constraint buys three things:

1. **The maths is testable without hardware.** 64 tests run in under a second on
   a laptop with no strap attached. Physiology code you cannot test is
   physiology code you cannot trust.
2. **The phone and the dashboard cannot disagree.** `summarizeDays` lives in
   core and both apps call it, so "what was my recovery on Tuesday" has exactly
   one answer.
3. **The sensor is swappable.** Only `apps/mobile/src/ble/manager.ts` knows what
   a Bluetooth device is. Replacing the chest strap with your own band changes
   that file and nothing else.

## Layout

| Path | What it is |
|---|---|
| `packages/core/src/ble.ts` | Decodes the Bluetooth SIG Heart Rate Service. Pure; takes bytes, returns a sample. |
| `packages/core/src/hrv.ts` | Artifact rejection, RMSSD/SDNN/pNN50, respiratory rate, resting heart rate. |
| `packages/core/src/baseline.ts` | Exponentially weighted personal baselines and z-scores. |
| `packages/core/src/strain.ts` | Banister TRIMP mapped to a 0–21 logarithmic scale. |
| `packages/core/src/sleep.ts` | Cole-Kripke sleep/wake scoring plus heuristic staging. |
| `packages/core/src/recovery.ts` | The morning score: weighted z-scores through a logistic curve. |
| `packages/core/src/eda.ts` | Skin conductance: tonic/phasic decomposition and response detection. |
| `packages/core/src/stress.ts` | Fuses EDA, HRV, heart rate and skin temperature into one stress score. |
| `packages/core/src/cortisol.ts` | Lab cortisol read against the diurnal curve: awakening response, slope. |
| `packages/core/src/daily.ts` | Rolls sessions up into one row per day. Shared by both apps. |
| `packages/core/src/merge.ts` | Folds a standalone band's backlog into stored data without double-counting. |
| `packages/core/src/synthetic.ts` | Deterministic fake sensor data for tests and the demo. |
| `apps/mobile` | Expo app: BLE, recording, local storage, sync. |
| `apps/web` | Next.js dashboard: charts over the same scores. |
| `supabase/migrations` | Schema, row level security, triggers. |

## Decisions worth knowing

**Raw beat intervals are stored, not just scores.** Storage is cheap; the
scoring formulas are not final. Keeping the raw data means improving a formula
retroactively improves your entire history. If only the scores were kept, every
past day would be frozen at whatever the formula said the night it was recorded.

**The phone is the source of truth.** A recording is written to disk the moment
it stops and only then queued for upload, so a dead network or an unconfigured
Supabase project can never cost you a night.

**Nothing is scored until it can be scored honestly.** `computeHrv` returns
`null` rather than a number built on 12 beats. `RecoveryScore.confident` is
false until baselines have filled. A blank card beats a confident wrong number.

**Days are local, not UTC.** A night belongs to the calendar day you wake up on,
which is a local-time question.

**No dual-axis charts.** HRV rising and resting heart rate falling both mean
"recovered", but they are different scales — plotted on one chart with two
y-axes you can slide the scales until they tell any story you like. They are
two charts instead.

## Where the formulas came from

| Metric | Basis |
|---|---|
| RMSSD, SDNN, pNN50 | Standard time-domain HRV definitions (Task Force, 1996). |
| Artifact rejection | Local-median deviation threshold; 20% is the widely used default. |
| Respiratory rate | Respiratory sinus arrhythmia — zero crossings of the detrended tachogram. |
| Max heart rate | Tanaka et al. (2001), `208 − 0.7 × age`. More accurate than `220 − age`. |
| Training load | Banister TRIMP with the Karvonen heart rate reserve. |
| Sleep/wake | Cole et al. (1992) — the standard actigraphy algorithm. |
| EDA decomposition | Moving-median tonic estimate; skin conductance responses above a 0.05 µS threshold. |
| Cortisol awakening response | Rise from waking to the post-waking peak, as a fraction of the waking value. |
| Diurnal cortisol slope | Least squares fit of ln(cortisol) against hours since waking, excluding the awakening peak. |
| **Strain 0–21** | **This project's own** log curve over TRIMP. Not Whoop's formula. |
| **Recovery 0–100** | **This project's own** weighting of HRV, RHR, respiratory rate and sleep. |
| **Stress 0–100** | **This project's own** weighting of EDA, HRV, heart rate and skin temperature. |

The last three are the ones to tune. See `docs/ROADMAP.md`.

## Why the band has no screen

It is a band, not a watch. The display would have been the largest power draw on
the device, the hardest joint to waterproof, and a worse version of the phone
already in your pocket. Leaving it out buys about four days of battery and lets
the board be potted solid.

Two consequences land in this code rather than in the enclosure:

**Haptics are the only output.** `ble.ts` defines a deliberately small
vocabulary of five patterns, because a band that buzzes all day gets taken off
and a band you are not wearing measures nothing. `contact-lost` is the one that
earns its keep — on a watch you would glance down and see the artifact rate
climbing; here the band has to tell you or the night is wasted.

**The band records alone, so backfill must be idempotent.** With nothing to
glance at there is no reason to keep your phone nearby, so the band logs to
flash and replays later — and the same minutes arrive twice, once live and once
from flash with a drifted clock. `merge.ts` unions them within a tolerance sized
to the sampling interval. Appending instead would double every overlapping beat,
halve the apparent RR intervals and sum strain twice, with no screen on your
wrist to reveal it. That failure is pinned by a test.

## Why EDA is a separate channel

Heart rate cannot tell excitement from stress: both raise it. Sweat glands can,
because they are driven by the sympathetic nervous system with no
parasympathetic input at all — when skin conductance rises, something has
switched you on, and nothing else is competing to explain it.

This is why the stress score weights EDA highest when it is present, and why
`describeStress` says out loud that it is heart-rate-only when it is not. A
stress number derived from heart rate alone is a cardiac load number, and
labelling it otherwise would be the same trick as selling an HRV algorithm as a
cortisol sensor.
