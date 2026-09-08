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
| `packages/core/src/daily.ts` | Rolls sessions up into one row per day. Shared by both apps. |
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
| **Strain 0–21** | **This project's own** log curve over TRIMP. Not Whoop's formula. |
| **Recovery 0–100** | **This project's own** weighting of HRV, RHR, respiratory rate and sleep. |

The last two are the ones to tune. See `docs/ROADMAP.md`.
