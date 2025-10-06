// scripts/upsert-test-booking.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60000);
}

async function main() {
  // Use the direct connection to avoid PgBouncer issues for scripts
  if (process.env.DIRECT_URL) process.env.DATABASE_URL = process.env.DIRECT_URL;

  const start = new Date("2025-10-06T09:00:00+01:00");
  const duration = 55;
  const end = addMinutes(start, duration);

  const result = await prisma.event.upsert({
    where: { id: "test-booking-1" }, // unique
    update: {
      status: "paid",
      end,
      durationMins: duration,
    },
    create: {
      id: "test-booking-1",
      kind: "booking",
      status: "paid",
      start,
      end,
      person: "Test Client",
      classType: "reformer",
      durationMins: duration,
    },
  });

  console.log("Upserted:", result.id, result.start, result.end, {result});
}

main().finally(() => prisma.$disconnect());
