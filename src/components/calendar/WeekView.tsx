"use client";

import { useState } from "react";
import CalendarHeader from "./CalendarHeader";
import WeekGrid from "./WeekGrid";
import type { CalendarEvent } from "@/types/event";
import { events } from "@/data/events";
import { getStartOfThisWeek } from "@/lib/date-utils";
import { getWeekRangeLabel } from "@/lib/week-label";
import AddForm from "../AddForm";
import BlockTimeForm from "../BlockTimeForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { addWeeks, startOfWeek, addDays, format } from "date-fns";

import { formatInTZ } from "@/lib/date-utils";

export type WeekDayModel = {
  dateISO: string;
  isToday: boolean;
};

export function buildWeekMatrix(viewDate: Date): WeekDayModel[] {
  const startMon = startOfWeek(viewDate, { weekStartsOn: 1 });
  const todayISO = format(new Date(), "yyyy-MM-dd");

  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startMon, i);
    const iso = format(d, "yyyy-MM-dd");
    return {
      dateISO: iso,
      isToday: iso === todayISO,
    };
  });
}

function groupEventsByWeekDay( // builds a map, with the key = start time. each cell looks up its own events, rather than filtering array 42 times.
  list: CalendarEvent[]
): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  for (const ev of list) {
    const key = formatInTZ(new Date(ev.start), "yyyy-MM-dd");
    (map[key] ??= []).push(ev);
  }
  return map;
}

export default function WeekView() {
  const [viewDate, setViewDate] = useState(getStartOfThisWeek());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBlockOpen, setisBlockOpen] = useState(false);

  const days = buildWeekMatrix(viewDate);
  const eventsByWeekDay = groupEventsByWeekDay(events);
  const headerTitle = getWeekRangeLabel(viewDate);
  const weekKey = format(
    startOfWeek(viewDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );

  console.log("TodayISO", format(new Date(), "yyyy-MM-dd"));
console.log("Week days", days.map(d => `${d.dateISO}:${d.isToday}`));

  return (
    <>
      <CalendarHeader
        title={headerTitle}
        viewDate={viewDate}
        onPrev={() => setViewDate((d) => addWeeks(d, -1))}
        onNext={() => setViewDate((d) => addWeeks(d, 1))}
        onToday={() => setViewDate(getStartOfThisWeek())}
        onAdd={() => setIsAddOpen(true)}
        onBlock={() => setisBlockOpen(true)}
      />

      <WeekGrid
        key={weekKey}
        days={days}
        eventsByDate={eventsByWeekDay}
        className="mt-5"
        startHour={7}
        endHour={21}
        slotMinutes={30}
      />

      {isAddOpen && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">
                Add Booking
              </DialogTitle>
            </DialogHeader>
            <AddForm />
          </DialogContent>
        </Dialog>
      )}

      {isBlockOpen && (
        <Dialog open={isBlockOpen} onOpenChange={setisBlockOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">
                Block Time Out
              </DialogTitle>
            </DialogHeader>
            <BlockTimeForm />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
