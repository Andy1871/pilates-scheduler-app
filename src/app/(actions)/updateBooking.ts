"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { localInputToUTC } from "@/lib/date-utils";

export type UpdateBookingResult =
  | { ok: true; updated: number }
  | { ok: false; error: Record<string, string | string[]> };

const Payload = z.object({
  id: z.string(),
  scope: z.enum(["one", "series"]).default("one"),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  person: z.string().min(1),
  classType: z.enum(["reformer", "mat", "duo"]),
  status: z.enum(["paid", "unpaid", "hold"]),
});

export async function updateBooking(
  _prev: unknown,
  formData: FormData
): Promise<UpdateBookingResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: { _form: ["Not authenticated"] } };
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
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { id, scope, dateISO, startTime, endTime, person, classType, status } = parsed.data;

  const newStart = localInputToUTC(`${dateISO}T${startTime}`);
  const newEnd = localInputToUTC(`${dateISO}T${endTime}`);
  if (newEnd <= newStart) {
    return { ok: false, error: { endTime: ["End must be after start"] } };
  }

  const base = await prisma.event.findFirst({
    where: { id, userId },
    select: { id: true, seriesId: true, start: true, end: true, kind: true },
  });
  if (!base || base.kind !== "booking") {
    return { ok: false, error: { _form: ["Booking not found"] } };
  }

  // Single
  if (scope === "one" || !base.seriesId) {
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

  // Series — shift in UTC by delta
  const deltaMs = newStart.getTime() - base.start.getTime();
  const durationMs = newEnd.getTime() - newStart.getTime();

  const seriesEvents = await prisma.event.findMany({
    where: { userId, seriesId: base.seriesId, kind: "booking" },
    select: { id: true, start: true, end: true },
  });

  const seriesIds = seriesEvents.map((e) => e.id);

  const updates = seriesEvents.map((ev) => {
    const s = new Date(ev.start.getTime() + deltaMs);
    const e = new Date(s.getTime() + durationMs);
    return { id: ev.id, start: s, end: e };
  });

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
      return { ok: false, error: { _form: ["Series update conflicts with existing event(s)"] } };
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const u of updates) {
      await tx.event.update({
        where: { id: u.id },
        data: { start: u.start, end: u.end, person, classType, status },
      });
    }
  });

  revalidatePath("/week");
  revalidatePath("/");
  return { ok: true, updated: updates.length };
}
