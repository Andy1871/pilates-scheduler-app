"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";

// Parse the payload coming from AddForm
const Payload = z.object({
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  person: z.string().min(1),
  classType: z.enum(["reformer", "mat", "duo"]),
  status: z.enum(["paid", "unpaid", "hold"]).default("unpaid"),
  weeks: z.coerce.number().int().min(1).max(52).default(1),
});

export type CreateBookingResult =
  | { ok: true; created: number }
  | { ok: false; error: Record<string, string | string[]> };

function toDate(dateISO: string, hhmm: string) {
  return new Date(`${dateISO}T${hhmm}:00`);
}
function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export async function createBooking(
  _prev: any,
  formData: FormData
): Promise<CreateBookingResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: { _form: ["Not authenticated"] } };
  }
  const userId = (session.user as any).id as string;

  const raw = Object.fromEntries(formData.entries());
  const parsed = Payload.safeParse({
    dateISO: raw.dateISO,
    startTime: raw.startTime,
    endTime: raw.endTime,
    person: raw.person,
    classType: raw.classType,
    status: (raw.status as string) ?? "unpaid",
    weeks: raw.weeks ?? 1,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { dateISO, startTime, endTime, person, classType, status, weeks } = parsed.data;

  const start0 = toDate(dateISO, startTime);
  const end0 = toDate(dateISO, endTime);
  if (end0 <= start0) {
    return { ok: false, error: { endTime: ["End must be after start"] } };
  }
  const durationMs = end0.getTime() - start0.getTime();

  // Build each weekly occurrence in memory
  const occurrences = Array.from({ length: weeks }, (_, i) => {
    const s = addDays(start0, i * 7);
    const e = new Date(s.getTime() + durationMs);
    return { start: s, end: e };
  });

  const seriesId = weeks > 1 ? randomUUID() : undefined;

  const created = await prisma.$transaction(async (tx: any) => {
    for (const { start, end } of occurrences) {
      // Check only this user's calendar
      const overlapBooking = await tx.event.findFirst({
        where: {
          userId,
          kind: "booking",
          start: { lt: end },
          end: { gt: start },
        },
        select: { id: true, start: true },
      });
      if (overlapBooking) {
        throw new Error(
          `Conflicts with an existing booking on ${overlapBooking.start.toISOString().slice(0, 10)}`
        );
      }

      const overlapBlock = await tx.event.findFirst({
        where: {
          userId,
          kind: "block",
          start: { lt: end },
          end: { gt: start },
        },
        select: { id: true, start: true },
      });
      if (overlapBlock) {
        throw new Error(
          `Time is blocked on ${overlapBlock.start.toISOString().slice(0, 10)}`
        );
      }

      await tx.event.create({
        data: {
          userId,
          kind: "booking",
          status, // "paid" | "unpaid" | "hold"
          start,
          end,
          person,
          classType, // Prisma enum in UI; string in DB unless you defined an enum
          ...(seriesId && { seriesId }),
        },
      });
    }
    return occurrences.length;
  }).catch((err: any) => {
    return { error: err.message } as any;
  });

  if (typeof created !== "number") {
    return { ok: false, error: { _form: [created.error || "Failed to create booking(s)"] } };
  }

  revalidatePath("/week");
  revalidatePath("/");
  return { ok: true, created };
}
