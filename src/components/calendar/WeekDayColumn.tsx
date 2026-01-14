"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import EventChip from "./EventChip";
import { presentEventForChip } from "@/lib/eventPresenter";
import type { CalendarEvent, BookingEvent, BlockEvent } from "@/types/event";

type Props = {
  dateISO: string;
  isToday?: boolean;
  bookings: BookingEvent[];
  blocks: BlockEvent[];
  startHour: number;
  endHour: number;
  slotMinutes: number;

  onOpenEvent?: (id: string) => void;
  onCreateBooking?: (startISO: string) => void; // ✅ NEW
};

const HOUR_PX = 64; // each hour == 64px (because 30-min slot is h-8 = 32px)
const PX_PER_MIN = HOUR_PX / 60;
const MIN_HEIGHT_PX = 18;

function minutesFromStart(date: Date, startHour: number) {
  return (date.getHours() - startHour) * 60 + date.getMinutes();
}

function getEventBounds(ev: CalendarEvent, startHour: number, endHour: number) {
  const s = new Date(ev.start);
  const e = new Date(ev.end);

  const startMin = minutesFromStart(s, startHour);
  const endMin = minutesFromStart(e, startHour);
  const totalMinutes = (endHour - startHour) * 60;

  const topMin = Math.max(0, startMin);
  const bottomMin = Math.min(totalMinutes, Math.max(startMin, endMin));
  const durMin = Math.max(1, bottomMin - topMin);

  return {
    top: topMin * PX_PER_MIN,
    height: Math.max(MIN_HEIGHT_PX, durMin * PX_PER_MIN),
  };
}

/**
 * Builds an ISO datetime for this column date at a given minute offset from startHour.
 * Uses local time (consistent with Date + getHours() logic you're already using).
 */
function buildSlotStartISO(dateISO: string, startHour: number, minutesFromStart: number) {
  const d = new Date(dateISO); // should be midnight for that day in your current setup
  d.setHours(startHour, 0, 0, 0);
  d.setMinutes(d.getMinutes() + minutesFromStart);
  return d.toISOString();
}

export default function WeekDayColumn({
  dateISO,
  isToday,
  bookings,
  blocks,
  startHour,
  endHour,
  slotMinutes,
  onOpenEvent,
  onCreateBooking,
}: Props) {
  const slotsPerHour = 60 / slotMinutes;
  const totalHours = endHour - startHour;
  const totalSlots = totalHours * slotsPerHour;
  const totalMinutes = totalHours * 60;

  // merge for rendering; keep order by start time
  const events: CalendarEvent[] = React.useMemo(() => {
    const all = [...bookings, ...blocks];
    return all.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [bookings, blocks]);

  const handleCreateAtPointer = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onCreateBooking) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // convert y px -> minutes from startHour, then snap to nearest slotMinutes
      const rawMinutes = y / PX_PER_MIN;
      const clamped = Math.max(0, Math.min(totalMinutes - 1, rawMinutes));
      const snapped = Math.round(clamped / slotMinutes) * slotMinutes;

      const startISO = buildSlotStartISO(dateISO, startHour, snapped);
      onCreateBooking(startISO);
    },
    [onCreateBooking, dateISO, startHour, slotMinutes, totalMinutes]
  );

  return (
    <div
      className={cn(
        "relative border-l border-b-2",
        isToday && "z-10 outline outline-sky-300 -outline-offset-1 bg-sky-50/40"
      )}
      role="gridcell"
      data-date={dateISO}
      aria-selected={isToday || false}
    >
      {/* Background time grid (visual only) */}
      <div className="pointer-events-none">
        {Array.from({ length: totalSlots }, (_, i) => (
          <div
            key={i}
            className={cn("h-8 border-t", i % slotsPerHour === 0 && "border-t-2")}
          />
        ))}
      </div>

      {/* ✅ Clickable hit-layer for empty time slots */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleCreateAtPointer}
        // optional polish
        onMouseMove={(e) => {
          // you could add hover effects later if you want
        }}
        aria-label={`Create booking on ${dateISO}`}
      />

      {/* Events overlay (must stay on top) */}
      <div className="absolute inset-0 p-1 pointer-events-none">
        {events.map((ev) => {
          const { top, height } = getEventBounds(ev, startHour, endHour);
          const { timeLabel, title, classType, status } = presentEventForChip(ev);

          return (
            <div
              key={ev.id}
              className="absolute left-1 right-1 cursor-pointer select-none pointer-events-auto"
              style={{ top, height }}
              title={title}
              aria-label={`${title} ${timeLabel}`}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation(); // ✅ prevent slot create
                onOpenEvent?.(ev.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenEvent?.(ev.id);
                }
              }}
            >
              <EventChip
                title={title}
                timeLabel={timeLabel}
                classType={classType}
                status={status as any}
                view="week"
                className="w-full h-full text-[11px] leading-tight flex flex-col"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
