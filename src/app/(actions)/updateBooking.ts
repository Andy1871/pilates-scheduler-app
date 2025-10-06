"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

export type UpdateBookingResult =
  | { ok: true; updated: number }
  | { ok: false; error: Record<string, string | string[]> };

const Payload = z.object({
  id: z.string(),                              // event id to base on
  scope: z.enum(["one", "series"]).default("one"),
  // new values
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  person: z.string().min(1),
  classType: z.enum(["reformer", "mat", "duo"]),
  status: z.enum(["paid", "unpaid", "hold"]),
});

function toDate(dateISO: string, hhmm: string) {
  return new Date(`${dateISO}T${hhmm}:00`);
}

export async function updateBooking(
  _prev: any,
  formData: FormData
): Promise<UpdateBookingResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: { _form: ["Not authenticated"] } };
  }
  const userId = (session.user as any).id as string;

  const raw = Object.fromEntries(formData.entries());
  const parsed = Payload.safeParse({
    id: raw.id,
    scope: (raw.scope as string) ?? "one",
    dateISO: raw.dateISO,
    startTime: raw.startTime,
    endTime: raw.endTime,
    person: raw.person,
    classType: raw.classType,
    status: raw.status,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { id, scope, dateISO, startTime, endTime, person, classType, status } =
    parsed.data;

  const newStart = toDate(dateISO, startTime);
  const newEnd = toDate(dateISO, endTime);
  if (newEnd <= newStart) {
    return { ok: false, error: { endTime: ["End must be after start"] } };
  }

  // Get the base event (must belong to the current user)
  const base = await prisma.event.findFirst({
    where: { id, userId },
    select: {
      id: true,
      seriesId: true,
      start: true,
      end: true,
      kind: true,
    },
  });
  if (!base || base.kind !== "booking") {
    return { ok: false, error: { _form: ["Booking not found"] } };
  }

  // Single occurrence update
  if (scope === "one" || !base.seriesId) {
    // prevent overlaps on this user's calendar
    const overlap = await prisma.event.findFirst({
      where: {
        userId,
        id: { not: base.id },
        kind: "booking",
        start: { lt: newEnd },
        end: { gt: newStart },
      },
      select: { id: true },
    });
    const blockOverlap = await prisma.event.findFirst({
      where: { userId, kind: "block", start: { lt: newEnd }, end: { gt: newStart } },
      select: { id: true },
    });
    if (overlap || blockOverlap) {
      return { ok: false, error: { _form: ["Conflicts with existing event"] } };
    }

    await prisma.event.update({
      where: { id: base.id },
      data: {
        start: newStart,
        end: newEnd,
        person,
        classType,
        status,
      },
    });

    revalidatePath("/week");
    revalidatePath("/");
    return { ok: true, updated: 1 };
  }

  // Series update: shift all events by the same delta from base
  const deltaMs = newStart.getTime() - base.start.getTime();
  const durationMs = newEnd.getTime() - newStart.getTime();

  const seriesEvents = await prisma.event.findMany({
    where: { userId, seriesId: base.seriesId, kind: "booking" },
    select: { id: true, start: true, end: true },
  });

  const seriesIds = seriesEvents.map((e: any) => e.id);

  // Build new times for each occurrence
  const updates = seriesEvents.map((ev: any) => {
    const s = new Date(ev.start.getTime() + deltaMs);
    const e = new Date(s.getTime() + durationMs);
    return { id: ev.id, start: s, end: e };
  });

  // Validate conflicts for each occurrence (exclude the series itself)
  for (const u of updates) {
    const overlap = await prisma.event.findFirst({
      where: {
        userId,
        id: { notIn: seriesIds },
        kind: "booking",
        start: { lt: u.end },
        end: { gt: u.start },
      },
      select: { id: true },
    });
    const blockOverlap = await prisma.event.findFirst({
      where: { userId, kind: "block", start: { lt: u.end }, end: { gt: u.start } },
      select: { id: true },
    });
    if (overlap || blockOverlap) {
      return {
        ok: false,
        error: { _form: ["Series update conflicts with existing event(s)"] },
      };
    }
  }

  // Apply updates in a transaction
  await prisma.$transaction(async (tx: any) => {
    for (const u of updates) {
      await tx.event.update({
        where: { id: u.id },
        data: {
          start: u.start,
          end: u.end,
          person,
          classType,
          status,
        },
      });
    }
  });

  revalidatePath("/week");
  revalidatePath("/");
  return { ok: true, updated: updates.length };
}
