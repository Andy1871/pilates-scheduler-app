"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import MonthDayCell from "./MonthDayCell";
import type { CalendarEvent } from "@/types/event";

export type DayModel = {
  dateISO: string;        
  isCurrentMonth: boolean; 
  isToday: boolean;        
};

type Props = {
  days: DayModel[];
  eventsByDate: Record<string, CalendarEvent[]>; // lookup map
  showWeekdayHeader?: boolean;
  className?: string;

  onOpenEvent?: (id: string) => void;
  onOpenMore?: (dateISO: string) => void;
  onSelectDay?: (dateISO: string) => void;
  onCreateBooking?: (dateISO: string) => void;
};

const WEEKDAYS_MON_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MonthGrid({
  days,
  eventsByDate,
  showWeekdayHeader = true,
  className,
  onOpenEvent,
  onOpenMore,
  onSelectDay,
  onCreateBooking,
}: Props) {
  if (process.env.NODE_ENV !== "production" && days.length !== 42) {
    console.warn(`MonthGrid expected 42 days, received ${days.length}.`);
  }

  return (
    <section
      className={cn("w-full", className)}
      role="grid"
      aria-label="Month grid"
    >
      {showWeekdayHeader && (
        <div
          className="grid grid-cols-7 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          role="row"
          aria-hidden="true"
        >
          {WEEKDAYS_MON_FIRST.map((d) => (
            <div key={d} role="columnheader" className="text-right pr-1">
              {d}
            </div>
          ))}
        </div>
      )}

      <div
        className="grid grid-cols-7 grid-rows-6 gap-px rounded-md bg-border overflow-hidden h-[65vh]"
        role="rowgroup"
      >
        {days.map((day) => (
          <MonthDayCell
            key={day.dateISO}
            dateISO={day.dateISO}
            isCurrentMonth={day.isCurrentMonth}
            isToday={day.isToday}
            events={eventsByDate[day.dateISO] ?? []}
            onOpenEvent={onOpenEvent}
            onOpenMore={onOpenMore}
            onSelectDay={onSelectDay}
            onCreateBooking={onCreateBooking}
            className="bg-background"
          />
        ))}
      </div>
    </section>
  );
}
