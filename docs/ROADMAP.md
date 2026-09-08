# Roadmap

Ordered so that each stage is useful on its own and each one de-risks the next.
You have never done this before; that is fine, because nothing below requires
knowing the next thing before you finish the current one.

## Stage 0 — done

The foundation, in this repository already:

- [x] Physiology engine with 64 tests (`packages/core`)
- [x] Bluetooth Heart Rate Service decoding
- [x] Phone app: scan, connect, live heart rate and HRV, record sessions
- [x] Local-first storage that survives a dead network
- [x] Web dashboard with demo data
- [x] Database schema with row level security

## Stage 1 — get real data (week 1)

**Goal: one number on screen that came out of your own chest.**

- [ ] Buy a Polar H10 (`docs/HARDWARE.md`)
- [ ] Build the app onto your phone (`docs/SETUP.md` step 3)
- [ ] Record a three-minute resting reading and check the artifact rate
- [ ] Sleep in the strap for seven consecutive nights

Seven nights is the point of this stage. Recovery is a comparison against your
own normal, and until the baseline fills, the app deliberately tells you it is
still learning instead of showing a confident number.

## Stage 2 — make the scores yours (weeks 2–6)

**Goal: the numbers agree with how you actually feel.**

- [ ] Add a morning journal: alcohol, late meal, stress, soreness, illness
      (the `journal_entries` table is already in the schema)
- [ ] Log a subjective 1–5 "how do I feel" each morning
- [ ] After a month, compare your subjective score against the computed one

Then tune. The weights in `packages/core/src/recovery.ts` are a defensible
starting point, not the truth about your body:

```ts
const WEIGHTS = {
  hrv: 0.5,
  restingHr: 0.25,
  sleep: 0.15,
  respiratoryRate: 0.1,
};
```

If your subjective mornings track sleep more than HRV, change the weights. This
is the part where the project stops being a clone and starts being yours.

Also worth tuning:
- `halfLifeDays` in `baseline.ts` — how fast your normal adapts (14 days default)
- `countScale` in `sleep.ts` — motion calibration, once you have an accelerometer
- The strain curve constants in `strain.ts`

## Stage 3 — make it pleasant to live with (weeks 4–8)

- [ ] Automatic sleep detection, so you stop tapping "start recording" at bedtime
- [ ] Background BLE so the screen can be off during a workout
- [ ] Sign-in and real sync (the schema is ready; the app has no auth screen yet)
- [ ] Push notification with your recovery score in the morning
- [ ] Strain target: "to hit a strain of 14 today, spend 40 minutes in zone 3"

## Stage 4 — your own hardware (months)

Only worth starting once stages 1–3 are boring. Detail in `docs/HARDWARE.md`.

- [ ] Buy a PineTime or Bangle.js 2 and flash firmware that advertises the
      standard Heart Rate Service — the app connects with zero changes
- [ ] Get the accelerometer streaming so sleep staging stops running blind
- [ ] Compare your band against the H10 on the same night, and be honest about
      the difference
- [ ] Only then: custom nRF52840 board, battery, case

## Stage 5 — things a commercial product cannot do for you

Where a self-built tracker actually wins:

- [ ] Export everything; it is your data in your database
- [ ] Correlate against anything you like — training log, calendar, weather,
      caffeine, work stress
- [ ] Try scoring models a company would never ship: per-sport strain, menstrual
      cycle phase, altitude adjustment, illness detection from respiratory rate
- [ ] No subscription

## Deliberately not doing

- **Blood pressure.** Not reliably possible from a wrist optical sensor.
- **Medical-grade anything.** This is a training tool.
- **Beating Whoop's accuracy.** With a chest strap you will match or beat it on
  HRV; on wrist-based sleep staging you will not, and pretending otherwise would
  make the numbers useless.
