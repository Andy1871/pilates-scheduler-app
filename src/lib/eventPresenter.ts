// File helps take CalendarEvent and turn it into an event 'chip' in the UI.

import { format } from "date-fns";
import type { CalendarEvent, BookingEvent, BlockEvent } from "@/types/event";
import { CLASS_LABEL } from "@/lib/display";

type ChipData = {
  timeLabel: string;
  title: string;
  classType?: string;
  // CalendarEvent that was created in types folder - helps us created our displays below.
  status: CalendarEvent["status"] | "blocked";
};

export function presentEventForChip(ev: CalendarEvent): ChipData {
  const s = new Date(ev.start);
  const e = new Date(ev.end);
  const timeLabel = `${format(s, "HH:mm")}–${format(e, "HH:mm")}`;

  // Book
  if (ev.kind === "booking") {
    const b = ev as BookingEvent;
    const classPretty = b.classType ? CLASS_LABEL[b.classType] : undefined; // selects correct label based on value of b.classType
    return {
      timeLabel,
      title: b.person || "Booking",
      classType: classPretty,
      status: b.status, // paid/unpaid/hold
    };
  }

  // Block
  const blk = ev as BlockEvent;
  return {
    timeLabel,
    title: (blk.reason || "Blocked").trim(),
    classType: undefined,
    status: "blocked",
  };
}
