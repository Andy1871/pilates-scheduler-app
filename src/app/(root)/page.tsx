import MonthView from "@/components/calendar/MonthView";
import { getEventsInRange } from "@/lib/eventsRepo";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home({
  searchParams,
}: {
  searchParams?: { month?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const userId = (session.user as any).id as string;

  const params = await searchParams;

  const base = params?.month ? new Date(params.month) : new Date();

  const visibleStart = startOfWeek(startOfMonth(base), { weekStartsOn: 1 });
  const visibleEnd = endOfWeek(endOfMonth(base), { weekStartsOn: 1 });

  const events = await getEventsInRange(
    visibleStart.toISOString(),
    visibleEnd.toISOString(),
    userId
  );

  return (
    <div>
      <MonthView
        visibleStart={visibleStart.toISOString()}
        visibleEnd={visibleEnd.toISOString()}
        events={events}
      />
    </div>
  );
}
