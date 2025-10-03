import { format } from "date-fns";
import type { CalendarEvent } from "@/types/event"; 
import { CLASS_LABEL } from "@/lib/display";

export function presentEventForChip(ev: CalendarEvent) {
  const startLabel = format(new Date(ev.start), "HH:mm");
  const endLabel = format(new Date(ev.end), "HH:mm");
  const timeLabel = `${startLabel}–${endLabel}`;

  if (ev.kind === "booking") {
    const classPretty = CLASS_LABEL[ev.classType]; // safe: ev.classType exists only on bookings
    return {
      timeLabel,
      title: ev.person,          // name goes in title
      classType: classPretty,    // pretty string for UI
      status: ev.status,
    };
  }

  return {
    timeLabel,
    title: ev.reason,             // block reason
    classType: undefined,
    status: "blocked" as const,
  };
}