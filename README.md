# Pilates Scheduler

A **full-stack calendar scheduling app** built for self-employed Pilates professionals.
Manage sessions, clients, and blocked time in an intuitive weekly and monthly calendar — with recurring bookings, conflict detection, and timezone-safe date handling baked in from the ground up.

**Live Demo:** [pilates-scheduler.vercel.app](https://pilates-scheduler.vercel.app/) — Free, secure login via Google. App screenshots below if preferred.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-18181B?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## Features

- **Month & Week Views** — switch between high-level monthly overview and a detailed hourly week grid
- **Click-to-create** — click any empty time slot or day cell to open a pre-populated booking form
- **Recurring bookings** — create up to 52 weekly occurrences in one action, all linked by a shared `seriesId`
- **Edit single or series** — a toggle lets you update just one occurrence or propagate changes across the entire recurring series
- **Conflict detection** — server-side checks prevent double-booking against both existing sessions and blocked time
- **Block time** — mark unavailable periods to protect time off or personal commitments
- **Colour-coded events** — visual status indicators for paid, unpaid, held, and blocked sessions
- **Timezone-aware** — all dates stored in UTC; UI consistently renders in Europe/London, including DST transitions
- **Google OAuth** — each user's calendar is fully private and isolated at the database level
- **Responsive** — works on mobile, tablet and desktop

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Google OAuth, Prisma adapter) |
| Forms | React Hook Form + Zod |
| Dates | date-fns + date-fns-tz |
| Deployment | Vercel |

---

## Architecture

The app follows a clear server/client boundary using Next.js App Router conventions:

```
Page (Server Component)
  └── fetches events for visible date range via eventsRepo
  └── passes typed props to View

View Component (Client Component)
  └── manages dialog/modal state
  └── handles click-to-create and event selection

Server Actions
  └── validate input (Zod)
  └── check conflicts (Prisma transaction)
  └── write to DB → revalidatePath() refreshes page data
```

No client-side API routes are used. Forms submit directly to typed server actions via `useActionState`, keeping mutation logic server-side and the client bundle lean.

---

## Technical Deep-Dive

### 1. Timezone Management

Storing `DateTime` in UTC is standard, but rendering it correctly in a specific timezone — including across DST boundaries — is not trivial. All conversion happens in [`src/lib/date-utils.ts`](src/lib/date-utils.ts) using `date-fns-tz`:

```ts
// User's input (e.g. "09:00" on a form) is treated as Europe/London local time
export function localInputToUTC(naive: string): Date {
  return zonedTimeToUtc(naive, TZ); // handles DST automatically
}

// UTC from DB → London local time for calendar positioning
export function utcToLondon(d: Date | string | number): Date {
  return utcToZonedTime(asDate(d), TZ);
}
```

This two-function pattern means the rest of the app never thinks about timezones — it just passes strings and gets the right `Date` back. The `asDate()` helper normalises inputs so these functions accept `Date`, `string`, or `number` interchangeably.

---

### 2. Recurring Events & Series Editing

Creating a recurring booking generates up to 52 individual `Event` rows in one database transaction. All occurrences share a `seriesId` (a UUID) so they can be queried or updated as a group.

**Creation** ([`src/app/(actions)/createBooking.ts`](src/app/(actions)/createBooking.ts)):

```ts
// Each occurrence is built at the same London clock time, not just +7 days in UTC.
// This means a 9am Monday class stays at 9am even when clocks change.
const occurrences = Array.from({ length: weeks }, (_, i) => {
  const dISO = addDaysISO(dateISO, i * 7);
  const s = localInputToUTC(`${dISO}T${startTime}`);
  const e = new Date(s.getTime() + durationMs);
  return { start: s, end: e };
});

const seriesId = weeks > 1 ? randomUUID() : undefined;
```

**Series update** ([`src/app/(actions)/updateBooking.ts`](src/app/(actions)/updateBooking.ts)):

When editing a whole series, the action calculates the time delta between the edited event's old and new start, then applies that same shift to every event in the series. This preserves relative spacing while applying the change uniformly:

```ts
const deltaMs = newStart.getTime() - base.start.getTime();
const durationMs = newEnd.getTime() - newStart.getTime();

const updates = seriesEvents.map((ev) => {
  const s = new Date(ev.start.getTime() + deltaMs);
  const e = new Date(s.getTime() + durationMs);
  return { id: ev.id, start: s, end: e };
});
```

Each individual update is conflict-checked before the batch `$transaction` write, so the entire update is atomic — either everything succeeds or nothing changes.

---

### 3. Click-to-Create with Pixel Math

In the week view, clicking an empty time slot opens the add-booking form pre-populated with that exact time. The challenge is converting a mouse Y position (pixels) into a meaningful time.

[`src/components/calendar/WeekDayColumn.tsx`](src/components/calendar/WeekDayColumn.tsx):

```ts
const HOUR_PX = 64;         // 1 hour = 64px (two 32px half-hour slots)
const PX_PER_MIN = HOUR_PX / 60;

const handleCreateAtPointer = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const y = e.clientY - rect.top;

  // px → raw minutes → clamp to grid bounds → snap to slot interval
  const rawMinutes = y / PX_PER_MIN;
  const clamped = Math.max(0, Math.min(totalMinutes - 1, rawMinutes));
  const snapped = Math.round(clamped / slotMinutes) * slotMinutes;

  const startISO = buildSlotStartISO(dateISO, startHour, snapped);
  onCreateBooking(startISO);
};
```

Event rendering uses the same constants in reverse — converting a UTC start time to a pixel offset and height:

```ts
function getEventBounds(ev, startHour, endHour) {
  const topMin  = Math.max(0, startMin);
  const durMin  = Math.max(1, bottomMin - topMin); // min 1 minute avoids zero-height
  return {
    top:    topMin * PX_PER_MIN,
    height: Math.max(MIN_HEIGHT_PX, durMin * PX_PER_MIN), // min 18px for readability
  };
}
```

The event layer uses `pointer-events-none` on the container and `pointer-events-auto` on each event card, so events intercept their own clicks while the underlying hit layer still fires for empty space. `e.stopPropagation()` on event click prevents the create-booking handler from also firing.

---

### 4. Conflict Detection in a Transaction

Double-booking is prevented server-side before any write. The check runs inside a `prisma.$transaction` so it's atomic — no other request can slip a booking in between the check and the insert:

```ts
const created = await prisma.$transaction(async (tx) => {
  for (const { start, end } of occurrences) {
    // Classic half-open interval overlap: A overlaps B if A.start < B.end && A.end > B.start
    const overlapBooking = await tx.event.findFirst({
      where: { userId, kind: "booking", start: { lt: end }, end: { gt: start } },
    });
    if (overlapBooking) throw new Error(`Conflicts with booking on ...`);

    const overlapBlock = await tx.event.findFirst({
      where: { userId, kind: "block", start: { lt: end }, end: { gt: start } },
    });
    if (overlapBlock) throw new Error(`Time is blocked on ...`);

    await tx.event.create({ data: { ... } });
  }
});
```

Errors thrown inside `$transaction` automatically roll back all writes, and the caught error message is returned to the client as a structured field error — not an unhandled exception.

---

### 5. Type-Safe Discriminated Union for Events

The database stores bookings and blocks in a single `Event` table distinguished by a `kind` field. In TypeScript this is modelled as a discriminated union:

```ts
// src/types/event.ts
type BookingEvent = { kind: "booking"; person: string; classType: string; status: string; ... };
type BlockEvent   = { kind: "block"; ... };
export type CalendarEvent = BookingEvent | BlockEvent;
```

Components that render events narrow the type with `ev.kind === "booking"` checks, giving full type safety throughout the rendering pipeline without any type assertions.

---

## Images

**Month View**

<img width="1121" height="754" alt="Pilates - Month View" src="https://github.com/user-attachments/assets/a8da3563-5bb7-41a0-8995-7d72d1c29d38" />


**Week View**

<img width="1118" height="804" alt="Pilates - Week View" src="https://github.com/user-attachments/assets/1c901e3f-5b80-407d-b286-70ef911e08be" />


**Add Booking Form**

<img width="485" height="453" alt="Pilates Add Booking" src="https://github.com/user-attachments/assets/e5b8d697-e7af-4110-b2bf-10f47527ea74" />

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. Supabase free tier)
- A Google OAuth app ([console.cloud.google.com](https://console.cloud.google.com))

### Setup

```bash
git clone https://github.com/your-username/pilates-scheduler-updates.git
cd pilates-scheduler-updates
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Run migrations and seed data:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
```
