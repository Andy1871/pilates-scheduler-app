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

/** Single, human-readable label (used for aria + tooltips) */
export function buildEventLabel(opts: {
  title: string;
  timeLabel?: string;
  classType?: string;
  view?: "month" | "week" | "day";
}) {
  const { title, timeLabel, classType, view } = opts;

  // Month view stays compact; week/day can include time + classType
  if (view === "month" || !timeLabel) {
    return classType ? `${title} — ${classType}` : title;
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

  // Stack lines for week/day; allow truncation in month
  const containerClass = isMonth
    ? "flex h-5 items-center gap-1 truncate text-[11px] leading-4"
    : "flex h-full flex-col justify-center items-center whitespace-normal break-words";

  return (
    <span className={cn(containerClass, className)}>
      {isMonth ? (
        <>
          <span className="truncate">{title}</span>
          {abbr && (
            <span
              className="ml-auto inline-flex items-center justify-center rounded-sm border px-1 text-[10px] leading-none opacity-80"
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
