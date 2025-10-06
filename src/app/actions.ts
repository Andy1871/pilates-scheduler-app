"use server";

import { z } from "zod";
import { addMinutes, addWeeks, parseISO } from "date-fns";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AddBookingSchema, AddBlockedTimeSchema } from "@/lib/validation";

const DEFAULT_START_TIME = "09:00:00";       // until you add a time picker
const DEFAULT_BLOCK_MINUTES = 60;            // temp default for blocks

// Small helper: build a Date from "yyyy-MM-dd" using a default time-of-day.
// NOTE: "YYYY-MM-DDTHH:mm:ss" parses as UTC in JS; that’s fine if you render in local time.
function dateAtTime(dateYYYYMMDD: string, hhmmss: string) {
  return parseISO(`${dateYYYYMMDD}T${hhmmss}`);
}

export async function addBooking(data: unknown) {
  const parsed = AddBookingSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, class: classType, classLength, startDate, weeks, status } = parsed.data;

  // First occurrence
  const firstStart = dateAtTime(startDate, DEFAULT_START_TIME);
  const firstEnd = addMinutes(firstStart, classLength);

  // Build N weekly sessions
  const sessions = Array.from({ length: weeks }, (_, i) => {
    const start = addWeeks(firstStart, i);
    const end = addWeeks(firstEnd, i);
    return {
      id: undefined as string | undefined, // let Prisma cuid() fill if your model uses it
      kind: "booking" as const,
      status,
      start,
      end,
      person: name,
      classType,
      // durationMins: classLength, // include if you added this column
    };
  });

  // Optional: conflict check (overlap if start < existing.end && end > existing.start)
  const conflicts = await prisma.event.findMany({
    where: {
      OR: sessions.map((s) => ({
        AND: [{ start: { lt: s.end } }, { end: { gt: s.start } }],
      })),
    },
    select: { id: true, start: true, end: true, kind: true, person: true },
  });

  if (conflicts.length) {
    return { ok: false, error: "conflict", details: conflicts };
  }

  try {
    await prisma.event.createMany({ data: sessions });
    // Refresh any pages that show calendar data
    revalidatePath("/week");
    revalidatePath("/month");
    return { ok: true };
  } catch (e) {
    console.error("addBooking error:", e);
    return { ok: false, error: "db_error" };
  }
}

export async function addBlockedTime(data: unknown) {
  const parsed = AddBlockedTimeSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { reason, startDate, weeks } = parsed.data;

  const firstStart = dateAtTime(startDate, DEFAULT_START_TIME);
  const firstEnd = addMinutes(firstStart, DEFAULT_BLOCK_MINUTES);

  const blocks = Array.from({ length: weeks }, (_, i) => {
    const start = addWeeks(firstStart, i);
    const end = addWeeks(firstEnd, i);
    return {
      kind: "block" as const,
      status: "blocked" as const,
      start,
      end,
      reason,
      person: null,
      classType: null,
      // durationMins: DEFAULT_BLOCK_MINUTES, // if you added this column
    };
  });

  try {
    await prisma.event.createMany({ data: blocks });
    revalidatePath("/week");
    revalidatePath("/month");
    return { ok: true };
  } catch (e) {
    console.error("addBlockedTime error:", e);
    return { ok: false, error: "db_error" };
  }
}
