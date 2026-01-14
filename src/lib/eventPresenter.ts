import { format } from "date-fns";
import type { CalendarEvent, BookingEvent, BlockEvent } from "@/types/event";
import { CLASS_LABEL } from "@/lib/display";

type ChipData = {
  timeLabel: string;      // week/day: "09:00–10:00"
  timeStart: string;      // month:   "09:00"
  title: string;
  classType?: string;
  status: CalendarEvent["status"] | "blocked";
};

export function presentEventForChip(ev: CalendarEvent): ChipData {
  const s = new Date(ev.start);
  const e = new Date(ev.end);

  const timeStart = format(s, "HH:mm");
  const timeLabel = `${timeStart}–${format(e, "HH:mm")}`;

  if (ev.kind === "booking") {
    const b = ev as BookingEvent;
    const classPretty = b.classType ? CLASS_LABEL[b.classType] : undefined;

    return {
      timeLabel,
      timeStart,
      title: b.person || "Booking",
      classType: classPretty,
      status: b.status,
    };
  }

  const blk = ev as BlockEvent;
  return {
    timeLabel,
    timeStart,
    title: (blk.reason || "Blocked").trim(),
    classType: undefined,
    status: "blocked",
  };
}
