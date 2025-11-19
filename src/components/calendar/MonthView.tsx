"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import MonthGrid, { type DayModel } from "./MonthGrid";
import CalendarHeader from "./CalendarHeader";
import AddForm from "../AddForm";
import BlockTimeForm from "../BlockTimeForm";
import EditForm from "../EditForm"; 

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  startOfMonth,
  addMonths,
  startOfWeek,
  addDays,
  format,
} from "date-fns";

import { formatInTZ } from "@/lib/date-utils";
import type { CalendarEvent } from "@/types/event";

type Props = {
  visibleStart: string; // ISO for the first visible grid day (Mon of first row)
  visibleEnd: string;   // ISO for the last visible grid day (Sun of last row)
  events: CalendarEvent[];
};

export function buildMonthMatrix(viewDate: Date): DayModel[] {
  const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }); // local TZ
  const todayISO = format(new Date(), "yyyy-MM-dd");
  const viewMonthKey = format(viewDate, "yyyy-MM");

  const days: DayModel[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    const iso = format(d, "yyyy-MM-dd");
    const monthKey = iso.slice(0, 7);
    days.push({
      dateISO: iso,
      isCurrentMonth: monthKey === viewMonthKey,
      isToday: iso === todayISO,
    });
  }
  return days;
}

function groupEventsByDate(list: CalendarEvent[]): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};
  for (const ev of list) {
    const key = formatInTZ(new Date(ev.start), "yyyy-MM-dd");
    (map[key] ??= []).push(ev);
  }
  return map;
}

export default function MonthView({ visibleStart, visibleEnd, events }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Find the reference month from the midpoint of the visible grid
  const viewDate = useMemo(() => {
    const start = new Date(visibleStart);
    const end = new Date(visibleEnd);
    const mid = new Date((start.getTime() + end.getTime()) / 2);
    return startOfMonth(mid);
  }, [visibleStart, visibleEnd]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedId) ?? null,
    [selectedId, events]
  );


  const days = useMemo(() => buildMonthMatrix(viewDate), [viewDate]);
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  // set router params to month info 
  const pushMonth = (d: Date) => {
    const monthParam = format(startOfMonth(d), "yyyy-MM-01");
    router.push(`${pathname}?month=${monthParam}`);
  };

  return (
    <>
      <CalendarHeader
        viewDate={viewDate}
        onPrev={() => pushMonth(addMonths(viewDate, -1))}
        onNext={() => pushMonth(addMonths(viewDate, 1))}
        onToday={() => pushMonth(new Date())}
        onAdd={() => setIsAddOpen(true)}
        onBlock={() => setIsBlockOpen(true)}
      />

      <MonthGrid
        days={days}
        eventsByDate={eventsByDate}
        className="mt-5"
        // open edit modal when an event chip is clicked
        onOpenEvent={(id) => setSelectedId(id)}
      />

      {isAddOpen && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">
                Add Booking
              </DialogTitle>
            </DialogHeader>
            <AddForm onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {isBlockOpen && (
        <Dialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">
                Block Time Out
              </DialogTitle>
            </DialogHeader>
            <BlockTimeForm onSuccess={() => setIsBlockOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit dialog */}
      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">
                Edit {selectedEvent.kind === "booking" ? "Booking" : "Blocked Time"}
              </DialogTitle>
            </DialogHeader>
            <EditForm
              event={selectedEvent}
              onSuccess={() => setSelectedId(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
