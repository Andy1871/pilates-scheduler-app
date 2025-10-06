import { getEventsInRange } from "@/lib/eventsRepo";
import { addDays, startOfWeek } from "date-fns";
import WeekView from "@/components/calendar/WeekView";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function WeekPage({
  searchParams,
}: {
  searchParams?: { from?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  
  const params = await searchParams;

  const base = params?.from ? new Date(params.from) : new Date();
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);

  const events = await getEventsInRange(
    weekStart.toISOString(),
    weekEnd.toISOString()
  );

  return (
    <WeekView
      start={weekStart.toISOString()}
      end={weekEnd.toISOString()}
      events={events}
    />
  );
}
