import { format } from "date-fns";
import type { CalendarEvent, BookingEvent, BlockEvent } from "@/types/event";
import { CLASS_LABEL } from "@/lib/display";

type ChipData = {
  timeLabel: string;
  title: string;
  classType?: string;
  // Allow both booking statuses and the block status
  status: CalendarEvent["status"] | "blocked";
};

export function presentEventForChip(ev: CalendarEvent): ChipData {
  const s = new Date(ev.start);
  const e = new Date(ev.end);
  const timeLabel = `${format(s, "HH:mm")}–${format(e, "HH:mm")}`;

  if (ev.kind === "booking") {
    const b = ev as BookingEvent;
    // CLASS_LABEL lookup can be undefined if key is missing; guard it
    const classPretty = b.classType ? CLASS_LABEL[b.classType] : undefined;
    return {
      timeLabel,
      title: b.person || "Booking",
      classType: classPretty,
      status: b.status, // "paid" | "unpaid" | "hold"
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
