// Time-zone helpers built on Intl only (no external date library).

/** Request-time clock for server components (rendered once per request). */
export const nowMs = () => Date.now();

function tzOffsetMs(tz: string, at: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(dtf.formatToParts(new Date(at)).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(at / 1000) * 1000;
}

/** Converts a wall-clock date + time in `tz` to a UTC timestamp (ms). */
export function zonedToUtc(date: string, time: string, tz: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let ts = guess - tzOffsetMs(tz, guess);
  // Second pass handles DST boundaries.
  ts = guess - tzOffsetMs(tz, ts);
  return ts;
}

/** Wall-clock parts of a timestamp in `tz`: { date: 'YYYY-MM-DD', time: 'HH:MM', weekday: 0-6 } */
export function utcToZonedParts(ts: number, tz: string) {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
  const p = Object.fromEntries(dtf.formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, weekday };
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

const intlLocale = { fr: "fr-FR", en: "en-GB", ar: "ar" } as const;

export function formatDateTime(ts: number, locale: "fr" | "en" | "ar", tz: string): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    numberingSystem: "latn",
  }).format(new Date(ts));
}

export function formatDate(ts: number, locale: "fr" | "en" | "ar", tz = "UTC"): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: tz,
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
  }).format(new Date(ts));
}

export function formatPrice(cents: number, currency: string, locale: "fr" | "en" | "ar"): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    numberingSystem: "latn",
  }).format(cents / 100);
}
