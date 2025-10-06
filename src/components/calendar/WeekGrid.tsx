"use client";

import { cn } from "@/lib/utils";
import type { WeekDayModel } from "./WeekView";
import WeekDayColumn from "./WeekDayColumn";
import { format } from "date-fns";
import type { BookingEvent, BlockEvent } from "@/types/event";

type Props = {
  days: WeekDayModel[];
  className?: string;
  startHour?: number; // default 6
  endHour?: number;   // default 22
  slotMinutes?: number; // default 30
  bookingByWeekDay?: Record<string, BookingEvent[]>;
  blockByWeekDay?: Record<string, BlockEvent[]>;
  onOpenEvent?: (id: string) => void;
};

const TIME_LABELS = (startHour: number, endHour: number) =>
  Array.from(
    { length: endHour - startHour },
    (_, i) => `${String(startHour + i).padStart(2, "0")}:00`
  );

const WEEKDAY_LONGISH = ["Mon", "Tues", "Weds", "Thurs", "Fri", "Sat", "Sun"];

function headerLabel(dateISO: string) {
  const d = new Date(dateISO);
  const dd = format(d, "dd");
  const weekday = WEEKDAY_LONGISH[Number(format(d, "i")) - 1];
  return `${dd} ${weekday}`;
}

export default function WeekGrid({
  days,
  bookingByWeekDay,
  blockByWeekDay,
  onOpenEvent,
  className,
  startHour = 6,
  endHour = 22,
  slotMinutes = 30,
}: Props) {
  const bookingByDay = bookingByWeekDay ?? {};
  const blockByDay = blockByWeekDay ?? {};

  return (
    <section
      className={cn("w-full h-[75vh] border rounded-md overflow-auto", className)}
      aria-label="Week grid"
      role="grid"
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
            role="columnheader"
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
        {days.map((d) => {
          const key = d.dateISO;
          const bookings = bookingByDay[key] ?? [];
          const blocks = blockByDay[key] ?? [];

          return (
            <WeekDayColumn
              key={key}
              dateISO={key}
              isToday={d.isToday}
              bookings={bookings}
              blocks={blocks}
              startHour={startHour}
              endHour={endHour}
              slotMinutes={slotMinutes}
              onOpenEvent={onOpenEvent}
            />
          );
        })}
      </div>
    </section>
  );
}
