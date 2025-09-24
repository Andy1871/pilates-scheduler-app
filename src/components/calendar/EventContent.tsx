// components/calendar/EventContent.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  timeLabel?: string;
  status: "paid" | "unpaid" | "blocked" | "hold";
  view?: "month" | "week" | "day";
  className?: string;
};

/** Build the human-readable label used across Chip/Block/aria */
export function buildEventLabel(opts: {
  title: string;
  timeLabel?: string;
  view?: "month" | "week" | "day";
}) {
  const { title, timeLabel, view } = opts;
  return view === "month" || !timeLabel ? title : `${timeLabel} — ${title}`;
}

export default function EventContent({
  title,
  timeLabel,
  status,
  view = "month",
  className,
}: Props) {
  const label = buildEventLabel({ title, timeLabel, view });
  // Include status in SR text so screen readers get extra context
  const srText = `${label}${status ? ` (${status})` : ""}`;

  return (
    <span className={cn("block truncate", className)} aria-label={srText}>
      {label}
    </span>
  );
}
