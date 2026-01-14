"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  timeLabel?: string;
  classType?: string; // reformer/mat/etc
  status: "paid" | "unpaid" | "blocked" | "hold";
  view?: "month" | "week" | "day";
  className?: string;
};

function classAbbreviation(c?: string) {
  if (!c) return null;
  const first = c.trim().toLowerCase()[0]; // gives r for reformer, m for mat, d for duo
  if (["r", "m", "d"].includes(first)) return first;
  return first;
}

// Event label
export function buildEventLabel(opts: {
  title: string;
  timeLabel?: string;
  classType?: string;
  view?: "month" | "week" | "day";
}) {
  const { title, timeLabel, classType, view } = opts;

  // Month view stays compact, week can include time and classType
  if (!timeLabel) {
    return classType ? `${title} — ${classType}` : title;
  }

  if (view === "month") {
    return classType
      ? `${timeLabel} ${title} — ${classType}`
      : `${timeLabel} ${title}`;
  }

  return classType
    ? `${timeLabel} ${title} — ${classType}`
    : `${timeLabel} ${title}`;
}

export default function EventContent({
  title,
  timeLabel,
  classType,
  view = "month",
  className,
}: Props) {
  const isMonth = view === "month";
  const abbr = classAbbreviation(classType);

  // stack lines for week, truncate for month
  const containerClass = isMonth
    ? "flex w-full h-5 items-center gap-1 sm:gap-1.5 min-w-0 text-[11px] leading-4"
    : "flex h-full flex-col justify-center items-center whitespace-normal break-words";

  return (
    <span className={cn(containerClass, className)}>
      {isMonth ? (
        <>
          {timeLabel && (
            <span className="shrink-0 tabular-nums text-[10px] sm:text-[11px] opacity-70">
              {timeLabel}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">{title}</span>
          {abbr && (
            <span
              className="ml-auto inline-flex shrink-0 items-center justify-center rounded-sm border px-0.5 sm:px-1 text-[10px] leading-none opacity-80"
              aria-hidden
              title={classType}
            >
              {abbr}
            </span>
          )}
        </>
      ) : (
        <>
          {timeLabel && (
            <span className="text-2xs opacity-70">{timeLabel}</span>
          )}
          <span className="font-medium">{title}</span>
          {classType && (
            <span className="text-2xs italic opacity-80">{classType}</span>
          )}
        </>
      )}
    </span>
  );
}
