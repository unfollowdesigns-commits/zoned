# Hardware

The complete bracelet. One bill of materials, nothing staged, nothing missing.

---

## Read this first: cortisol

**There is no cortisol bracelet you can buy. Not from anyone, at any price.**

Continuous cortisol sensing is real and it is close, but it is still in labs:

- **Adaptyx** unveiled the first continuous cortisol monitor in 2026, reading
  dermal interstitial fluid with DNA-based molecular switches. Award-winning,
  not on sale.
- **UC Irvine** built a wrist-worn device tracking molecular stress biomarkers
  alongside physiological ones. Research prototype.
- A **flexible sweat patch** tracking cortisol, glucose, lactate and urea for 21
  days was published in 2026. Also a prototype.

Any product marketed to you today as a "cortisol watch" is running an HRV
algorithm and putting a hormone's name on it. Do not pay for that.

So this build does two things instead, and both are real:

1. **Measures the nervous system directly** with electrodermal activity — the
   channel that actually distinguishes stress from exertion, and the one every
   research-grade stress wearable is built around. Consumer bands almost never
   include it.
2. **Ships cortisol-ready.** The chosen front end, the AD5941, does
   amperometric and voltammetric electrochemistry as well as skin impedance.
   That is precisely the measurement a cortisol biosensor strip requires. When
   strips become purchasable, you add electrodes and firmware — not a new board.

Meanwhile you get actual cortisol numbers from **saliva kits** (below), and the
app already computes the two measures that carry the signal: the cortisol
awakening response and the diurnal slope.

---

## What the bracelet measures

| Signal | Sensor | What it gives you |
|---|---|---|
| Heart rate & HRV | MAXM86161 optical module | RMSSD, resting HR, respiratory rate, recovery |
| **Electrodermal activity** | AD5941 + dry electrodes | **Sympathetic arousal — the real stress channel** |
| Skin temperature | TMP117 | Vasoconstriction, illness, sleep phase |
| Motion | LSM6DSV16X IMU | Sleep/wake, strain, motion-artifact rejection |
| ECG (optional, on-demand) | MAX30003 | Beat timing better than any optical sensor |
| Cortisol | AD5941 + future strip | Ready; strips not yet purchasable |

---

## The bill of materials

Prices are indicative. Everything is orderable from Mouser, DigiKey or Farnell.

### Core board

| # | Part | Purpose | ~Unit |
|---|---|---|---|
| 1 | **Nordic nRF5340** (or `Seeed XIAO nRF52840` to start) | Dual-core BLE 5.4 MCU. Application core for algorithms, network core for the radio, so signal processing never stalls Bluetooth. | £9 / £14 |
| 2 | **Maxim MAXM86161** | Complete optical module: green/red/IR LEDs, photodiode and analog front end in one 2.9 × 4.3 mm package. Designed for wrist and in-ear. Choosing this over discrete parts removes the hardest part of the optical design — LED/photodiode geometry — from your plate. | £11 |
| 3 | **Analog Devices AD5941** | Skin impedance *and* electrochemical AFE. Drives EDA today, cortisol strips later. The single most important part in this list. | £9 |
| 4 | **TI TMP117** | ±0.1 °C digital temperature. Medical-grade accuracy; the cheap sensors drift more than the signal you are chasing. | £5 |
| 5 | **ST LSM6DSV16X** | 6-axis IMU with on-chip sensor fusion and a low-power mode that runs all night without waking the MCU. | £4 |
| 6 | **Nordic nPM1300** | Power management: LiPo charger, regulators, fuel gauge, load switches. Replaces about five discrete parts and gives you an accurate battery percentage. | £3 |
| 7 | **Winbond W25Q128JV** 16 MB flash | Records when the phone is out of range. Roughly a week of raw data. | £2 |
| 8 | **Maxim MAX30003** *(optional)* | Single-lead ECG. Touch the far electrode with a finger for beat timing an optical sensor cannot match. Worth it if HRV is your main interest. | £7 |

### Electrodes and mechanics

| # | Part | Notes | ~Unit |
|---|---|---|---|
| 9 | **Ag/AgCl dry electrodes ×2** | For EDA, on the underside of the band, 20–30 mm apart, both touching skin. Stainless steel works and is cheaper; Ag/AgCl drifts less. | £6 pair |
| 10 | **LiPo 302030, ~180 mAh** | 3–4 days with duty-cycled sampling. Buy one with a protection circuit. | £5 |
| 11 | **Qi receiver coil** *(optional)* | Wireless charging means no port to waterproof. USB-C is easier but a sealing problem. | £4 |
| 12 | **Sapphire or acrylic window** | Over the optical module. Must sit flush against skin — an air gap ruins the signal. | £3 |
| 13 | **TPU strap + resin-printed shell** | Print it yourself. Expect five or six iterations; this is where the real work is. | £15 |

**Board total: roughly £60–90 in parts**, plus £30–60 for a small PCB run
(JLCPCB or PCBWay, 4-layer, ~£40 for five boards).

### Tools you will need

| Item | ~Cost | Why |
|---|---|---|
| **nRF5340 DK** | £45 | Develop firmware before your board exists. Also your programmer. |
| Hot air rework station | £60 | The MAXM86161 and AD5941 are not hand-solderable with an iron. |
| Reflow: hotplate or toaster oven | £40 | Or pay JLCPCB for assembly — for a first board, do that. |
| Digital microscope | £40 | You will not see these pitches otherwise. |

### The cortisol kit — buy this, it works today

| Item | ~Cost | Notes |
|---|---|---|
| **Salivary cortisol kit, 4-sample diurnal panel** | £50–90 per panel | ZRT, Everlywell, Medichecks, Thriva and equivalents. Four swabs: on waking, +30 min, mid-afternoon, bedtime. Posted to a lab. |

Four samples is the standard protocol and is exactly what
`packages/core/src/cortisol.ts` expects. One panel a month, on a day you also
wore the band, gives you real hormone data to calibrate the continuous stress
score against. That is a genuinely complete cortisol story — periodic ground
truth plus a continuous proxy — and it is the best that is currently buyable by
anyone, at any budget.

---

## If you would rather buy than build

Nothing on sale has all four channels. The closest options, honestly ranked:

| Device | HRV | EDA | Temp | Cortisol | Verdict |
|---|---|---|---|---|---|
| **Polar H10** chest strap | Excellent | No | No | No | Best HRV per pound. No stress channel. |
| **Fitbit Sense 2** | Fair | Yes (cEDA) | Yes | No | The only mainstream consumer band with continuous EDA, but validation studies rate its EDA and HRV well below research hardware. |
| **Empatica EmbracePlus** | Good | Yes | Yes | No | Genuinely research-grade and CE-marked, and the sensor suite this build targets. Sold to clinical partners, not consumers; the older E4 is retired. |
| **Moodmetric ring** | No | Yes | No | No | EDA only, consumer-buyable. |

If you want the full suite on your wrist and you want it to be yours, building
it is not the stubborn option — it is the only option.

---

## Assembly order

1. **Get firmware working on the nRF5340 DK first.** Advertise the standard
   Heart Rate Service (`0x180D`) with a fake heart rate. The app in this repo
   will connect to it immediately — that proves your whole chain end to end
   before you have soldered anything.
2. **Breadboard each sensor separately** on the DK: MAXM86161 over I²C, then
   AD5941 over SPI, then the IMU and TMP117. One at a time, each with a scope
   or a serial plot, so a failure has one possible cause.
3. **Design the PCB.** Four layers. Keep the optical module's analog ground
   away from the switching regulator, and route the EDA electrode traces short
   and guarded — skin impedance is megohms and picks up everything.
4. **Order assembled.** For a first board, pay for assembly. Hand-placing a
   MAXM86161 is a skill, not a step.
5. **Print the case badly, then better.** Sensor-to-skin pressure dominates
   signal quality. Iterate on this more than on the electronics.
6. **Validate against the H10.** Wear both for a night. If your band's RMSSD
   tracks the strap's within ~10%, your optical chain works. If it does not, the
   problem is mechanical before it is ever algorithmic.

---

## Firmware

Zephyr RTOS on the nRF5340 (Nordic's SDK is Zephyr-based). The bracelet must
advertise:

| Service | UUID | Why |
|---|---|---|
| Heart Rate | `0x180D` | Standard. Already decoded by `packages/core/src/ble.ts`, including RR intervals. Get this working first and the app just connects. |
| Battery | `0x180F` | Standard. The app reads it already. |
| Health Thermometer | `0x1809` | Standard, for skin temperature. |
| Zoned custom | your own 128-bit UUID | EDA and raw accelerometer. No SIG service exists for skin conductance. |

Sample rates: optical 25–100 Hz (bursts, not continuous — this is what buys you
multi-day battery life), EDA 4 Hz, temperature 1 per minute, accelerometer 25 Hz
awake and 12.5 Hz asleep.

Do the beat detection on the device and send RR intervals, not raw waveform.
Streaming raw PPG over BLE will flatten the battery in an afternoon.

---

## Calibrating the motion scale

`analyzeSleep` converts raw accelerometer magnitude into the activity counts the
Cole-Kripke algorithm expects, via `countScale`. That constant is specific to
your accelerometer and its mounting. Record a night, then adjust `countScale`
until detected wake matches when you remember being awake. The default of 100 is
a starting point, not a measurement.

---

## What is still not possible

- **Blood pressure** from a wrist optical sensor. Not reliable, whatever is
  claimed.
- **Continuous cortisol.** Covered above. Saliva kits until strips ship.
- **True sleep staging.** Needs EEG. Wake-versus-sleep from motion is well
  validated; light/deep/REM from heart rate is an estimate.
- **Medical claims.** This is not a medical device and nothing here diagnoses
  anything. Patterns are for your curiosity and your training, and for taking to
  a doctor — not for drawing conclusions from alone.

---

## Sources

- [Adaptyx continuous cortisol monitor](https://www.mddionline.com/diabetes/adaptyx-unveils-first-continuous-cortisol-monitor-here-s-what-you-need-to-know)
- [UC Irvine bioelectronic stress wristband](https://medicalxpress.com/news/2026-01-bioelectronic-wristband-real-stress.html)
- [21-day multi-biomarker sweat sensor](https://medicalxpress.com/news/2026-05-wearable-sensor-multiple-biomarkers-days.html)
- [AD5940/AD5941 datasheet](https://www.analog.com/media/en/technical-documentation/data-sheets/ad5940-5941.pdf)
- [Empatica EmbracePlus](https://www.empatica.com/en-us/blog/the-embraceplus-wearable-wins-european-ce-mark/)
- [Fitbit Sense vs Empatica E4 vs Shimmer GSR3+ validation study](https://www.mdpi.com/1424-8220/23/13/5847)
