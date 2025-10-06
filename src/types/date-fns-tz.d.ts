// src/types/date-fns-tz.d.ts
declare module 'date-fns-tz' {
    import type { Locale } from 'date-fns';
  
    export function toZonedTime(
      date: Date | number | string,
      timeZone: string
    ): Date;
  
    export function formatInTimeZone(
      date: Date | number,
      timeZone: string,
      formatStr: string,
      options?: { locale?: Locale }
    ): string;
  
    export function utcToZonedTime(
      date: Date | number | string,
      timeZone: string
    ): Date;
  
    export function zonedTimeToUtc(
      date: Date | string,
      timeZone: string
    ): Date;
  }
  