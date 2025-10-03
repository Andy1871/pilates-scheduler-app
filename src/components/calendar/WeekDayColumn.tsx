"use client";

import * as React from "react";
import type { CalendarEvent } from "@/types/event";
import { cn } from "@/lib/utils";
import EventChip from "./EventChip";
import { format } from "date-fns";
import { presentEventForChip } from "@/lib/eventPresenter";


type Props = {
  dateISO: string;
  isToday?: boolean;
  events: CalendarEvent[];
  startHour: number;
  endHour: number;
  slotMinutes: number; // 30
};

const HOUR_PX = 64 // because each 30-min slot is h-8 (32px) → 2 * 32 = 64
const PX_PER_MIN = HOUR_PX / 60; 

function minutesFromStart(date: Date, startHour: number) {
  return (date.getHours() - startHour) * 60 + date.getMinutes();
}

function getEventBounds(ev: CalendarEvent, startHour: number, endHour: number) {
  const s = new Date(ev.start);
  const e = new Date(ev.end);

  const startMin = minutesFromStart(s, startHour);
  const endMin   = minutesFromStart(e, startHour);

  const totalMinutes = (endHour - startHour) * 60;

  // clamp within column bounds
  const topMin = Math.max(0, startMin);
  const bottomMin = Math.min(totalMinutes, Math.max(startMin, endMin));
  const durMin = Math.max(1, bottomMin - topMin);

  return {
    top: topMin * PX_PER_MIN,
    height: durMin * PX_PER_MIN,
  };
}

export default function WeekDayColumn({
  dateISO,
  isToday,
  events,
  startHour,
  endHour,
  slotMinutes,
}: Props) {
  const slotsPerHour = 60 / slotMinutes;
  const totalHours = endHour - startHour;
  const totalSlots = totalHours * slotsPerHour;

  return (
    <div className={cn("relative border-l border-b-2", isToday && "z-10 outline outline-sky-300 -outline-offset-1 bg-sky-50/40")} role="gridcell" data-date={dateISO} aria-selected={isToday || false}>
      {/* Background slots */}
      <div className="pointer-events-none">
        {Array.from({ length: totalSlots }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-8 border-t",                
              i % slotsPerHour === 0 && "border-t-2" // thicker line at each hour
            )}
          />
        ))}
      </div>

     {/* Events overlay */}
     <div className="absolute inset-0 p-1">
        {events.map((ev) => {
          const { top, height } = getEventBounds(ev, startHour, endHour);
          const { timeLabel, title, classType, status } = presentEventForChip(ev);

          

          return (
            <div
              key={ev.id}
              className="absolute left-1 right-1"
              style={{ top, height }}
              title={title}
              aria-label={`${title} ${timeLabel}`}
            >
              {/* Use your status-aware chip so it’s not grey */}
              <EventChip
                title={title}
                timeLabel={timeLabel}
                classType={classType}
                status={status} 
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
