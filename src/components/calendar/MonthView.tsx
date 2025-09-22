// components/calendar/MonthView.tsx
import MonthGrid, { type DayModel } from "./MonthGrid";
import CalendarHeader from "./CalendarHeader";
import { events } from "@/data/events";
import type { CalendarEvent } from "@/types/event";

import {
  startOfMonth,
  startOfWeek,
  addDays,
  eachDayOfInterval,
  isSameMonth,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const TZ = "Europe/London";

// Static month
const VIEW_DATE = new Date(2025, 7, 1);

function buildMonthMatrix(viewDate: Date): DayModel[] {
  const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }); // Starts on Monday
  const end = addDays(start, 41); // 6 rows × 7 cols = 42 days

  const todayISO = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");

  return eachDayOfInterval({ start, end }).map((d) => {
    // this is building the array of 42 dates. eachDayOfInterval = date-fns func
    const iso = formatInTimeZone(d, TZ, "yyyy-MM-dd");
    return {
      dateISO: iso,
      isCurrentMonth: isSameMonth(d, viewDate), // mutes leading/trailing days
      isToday: iso === todayISO, // highlights today
    };
  });
}

function groupEventsByDate( // builds a map, with the key = start time. each cell looks up its own events, rather than filtering array 42 times.
  list: CalendarEvent[]
): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  for (const ev of list) {
    const key = formatInTimeZone(new Date(ev.start), TZ, "yyyy-MM-dd");
    (map[key] ??= []).push(ev);
  }
  return map;
}

export default function MonthView() {
  const days = buildMonthMatrix(VIEW_DATE);
  const eventsByDate = groupEventsByDate(events);

  return (
    <>
      <CalendarHeader />
      <MonthGrid days={days} eventsByDate={eventsByDate} className="mt-5" />
    </>
  );
}
