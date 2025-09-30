"use server";
import { AddBookingSchema, AddBlockedTimeSchema } from "@/lib/validation";

export async function addBooking(data: unknown) {
  const parsed = AddBookingSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  // add database or api logic (Prisma?) to save bookings
  console.log("booking saved", parsed.data)
  return { ok: true };
}


export async function addBlockedTime(data: unknown) {
    const parsed = AddBlockedTimeSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, errors: parsed.error.flatten().fieldErrors };
    }
    // add database or api logic (Prisma?) to save bookings
    console.log("blocked time saved", parsed.data)
    return { ok: true };
  }
  