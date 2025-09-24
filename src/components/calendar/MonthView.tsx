"use client";
import MonthGrid, { type DayModel } from "./MonthGrid";
import CalendarHeader from "./CalendarHeader";
import { events } from "@/data/events";
import type { CalendarEvent } from "@/types/event";
import { useState } from "react";
import { getStartOfThisMonth } from "@/lib/date-utils";

import {
  startOfMonth,
  addMonths,
  startOfWeek,
  addDays,
  format,
} from "date-fns";

import { formatInTZ } from "@/lib/date-utils";

export function buildMonthMatrix(viewDate: Date): DayModel[] {
  const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }); // local TZ
  const todayISO = format(new Date(), "yyyy-MM-dd");
  const viewMonthKey = format(viewDate, "yyyy-MM");

  const days: DayModel[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const iso = format(d, "yyyy-MM-dd");
    const monthKey = iso.slice(0, 7);
    days.push({
      dateISO: iso,
      isCurrentMonth: monthKey === viewMonthKey,
      isToday: iso === todayISO,
    });
  }
  return days;
}
function groupEventsByDate( // builds a map, with the key = start time. each cell looks up its own events, rather than filtering array 42 times.
  list: CalendarEvent[]
): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  for (const ev of list) {
    const key = formatInTZ(new Date(ev.start), "yyyy-MM-dd");
    (map[key] ??= []).push(ev);
  }
  return map;
}

export default function MonthView() {
  const [viewDate, setViewDate] = useState(getStartOfThisMonth());
  const days = buildMonthMatrix(viewDate);
  const eventsByDate = groupEventsByDate(events);

  return (
    <>
      <CalendarHeader
        viewDate={viewDate}
        onPrev={() => setViewDate((d) => addMonths(d, -1))}
        onNext={() => setViewDate((d) => addMonths(d, 1))}
        onToday={() => setViewDate(getStartOfThisMonth())}
      />
      <MonthGrid days={days} eventsByDate={eventsByDate} className="mt-5" />
    </>
  );
}
