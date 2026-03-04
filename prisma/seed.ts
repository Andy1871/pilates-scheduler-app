import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, isWeekend } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

const prisma = new PrismaClient();
const TZ = "Europe/London";

const clients = [
  "Sarah Mitchell", "Emma Thompson", "Lucy Davies",
  "Kate Wilson", "Jessica Brown", "Rachel Taylor",
  "Hannah Martin", "Sophie Anderson", "Claire Roberts",
  "Amy Johnson", "Olivia Harris", "Laura White",
  "Natalie Evans", "Megan Clarke", "Zoe Hughes",
];

const classTypes = ["reformer", "mat", "duo"] as const;
const statuses = ["paid", "unpaid", "hold"] as const;

// Four possible time slots per day (London local time)
const slots = [
  { time: "08:00", durationMins: 55 },
  { time: "09:30", durationMins: 55 },
  { time: "11:00", durationMins: 55 },
  { time: "14:00", durationMins: 55 },
];

function toUTC(dateISO: string, timeHHmm: string): Date {
  return zonedTimeToUtc(`${dateISO}T${timeHHmm}:00`, TZ);
}

function padDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function main() {
  console.log("Seeding TestUser…");

  const hash = await bcrypt.hash("TestUserPassword", 10);

  const testUser = await prisma.user.upsert({
    where: { username: "TestUser" },
    update: { password: hash },
    create: {
      username: "TestUser",
      name: "Test User",
      email: "testuser@pilates-demo.com",
      password: hash,
    },
  });

  console.log(`TestUser id: ${testUser.id}`);

  // Wipe existing events for TestUser so re-running doesn't duplicate
  await prisma.event.deleteMany({ where: { userId: testUser.id } });

  // Generate events for March + April 2026 (weekdays only, 2-3 per day)
  const start = new Date("2026-03-01");
  const end = new Date("2026-04-30");

  let current = start;
  let counter = 0;
  let created = 0;

  while (current <= end) {
    if (!isWeekend(current)) {
      const dateISO = padDate(current);
      // Alternate between 2 and 3 sessions per day
      const numSlots = counter % 3 === 0 ? 2 : 3;
      const daySlots = slots.slice(0, numSlots);

      for (const slot of daySlots) {
        const startUTC = toUTC(dateISO, slot.time);
        const endUTC = new Date(startUTC.getTime() + slot.durationMins * 60_000);

        await prisma.event.create({
          data: {
            userId: testUser.id,
            kind: "booking",
            status: statuses[counter % statuses.length],
            start: startUTC,
            end: endUTC,
            person: clients[counter % clients.length],
            classType: classTypes[counter % classTypes.length],
          },
        });

        counter++;
        created++;
      }
    }

    current = addDays(current, 1);
  }

  console.log(`Created ${created} events for TestUser.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
