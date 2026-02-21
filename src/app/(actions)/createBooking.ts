"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { localInputToUTC, addDaysISO } from "@/lib/date-utils";

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

export async function createBooking(
  _prev: unknown,
  formData: FormData
): Promise<CreateBookingResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: { _form: ["Not authenticated"] } };
  const userId = session.user.id;

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
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { dateISO, startTime, endTime, person, classType, status, weeks } = parsed.data;

  // First occurrence turned into UTC
  const startUTC0 = localInputToUTC(`${dateISO}T${startTime}`);
  const endUTC0 = localInputToUTC(`${dateISO}T${endTime}`);
  if (endUTC0 <= startUTC0) {
    return { ok: false, error: { endTime: ["End must be after start"] } };
  }
  const durationMs = endUTC0.getTime() - startUTC0.getTime();

  // Weekly occurrences at the same London time, across DST correctly
  const occurrences = Array.from({ length: weeks }, (_, i) => {
    const dISO = addDaysISO(dateISO, i * 7);
    const s = localInputToUTC(`${dISO}T${startTime}`);
    const e = new Date(s.getTime() + durationMs);
    return { start: s, end: e };
  });

  const seriesId = weeks > 1 ? randomUUID() : undefined;

  const created = await prisma.$transaction(async (tx) => {
    for (const { start, end } of occurrences) {
      // Check only this user's calendar
      const overlapBooking = await tx.event.findFirst({
        where: { userId, kind: "booking", start: { lt: end }, end: { gt: start } },
        select: { id: true, start: true },
      });
      if (overlapBooking) {
        throw new Error(
          `Conflicts with an existing booking on ${overlapBooking.start.toISOString().slice(0, 10)}`
        );
      }

      const overlapBlock = await tx.event.findFirst({
        where: { userId, kind: "block", start: { lt: end }, end: { gt: start } },
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
          status,
          start,
          end,
          person,
          classType,
          ...(seriesId && { seriesId }),
        },
      });
    }
    return occurrences.length;
  }).catch((err: any) => ({ error: err.message } as any));

  if (typeof created !== "number") {
    return { ok: false, error: { _form: [created.error || "Failed to create booking(s)"] } };
  }

  revalidatePath("/week");
  revalidatePath("/");
  return { ok: true, created };
}
