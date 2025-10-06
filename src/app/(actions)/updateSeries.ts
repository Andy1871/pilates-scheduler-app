"use server";

import { prisma } from "@/lib/prisma";
import { AddBookingSchema } from "@/lib/validation";
import { auth } from "@/auth";

export async function updateSeries(seriesId: string, values: unknown) {
  const session = await auth();
  if (!session?.user) return { ok: false, error: { _form: ["Not authenticated"] } };
  const userId = (session.user as any).id as string;

  const parsed = AddBookingSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  const { name, class: classType, classLength, startDate, startTime, status } = parsed.data;

  const startISO = `${startDate}T${startTime}`;
  const start = new Date(startISO);

  const { count } = await prisma.event.updateMany({
    where: { userId, seriesId },
    data: {
      person: name,
      classType,
      durationMins: classLength,
      status,
      start,
      end: new Date(start.getTime() + classLength * 60 * 1000),
    },
  });

  return { ok: true, updated: count };
}
