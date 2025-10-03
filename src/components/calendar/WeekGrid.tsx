"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/event";
import type { WeekDayModel } from "./WeekView";
import WeekDayColumn from "./WeekDayColumn";
import { format } from "date-fns";

type Props = {
  days: WeekDayModel[];
  eventsByDate: Record<string, CalendarEvent[]>;
  className?: string;
  startHour?: number; // default 6
  endHour?: number; // default 22
  slotMinutes?: number; // default 30
};

const TIME_LABELS = (startHour: number, endHour: number) =>
  Array.from(
    { length: endHour - startHour },
    (_, i) => `${String(startHour + i).padStart(2, "0")}:00`
  );

  const WEEKDAY_LONGISH = ["Mon","Tues","Weds","Thurs","Fri","Sat","Sun"];

  function headerLabel(dateISO: string) {
    const d = new Date(dateISO);
    const dd = format(d, "dd");            
    const weekday = WEEKDAY_LONGISH[Number(format(d, "i")) - 1];
    return `${dd} ${weekday}`;
  }

export default function WeekGrid({
  days,
  eventsByDate,
  className,
  startHour = 6,
  endHour = 22,
  slotMinutes = 30,
}: Props) {
  return (
    <section
      className={cn(
        "w-full h-[75vh] border rounded-md overflow-auto",
        className
      )}
      aria-label="Week grid"
    >
      {/* 8 columns: 1 for time labels + 7 for days */}
      <div className="grid [grid-template-columns:56px_repeat(7,minmax(0,1fr))] min-w-[900px]">
        <div className="sticky left-0 top-0 z-20 bg-background py-2 px-2 text-sm font-semibold border-r text-center">
          Time
        </div>
        {days.map((d) => (
          <div
            key={d.dateISO}
            className={cn(
              "sticky top-0 z-10 bg-background py-2 px-2 text-sm font-semibold border-l text-center",
              d.isToday && "text-primary"
            )}
            aria-label={d.dateISO}
          >
            {headerLabel(d.dateISO)}
          </div>
        ))}

        {/* Body: left time labels */}
        <div className="border-t sticky left-0 z-10 bg-background border-r border-b-2">
          <div className="relative">
            {TIME_LABELS(startHour, endHour).map((t) => (
              <div
                key={t}
                className="h-16 px-1 text-[11px] text-muted-foreground flex items-start justify-end"
              >
                <span className="pr-1">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7 day columns */}
        {days.map((d) => (
          <WeekDayColumn
            key={d.dateISO}
            dateISO={d.dateISO}
            isToday={d.isToday}
            events={eventsByDate[d.dateISO] ?? []}
            startHour={startHour}
            endHour={endHour}
            slotMinutes={slotMinutes}
          />
        ))}
      </div>
    </section>
  );
}
