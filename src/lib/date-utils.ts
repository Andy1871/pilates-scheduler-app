// src/lib/date-utils.ts
import { startOfMonth, startOfWeek as dfStartOfWeek, addDays } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from "date-fns-tz";

export const TZ = "Europe/London";

// normalize inputs so date-fns(-tz) is happy
function asDate(input: Date | string | number): Date {
  return input instanceof Date ? input : new Date(input);
}

/** Form input ("YYYY-MM-DDTHH:mm" in London) -> UTC Date to store in DB */
export function localInputToUTC(naive: string): Date {
  return zonedTimeToUtc(naive, TZ);
}

/** UTC Date from DB -> London wall-clock Date for UI math/positioning */
export function utcToLondon(d: Date | string | number): Date {
  return utcToZonedTime(asDate(d), TZ);
}

/** Format any UTC Date in London time */
export function formatInTZ(d: Date | string | number, fmt: string) {
  return formatInTimeZone(asDate(d), TZ, fmt);
}

/** Week/month helpers that respect London boundaries */
export function startOfWeekInTZ(d: Date | string | number, weekStartsOn: 0 | 1 = 1) {
  return dfStartOfWeek(utcToLondon(d), { weekStartsOn });
}
export function startOfMonthInTZ(d: Date | string | number) {
  return startOfMonth(utcToLondon(d));
}
export function addDaysInTZ(d: Date | string | number, days: number) {
  return addDays(utcToLondon(d), days);
}

/** Add days to a YYYY-MM-DD date string, return YYYY-MM-DD */
export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
