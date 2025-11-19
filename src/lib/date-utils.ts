import { startOfMonth, startOfWeek as dfStartOfWeek, addDays } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } from "date-fns-tz";

// The below helpers help convert between UTC in the DB to London timezone in the UI.

export const TZ = "Europe/London";

// helps other functions accept multiple types but always convert to Date 
function asDate(input: Date | string | number): Date {
  return input instanceof Date ? input : new Date(input);
}

/* Fixes winter/summer bugs */
export function localInputToUTC(naive: string): Date {
  return zonedTimeToUtc(naive, TZ);
}

/** Takes UTC date from DB - convert to London local Date - calendar position helper */
export function utcToLondon(d: Date | string | number): Date {
  return utcToZonedTime(asDate(d), TZ);
}

/** Format any UTC Date in London time */
export function formatInTZ(d: Date | string | number, fmt: string) {
  return formatInTimeZone(asDate(d), TZ, fmt);
}

/** Week/month helpers - all use utcToLondon from above. Ensures calendar uses London time/boundaries */
export function startOfWeekInTZ(d: Date | string | number, weekStartsOn: 0 | 1 = 1) {
  return dfStartOfWeek(utcToLondon(d), { weekStartsOn });
}
export function startOfMonthInTZ(d: Date | string | number) {
  return startOfMonth(utcToLondon(d));
}
export function addDaysInTZ(d: Date | string | number, days: number) {
  return addDays(utcToLondon(d), days);
}

/** Helps move forward/backward in date picker */
export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
