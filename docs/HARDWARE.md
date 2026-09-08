# Hardware

## The short answer

You do not need to build a wrist band to start. You need a sensor that reports
**RR intervals** — the precise gap in milliseconds between consecutive
heartbeats — over the standard Bluetooth Heart Rate Service. Everything this
project computes is derived from those numbers.

Buy the chest strap first. Build the band later, if you still want to.

## Why a chest strap first

Recovery scores live or die on HRV, and HRV lives or dies on beat timing
accuracy. A chest strap reads the heart's electrical signal directly — the same
principle as an ECG. An optical wrist sensor infers beats from blood flow
through skin, which is a harder problem, and cheap optical modules typically
report a smoothed heart rate with no beat-to-beat timing at all.

If you start at the wrist you will spend your first month fighting sensor noise
and never know whether a bad number is your body or your hardware. Start with a
sensor you can trust, get the whole pipeline working, then swap the sensor.

That swap is cheap by design: `packages/core/src/ble.ts` decodes the public
Bluetooth standard, so anything compliant — including firmware you write — drops
straight in.

## What to buy

| Item | Roughly | Why |
|---|---|---|
| **Polar H10** chest strap | £70–90 / $80–100 | The reference device for consumer HRV. Reports RR intervals, has an accessible open format, and is what validation studies compare against. |
| Polar Verity Sense (optional) | £70 / $80 | Optical armband. More comfortable overnight; less precise. Useful later for comparing sensors. |

Alternatives that also expose RR intervals: Garmin HRM-Dual, Wahoo TICKR,
Decathlon/Kalenji Dual. Avoid anything advertising "heart rate only" — check for
RR interval or HRV support before buying.

You also need a phone with Bluetooth Low Energy, which is any phone made in the
last decade.

### Using the strap overnight

Wet the electrodes. A dry strap loses contact, and lost contact shows up as
artifacts, which the filter throws away — the app shows you the artifact rate on
the Live screen for exactly this reason. Above about 5% is a fit problem, not a
you problem.

## Building your own band — the honest version

This is a real project, not a weekend. Broken into stages, each of which is
useful on its own:

### Stage 1 — a hackable watch (a weekend, ~£30–80)

Buy a **PineTime** or **Bangle.js 2**. Both are finished watches with a PPG
sensor, an accelerometer, a screen and a battery, and both are designed to be
reflashed. You write firmware that advertises the standard Heart Rate Service,
and this app connects to it with no changes.

Start here. You will learn how the sensor behaves on a real wrist before you
have committed to a circuit board.

### Stage 2 — your own board (weeks to months, ~£40 in parts)

| Part | Typical choice | Role |
|---|---|---|
| MCU with BLE | nRF52840 module | Runs firmware, talks Bluetooth |
| Optical sensor | MAX30102 or MAX86141 | Green LED + photodiode; MAX86141 is much better and much fiddlier |
| Accelerometer | LIS3DH or LSM6DS3 | Motion for sleep/wake, and for rejecting movement artifacts |
| Battery | 100–150 mAh LiPo | A few days between charges if you are careful |
| Charging | TP4056 module, or Qi | USB is easier; wireless is nicer to wear |
| Case | 3D printed, TPU strap | Iterate until it stops moving on your wrist |

The hard parts, in the order they will bite you:

1. **Optical signal quality.** Raw PPG is a wobbly waveform, not a heart rate.
   Turning it into beat timings good enough for HRV needs band-pass filtering,
   peak detection and motion-artifact rejection using the accelerometer. This is
   the actual engineering content of a wearable.
2. **Mechanical fit.** Sensor-to-skin pressure and stray light dominate signal
   quality. Most of your iterations will be on the case and strap.
3. **Power.** A continuously sampling optical front end will flatten a small
   battery in hours. Duty cycling — sampling in bursts and sleeping between — is
   what makes multi-day battery life possible.

### Stage 3 — polish

Waterproofing, on-device storage for when the phone is out of range, over-the-
air firmware updates.

## Calibrating motion

`analyzeSleep` scales raw accelerometer magnitude into the "activity counts" the
Cole-Kripke algorithm expects, via `countScale`. That constant is
device-specific. To calibrate: record a night, then adjust `countScale` until the
detected wake times match when you actually remember being awake. The default of
100 is a starting point, not a measurement.

## What you cannot do

Be clear-eyed about this so you are not disappointed later:

- **Blood pressure** from a wrist optical sensor is not reliably possible.
- **Blood oxygen** needs red *and* infrared LEDs and careful calibration; the
  cheap modules that claim it are not trustworthy.
- **True sleep staging** needs EEG. The staging here is an estimate from heart
  rate and stillness — good for the shape of a night, not for individual minutes.
- **Medical claims.** None of this is a medical device. It is for your own
  training and curiosity.
