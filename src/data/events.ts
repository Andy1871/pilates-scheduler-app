import type { CalendarEvent } from "@/types/event";

export const events: CalendarEvent[] = [
  {
    id: "e101",
    title: "1-2-1 Andy",
    start: "2025-08-04T09:00:00+01:00",
    end:   "2025-08-04T10:00:00+01:00",
    status: "paid",
    person: "Andy",
  },
  {
    id: "e102",
    title: "1-2-1 Benjy",
    start: "2025-08-04T11:30:00+01:00",
    end:   "2025-08-04T12:15:00+01:00",
    status: "unpaid",
    person: "Benjy",
  },
  {
    id: "e103",
    title: "Blocked out",
    start: "2025-08-07T13:00:00+01:00",
    end:   "2025-08-07T15:00:00+01:00",
    status: "blocked",
  },
  {
    id: "e104",
    title: "Hold: Call Natasha",
    start: "2025-08-12T08:30:00+01:00",
    end:   "2025-08-12T09:00:00+01:00",
    status: "hold",
    person: "Natasha",
  },
  {
    id: "e105",
    title: "1-2-1 Mike",
    start: "2025-08-19T18:00:00+01:00",
    end:   "2025-08-19T19:00:00+01:00",
    status: "unpaid",
    person: "Mike",
  },
  {
    id: "e106",
    title: "1-2-1 Bink",
    start: "2025-08-25T07:30:00+01:00",
    end:   "2025-08-25T08:15:00+01:00",
    status: "paid",
    person: "Bink",
  },
];
