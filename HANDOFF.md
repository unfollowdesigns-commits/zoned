# Handoff — paste this into a new Claude session

Everything below is the current state of this project plus the next task. Copy
the whole block. If you are in Claude Code with the repo checked out, it will
read the files itself; if you are in plain chat, the block is self-contained
enough to work from.

---

## The prompt

```
Project: Zoned — an open, self-built wearable recovery tracker.
Repo: unfollowdesigns-commits/zoned, branch claude/custom-whoop-bracelet-app-qatmb4

WHAT EXISTS (all committed, all passing):
- packages/core — TypeScript physiology engine, 151 vitest tests, no device or
  network dependency. HRV (RMSSD/SDNN/pNN50 with artifact rejection), resting
  HR, respiratory rate from RSA, Cole-Kripke sleep/wake, EDA decomposition and
  SCR detection, fused stress score, cortisol diurnal analysis (CAR + slope),
  Banister TRIMP strain, recovery score, idempotent backfill merging, and a
  custom BLE service for skin conductance / haptics / log transfer.
- apps/mobile — Expo app, BLE scan/connect/record, local-first storage.
  Installs SEPARATELY from the root (cd apps/mobile && npm install): React
  Native pins React 18, Next.js pins React 19, one hoisted copy cannot serve
  both.
- apps/web — Next.js 15 dashboard, runs on generated demo data when no backend
  is configured.
- supabase/migrations — 0001 core schema, 0002 stress channels. RLS on
  everything.
- docs/HARDWARE.md, SETUP.md, ARCHITECTURE.md, ROADMAP.md
- Published assembly sheet:
  https://claude.ai/code/artifact/a0954ae5-185e-4e4c-a5ba-1b8e015fa2c9

THE HARDWARE, as specced: a screenless band, 37 x 29 x 13 mm, ~31 g, ~4 days
battery. Raytac MDBT53-1M (nRF5340) radio, MAXM86161 optical module, AD5940
for skin conductance and future cortisol electrochemistry, TMP117, LSM6DSV16X,
nPM1300, 16 MB flash, LRA haptics, 300 mAh cell, no display.

NEXT TASK — the enclosure, which is the one unfinished part of the bill of
materials. BOM items 14 and 15 ("resin-printed shell", "TPU strap") are the
only lines with no orderable part number, and they were written as if they were
purchasable. Fix that:

1. Replace item 15 with a real strap: a standard 24 mm quick-release silicone
   strap, and specify the lug geometry on the body (24 mm slot, 2.5 mm horns
   either side of the 29 mm body).
2. Replace item 14 with made-to-order printing — JLC3DP, PCBWay or Shapeways —
   and be explicit that no off-the-shelf bracelet exists that these parts drop
   into, because every wearable case is moulded around its own board.
3. Add the lug geometry to the fit budget in docs/HARDWARE.md.
4. Fold in these part corrections found while sourcing:
   - Raytac MDBT53-1M is 9.3 x 14.3 x 1.85 mm, not 10.5 x 15.5 x 2.0. The stack
     is therefore ~12.9 mm, not 13.0.
   - Use AD5940 (AD5940BCBZ-RL7), not AD5941 — same family, easier to source.
   - nPM1300 fallback if unavailable: MCP73831T-2ACI/OT charger plus
     TPS63020DSJR buck-boost. Loses the fuel gauge.
   - Optical window: a flat 6 mm mineral watch crystal, not an "optical window".
   - Electrodes: gold ENIG pads on the PCB itself, not Ag/AgCl components —
     Ag/AgCl dry electrodes are not purchasable at this scale.
   - Haptics: Jinlong G0832012 or an Adafruit DRV2605L + LRA breakout;
     Vybronics does not sell in single quantities.
   - A Qi receiver IC (BQ51013BRHLR) was missing from the BOM entirely. Simpler
     fix: drop wireless charging for v1 and use two pogo pins, which pot fine
     and still leave no hole in the case.
5. Update the published artifact at the URL above (pass it as `url`) and
   docs/HARDWARE.md together so they do not drift.

RULES THAT MATTER — do not quietly undo these:
- No wearable on sale measures cortisol. Say so. Saliva kits only; the AD5940
  is there so a future strip needs no new board.
- Skin conductance at the wrist is weaker than at the palm — fewer sweat
  glands, more motion-sensitive. Do not oversell it.
- Wrist optical HRV is worse than a chest strap. Say so.
- Sleep staging without EEG is an estimate, not a measurement.
- Never state a dimension or a fit without doing the arithmetic. An earlier
  version of this spec claimed 12 mm while the drawn stack was actually
  16.4 mm, because the haptic motor sat above the battery instead of beside it.
  Show the layer-by-layer budget for any change to the geometry.

Start by reading docs/HARDWARE.md and the "Does it fit?" section, then do the
above.
```

---

## Other threads, if you want a different task

- **Firmware** — nothing written yet. Zephyr on the nRF5340, advertising the
  standard Heart Rate Service (0x180D) plus the custom Zoned service defined in
  `packages/core/src/ble.ts`. Getting a dev kit to advertise a fake heart rate
  is the first milestone; the app connects to it with no changes.
- **App auth and sync** — the schema and the sync code exist, but the mobile app
  has no sign-in screen, so cloud sync cannot be used yet.
- **Automatic sleep detection** — currently you tap to start a sleep recording.
- **Tuning the scores** — `docs/ROADMAP.md` stage 2. The recovery and stress
  weights are a defensible starting point, not tuned to anyone. This needs a
  month of your own data plus a morning journal before it is worth doing.
