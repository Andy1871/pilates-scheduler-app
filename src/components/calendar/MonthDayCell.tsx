"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import EventChip from "./EventChip";
import type { CalendarEvent } from "../../types/event";
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
}: Props) {
  const dayNum = React.useMemo(
    () => parseInt(dateISO.slice(8, 10), 10),
    [dateISO]
  );
  const visible = events.slice(0, maxVisible); // we basically count the first 4 events. anything after is the overflow. we use this to map our events into our cell.
  const overflow = events.length - visible.length;

  return (
    <div
      className={cn(
        // classnames given if the div has select conditions.
        "relative h-full min-h-24 border p-1.5 flex flex-col",
        !isCurrentMonth && "bg-muted/20 text-muted-foreground",
        isToday && "outline outline-sky-300 -outline-offset-1 bg-sky-50/40",
        selected && "outline outline-primary/40",
        className
      )}
      data-date={dateISO}
      role="gridcell"
      aria-selected={selected || false}
      onClick={() => onSelectDay?.(dateISO)}
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
          // derive display fields for month view
          const presented = presentEventForChip(ev);
          return (
            <EventChip
              key={ev.id}
              status={presented.status}
              view="month"
              title={presented.title}
              classType={presented.classType}
              onClick={() => onOpenEvent?.(ev.id)}
              
            />
          );
        })}
        {overflow > 0 && ( // only shows if there is an overflow of events.
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

const MonthDayCell = React.memo(MonthDayCellBase);
export default MonthDayCell;
