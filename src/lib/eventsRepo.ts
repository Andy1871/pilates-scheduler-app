// File receives info from the DB and coverts into typed CalendarEvent objects

import { prisma } from "@/lib/prisma";
import type { CalendarEvent } from "@/types/event";
import type { ClassType } from "@prisma/client";

// return events that overlap (from, to)
export async function getEventsInRange(fromISO: string, toISO: string, userId: string): Promise<CalendarEvent[]> {
  const from = new Date(fromISO);
  const to = new Date(toISO);

  // find the data belonging to user, from date, to date
  const rows = await prisma.event.findMany({
    where: {
      userId,
      start: { lt: to },
      end: { gt: from },
    },
    orderBy: { start: "asc" },
    
  });

  const events = rows.map((e) => {
    if (e.kind === "booking") {
      if (!e.person || !e.classType) {
        throw new Error(`Booking ${e.id} missing person or classType`);
      }
      // Builds the booking event
      return {
        id: e.id,
        kind: "booking",
        start: e.start.toISOString(),
        end: e.end.toISOString(),
        status: (e.status as "paid" | "unpaid" | "hold"),
        person: e.person,
        classType: e.classType as ClassType,
        seriesId: e.seriesId ?? null,
      } satisfies Extract<CalendarEvent, { kind: "booking" }>; // tells typescript that is must match the CalendarEvent where kind is 'booking'
    }

    // e.kind === "block"
    if (!e.reason) {
      throw new Error(`Block ${e.id} missing reason`);
    }
    // Build a block event 
    return {
      id: e.id,
      kind: "block",
      start: e.start.toISOString(),
      end: e.end.toISOString(),
      status: "blocked",
      reason: e.reason,
      seriesId: e.seriesId ?? null,
    } satisfies Extract<CalendarEvent, { kind: "block" }>;
  });

  return events;
}
