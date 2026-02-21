"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";

export type DeleteBlockResult =
  | { ok: true; deleted: number }
  | { ok: false; error: Record<string, string | string[]> };

const Payload = z.object({
  id: z.string(),
  scope: z.enum(["one", "series"]).default("one"),
});

export async function deleteBlock(
  _prev: unknown,
  formData: FormData
): Promise<DeleteBlockResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: { _form: ["Not authenticated"] } };
  const userId = session.user.id;

  const raw = Object.fromEntries(formData.entries());
  const parsed = Payload.safeParse({
    id: raw.id,
    scope: (raw.scope as string) ?? "one",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.flatten().fieldErrors };

  const { id, scope } = parsed.data;

  const base = await prisma.event.findFirst({
    where: { id, userId },
    select: { id: true, kind: true, seriesId: true },
  });
  if (!base || base.kind !== "block") {
    return { ok: false, error: { _form: ["Block not found"] } };
  }

  // Delete one
  if (scope === "one" || !base.seriesId) {
    await prisma.event.delete({ where: { id: base.id } });
    revalidatePath("/week");
    revalidatePath("/");
    return { ok: true, deleted: 1 };
  }

  // Delete whole series
  const { count } = await prisma.event.deleteMany({
    where: { userId, kind: "block", seriesId: base.seriesId },
  });

  revalidatePath("/week");
  revalidatePath("/");
  return { ok: true, deleted: count };
}
