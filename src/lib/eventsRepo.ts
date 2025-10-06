// lib/eventsRepo.ts
import { prisma } from "@/lib/prisma";
import type { CalendarEvent } from "@/types/event";
import type { ClassType } from "@prisma/client";

// return events that overlap [from, to)
export async function getEventsInRange(fromISO: string, toISO: string): Promise<CalendarEvent[]> {
  const from = new Date(fromISO);
  const to = new Date(toISO);

  const rows = await prisma.event.findMany({
    where: {
      start: { lt: to },
      end: { gt: from },
    },
    orderBy: { start: "asc" },
    
  });

  const events = rows.map((e) => {
    if (e.kind === "booking") {
      if (!e.person || !e.classType) {
        // Handle bad data however you prefer:
        throw new Error(`Booking ${e.id} missing person or classType`);
      }
      // Build a BookingEvent
      return {
        id: e.id,
        kind: "booking",
        start: e.start.toISOString(),
        end: e.end.toISOString(),
        status: (e.status as "paid" | "unpaid" | "hold"),
        person: e.person,
        classType: e.classType as ClassType,
        seriesId: e.seriesId ?? null,
      } satisfies Extract<CalendarEvent, { kind: "booking" }>;
    }

    // e.kind === "block"
    if (!e.reason) {
      throw new Error(`Block ${e.id} missing reason`);
    }
    // Build a BlockEvent — force the public status to literal "blocked"
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
