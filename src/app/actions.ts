"use server";

import { z } from "zod";
import { addMinutes, addWeeks, parseISO } from "date-fns";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AddBookingSchema, AddBlockedTimeSchema } from "@/lib/validation";
import { auth } from "@/auth";
import { randomUUID } from "node:crypto";

const DEFAULT_START_TIME = "09:00:00";       // until you add a time picker
const DEFAULT_BLOCK_MINUTES = 60;            // temp default for blocks

// Build a Date from "yyyy-MM-dd" using a default time-of-day.
// NOTE: "YYYY-MM-DDTHH:mm:ss" parses as UTC in JS; adjust if you need strict Europe/London wall time.
function dateAtTime(dateYYYYMMDD: string, hhmmss: string) {
  return parseISO(`${dateYYYYMMDD}T${hhmmss}`);
}

export async function addBooking(data: unknown) {
  // ✅ Ensure user is authenticated and get userId for scoping & inserts
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" as const };
  }
  const userId = session.user.id;

  const parsed = AddBookingSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, class: classType, classLength, startDate, weeks, status } = parsed.data;

  // First occurrence
  const firstStart = dateAtTime(startDate, DEFAULT_START_TIME);
  const firstEnd = addMinutes(firstStart, classLength);

  const seriesId = weeks > 1 ? randomUUID() : undefined;

  // Build N weekly sessions
  const sessions = Array.from({ length: weeks }, (_, i) => {
    const start = addWeeks(firstStart, i);
    const end = addWeeks(firstEnd, i);
    return {
      // id: omitted to let Prisma default (cuid)
      userId,                    // ✅ REQUIRED by EventCreateManyInput
      kind: "booking" as const,
      status,                    // "paid" | "unpaid" | "hold"
      start,
      end,
      person: name,
      classType,                 // "reformer" | "mat" | "duo"
      // durationMins: classLength, // uncomment if you’re using this column
      ...(seriesId && { seriesId }),
    };
  });

  // Optional: conflict check (scoped to this user only)
  const conflicts = await prisma.event.findMany({
    where: {
      userId, // ✅ only check this user's calendar
      OR: sessions.map((s) => ({
        AND: [{ start: { lt: s.end } }, { end: { gt: s.start } }],
      })),
    },
    select: { id: true, start: true, end: true, kind: true, person: true },
  });

  if (conflicts.length) {
    return { ok: false, error: "conflict" as const, details: conflicts };
  }

  try {
    await prisma.event.createMany({ data: sessions });
    // Refresh any pages that show calendar data
    revalidatePath("/week");
    revalidatePath("/"); // your month view lives on "/"
    return { ok: true as const };
  } catch (e) {
    console.error("addBooking error:", e);
    return { ok: false as const, error: "db_error" as const };
  }
}

export async function addBlockedTime(data: unknown) {
  // ✅ Ensure user is authenticated and get userId
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" as const };
  }
  const userId = session.user.id;

  const parsed = AddBlockedTimeSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { reason, startDate, weeks } = parsed.data;

  const firstStart = dateAtTime(startDate, DEFAULT_START_TIME);
  const firstEnd = addMinutes(firstStart, DEFAULT_BLOCK_MINUTES);

  const seriesId = weeks > 1 ? randomUUID() : undefined;

  const blocks = Array.from({ length: weeks }, (_, i) => {
    const start = addWeeks(firstStart, i);
    const end = addWeeks(firstEnd, i);
    return {
      userId,                   // ✅ REQUIRED by EventCreateManyInput
      kind: "block" as const,
      status: "blocked" as const,
      start,
      end,
      reason,
      person: null,
      classType: null,
      // durationMins: DEFAULT_BLOCK_MINUTES, // uncomment if you’re using this column
      ...(seriesId && { seriesId }),
    };
  });

  try {
    await prisma.event.createMany({ data: blocks });
    revalidatePath("/week");
    revalidatePath("/"); // month view on "/"
    return { ok: true as const };
  } catch (e) {
    console.error("addBlockedTime error:", e);
    return { ok: false as const, error: "db_error" as const };
  }
}
