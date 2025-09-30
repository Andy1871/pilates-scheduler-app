// lib/date-utils.ts
import { startOfMonth, startOfWeek, addDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

export const TZ = "Europe/London";

// Convert any Date to the target zone (for doing month/week math consistently)
export const zoned = (date: Date) => toZonedTime(date, TZ);

// Format in TZ
export const formatInTZ = (date: Date, fmt: string) =>
  formatInTimeZone(date, TZ, fmt);

// Start-of-week in TZ (Monday=1)
export const startOfWeekInTZ = (date: Date, weekStartsOn: 0 | 1 = 1) =>
  startOfWeek(date, { weekStartsOn });

// Add N days (on a zoned date)
export const addDaysInTZ = (date: Date, days: number) => addDays(date, days);

// Today in local TZ (no toZonedTime)
export const getToday = () => new Date();

// First day of this month in local TZ
export const getStartOfThisMonth = () => startOfMonth(new Date());

export const getStartOfThisWeek = () => startOfWeek(new Date())
