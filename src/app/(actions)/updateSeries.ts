"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { localInputToUTC } from "@/lib/date-utils";

// assuming AddBookingSchema validates these fields:
const Schema = z.object({
  name: z.string().min(1),
  class: z.enum(["reformer", "mat", "duo"]),
  classLength: z.coerce.number().int().min(15).max(480),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  status: z.enum(["paid", "unpaid", "hold"]),
});

export async function updateSeries(seriesId: string, values: unknown) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: { _form: ["Not authenticated"] } };
  const userId = (session.user as any).id as string;

  const parsed = Schema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  const { name, class: classType, classLength, startDate, startTime, status } = parsed.data;

  // Single wall-time for the series "base" -> UTC
  const start = localInputToUTC(`${startDate}T${startTime}`);
  const end = new Date(start.getTime() + classLength * 60_000);

  const { count } = await prisma.event.updateMany({
    where: { userId, seriesId, kind: "booking" },
    data: {
      person: name,
      classType,
      durationMins: classLength,
      status,
      start,
      end,
    },
  });

  revalidatePath("/week");
  revalidatePath("/");
  return { ok: true, updated: count };
}
