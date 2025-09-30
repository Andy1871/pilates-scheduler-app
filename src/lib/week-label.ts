import { startOfWeek, endOfWeek, isSameMonth, format } from "date-fns";

export function getWeekRangeLabel(viewDate: Date) {
  const start = startOfWeek(viewDate, { weekStartsOn: 1 });
  const end = endOfWeek(viewDate, { weekStartsOn: 1 });

  // Same month: "23–29 Sep 2025"
  if (isSameMonth(start, end)) {
    return `${format(start, "d")}–${format(end, "d MMM yyyy")}`;
  }
  // Cross-month: "30 Sep – 6 Oct 2025"
  return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
}
