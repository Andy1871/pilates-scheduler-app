"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import EventChip from "./EventChip";
import type { CalendarEvent } from "@/types/event";
import { presentEventForChip } from "@/lib/eventPresenter";

type Props = {
  dateISO: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  maxVisible?: number; // how many chips to show before "+N more"
  selected?: boolean;
  onOpenEvent?: (id: string) => void;
  onOpenMore?: (dateISO: string) => void;
  onSelectDay?: (dateISO: string) => void;
  className?: string;
  onCreateBooking?: (dateISO: string) => void;
};

function MonthDayCellBase({
  dateISO,
  isCurrentMonth,
  isToday,
  events,
  maxVisible = 4,
  selected,
  onOpenEvent,
  onOpenMore,
  onSelectDay,
  className,
  onCreateBooking,
}: Props) {
  const dayNum = React.useMemo(
    () => parseInt(dateISO.slice(8, 10), 10),
    [dateISO]
  );
  // show first N events; rest collapse into "+N more"
  const visible = events.slice(0, maxVisible);
  const overflow = events.length - visible.length;

  return (
    <div
      className={cn(
        "relative h-full min-h-24 border p-0.5 xs:p-1 sm:p-1.5 flex flex-col",
        !isCurrentMonth && "bg-muted/20 text-muted-foreground",
        isToday && "outline outline-sky-300 -outline-offset-1 bg-sky-50/40",
        selected && "outline outline-primary/40",
        className
      )}
      data-date={dateISO}
      role="gridcell"
      aria-selected={selected || false}
      onClick={() => {onSelectDay?.(dateISO); onCreateBooking?.(dateISO);}}
    >
      <div className="flex items-center justify-between">
        <span className="sr-only">{dateISO}</span>
        <span
          className={cn(
            "ml-auto text-[10px] leading-none",
            isToday && "text-primary"
          )}
        >
          {dayNum}
        </span>
      </div>

      <div className="overflow-hidden">
        {visible.map((ev) => {
          const presented = presentEventForChip(ev);
          return (
            <EventChip
              key={ev.id}
              status={presented.status}
              view="month"
              title={presented.title}
              timeLabel={presented.timeLabel}
              classType={presented.classType}
              onClick={(e) => {e.stopPropagation(); onOpenEvent?.(ev.id);}}
            />
          );
        })}
        {overflow > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMore?.(dateISO);
            }}
            className="w-full truncate text-[10px] leading-4 text-muted-foreground hover:underline"
            aria-label={`Show ${overflow} more events on ${dateISO}`}
          >
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
}

const MonthDayCell = React.memo(MonthDayCellBase); // avoid re-rendering when props don't change. Important for calendar grids
export default MonthDayCell;
