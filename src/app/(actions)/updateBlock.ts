"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

export type UpdateBlockResult =
  | { ok: true; updated: number }
  | { ok: false; error: Record<string, string | string[]> };

const Payload = z.object({
  id: z.string(),
  scope: z.enum(["one", "series"]).default("one"),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  blockLength: z.coerce.number().int().min(15).max(480),
  reason: z.string().min(1),
});

function toDate(dateISO: string, hhmm: string) {
  return new Date(`${dateISO}T${hhmm}:00`);
}

export async function updateBlock(
  _prev: any,
  formData: FormData
): Promise<UpdateBlockResult> {
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
    blockLength: raw.blockLength,
    reason: raw.reason,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { id, scope, dateISO, startTime, blockLength, reason } = parsed.data;
  const newStart = toDate(dateISO, startTime);
  const newEnd = new Date(newStart.getTime() + blockLength * 60_000);

  const base = await prisma.event.findFirst({
    where: { id, userId },
    select: { id: true, seriesId: true, kind: true, start: true, end: true },
  });
  if (!base || base.kind !== "block") {
    return { ok: false, error: { _form: ["Block not found"] } };
  }

  // Single
  if (scope === "one" || !base.seriesId) {
    // avoid overlapping this user's bookings
    const overlapBooking = await prisma.event.findFirst({
      where: { userId, kind: "booking", start: { lt: newEnd }, end: { gt: newStart } },
      select: { id: true },
    });
    if (overlapBooking) {
      return { ok: false, error: { _form: ["Conflicts with a booking"] } };
    }

    await prisma.event.update({
      where: { id: base.id },
      data: {
        start: newStart,
        end: newEnd,
        reason,
        durationMins: blockLength,
        status: "blocked",
      },
    });

    revalidatePath("/week");
    revalidatePath("/");
    return { ok: true, updated: 1 };
  }

  // Series — shift by delta
  const deltaMs = newStart.getTime() - base.start.getTime();

  const series = await prisma.event.findMany({
    where: { userId, seriesId: base.seriesId, kind: "block" },
    select: { id: true, start: true, end: true },
  });

  const updates = series.map((ev) => {
    const s = new Date(ev.start.getTime() + deltaMs);
    const e = new Date(s.getTime() + blockLength * 60_000);
    return { id: ev.id, start: s, end: e };
  });

  // Validate (this user only)
  for (const u of updates) {
    const overlapBooking = await prisma.event.findFirst({
      where: { userId, kind: "booking", start: { lt: u.end }, end: { gt: u.start } },
      select: { id: true },
    });
    if (overlapBooking) {
      return {
        ok: false,
        error: { _form: ["Series update conflicts with booking(s)"] },
      };
    }
  }

  await prisma.$transaction(async (tx: any) => {
    for (const u of updates) {
      await tx.event.update({
        where: { id: u.id },
        data: {
          start: u.start,
          end: u.end,
          reason,
          durationMins: blockLength,
          status: "blocked",
        },
      });
    }
  });

  revalidatePath("/week");
  revalidatePath("/");
  return { ok: true, updated: updates.length };
}
