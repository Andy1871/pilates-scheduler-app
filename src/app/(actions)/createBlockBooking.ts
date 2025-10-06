"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";

const Payload = z.object({
  reason: z.string().min(3),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  blockLength: z.coerce.number().int().min(15).max(480),
  weeks: z.coerce.number().int().min(1).max(52).default(1),
});

export type CreateBlockResult =
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

export async function createBlockBooking(
  _prev: any,
  formData: FormData
): Promise<CreateBlockResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: { _form: ["Not authenticated"] } };
  }
  const userId = (session.user as any).id as string;

  const raw = Object.fromEntries(formData.entries());
  const parsed = Payload.safeParse({
    reason: raw.reason,
    startDate: raw.startDate,
    startTime: raw.startTime,
    blockLength: raw.blockLength,
    weeks: raw.weeks ?? 1,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors };
  }

  const { reason, startDate, startTime, blockLength, weeks } = parsed.data;

  const start0 = toDate(startDate, startTime);
  const end0 = new Date(start0.getTime() + blockLength * 60_000);

  const occurrences = Array.from({ length: weeks }, (_, i) => {
    const s = addDays(start0, i * 7);
    const e = addDays(end0, i * 7);
    return { start: s, end: e };
  });

  const seriesId = weeks > 1 ? randomUUID() : undefined;

  const created = await prisma.$transaction(async (tx) => {
    for (const { start, end } of occurrences) {
      // Only check collisions within this user's calendar
      const overlapBooking = await tx.event.findFirst({
        where: { userId, kind: "booking", start: { lt: end }, end: { gt: start } },
        select: { id: true, start: true },
      });
      if (overlapBooking) {
        throw new Error(
          `Conflicts with an existing booking on ${overlapBooking.start.toISOString().slice(0, 10)}`
        );
      }

      await tx.event.create({
        data: {
          userId,
          kind: "block",
          status: "blocked",
          start,
          end,
          reason,
          durationMins: blockLength,
          ...(seriesId && { seriesId }),
        },
      });
    }
    return occurrences.length;
  }).catch((err: any) => {
    return { error: err.message } as any;
  });

  if (typeof created !== "number") {
    return { ok: false, error: { _form: [created.error || "Failed to create block(s)"] } };
  }

  revalidatePath("/week");
  revalidatePath("/");
  return { ok: true, created };
}
