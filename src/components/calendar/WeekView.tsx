"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import CalendarHeader from "./CalendarHeader";
import WeekGrid from "./WeekGrid";
import AddForm from "../AddForm";
import BlockTimeForm from "../BlockTimeForm";
import EditForm from "../EditForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { getWeekRangeLabel } from "@/lib/week-label";
import { addWeeks, startOfWeek, addDays, format } from "date-fns";

import type { CalendarEvent, BookingEvent, BlockEvent } from "@/types/event";

type Props = {
  start: string; // ISO
  end: string; // ISO
  events: CalendarEvent[];
};

export type WeekDayModel = {
  dateISO: string;
  isToday: boolean;
};

export function buildWeekMatrix(viewDate: Date): WeekDayModel[] {
  const startMon = startOfWeek(viewDate, { weekStartsOn: 1 });
  const todayISO = format(new Date(), "yyyy-MM-dd");

  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(startMon, i);
    const iso = format(d, "yyyy-MM-dd");
    return { dateISO: iso, isToday: iso === todayISO };
  });
}

export function groupEventsByWeekDay<T extends { start: string }>(
  list: T[]
): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const ev of list) {
    const key = format(new Date(ev.start), "yyyy-MM-dd");
    (map[key] ??= []).push(ev);
  }
  return map;
}

export default function WeekView({ start, end, events }: Props) {
  const router = useRouter();

  const viewDate = useMemo(
    () => startOfWeek(new Date(start), { weekStartsOn: 1 }),
    [start]
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  // ✅ NEW
  const [addStartISO, setAddStartISO] = useState<string | null>(null);

  const days = buildWeekMatrix(viewDate);
  const headerTitle = getWeekRangeLabel(viewDate);
  const weekKey = format(startOfWeek(viewDate, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const go = (d: Date) => {
    const monday = startOfWeek(d, { weekStartsOn: 1 });
    const iso = format(monday, "yyyy-MM-dd");
    router.push(`/week?from=${iso}`);
  };

  const bookingEvents = useMemo(
    () => events.filter((e) => e.kind === "booking") as BookingEvent[],
    [events]
  );

  const blockEvents = useMemo(
    () => events.filter((e) => e.kind === "block") as BlockEvent[],
    [events]
  );

  const bookingByWeekDay = useMemo(
    () => groupEventsByWeekDay(bookingEvents),
    [bookingEvents]
  );
  const blockByWeekDay = useMemo(
    () => groupEventsByWeekDay(blockEvents),
    [blockEvents]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedId) ?? null,
    [selectedId, events]
  );

  return (
    <>
      <CalendarHeader
        title={headerTitle}
        viewDate={viewDate}
        onPrev={() => go(addWeeks(viewDate, -1))}
        onNext={() => go(addWeeks(viewDate, 1))}
        onToday={() => go(new Date())}
        onAdd={() => {
          setSelectedId(null);
          setAddStartISO(null);   // manual add = blank date/time
          setIsAddOpen(true);
        }}
        onBlock={() => setIsBlockOpen(true)}
      />

      <WeekGrid
        key={weekKey}
        days={days}
        bookingByWeekDay={bookingByWeekDay}
        blockByWeekDay={blockByWeekDay}
        className="mt-5"
        startHour={7}
        endHour={21}
        slotMinutes={30}
        onOpenEvent={(id) => setSelectedId(id)}
        onCreateBooking={(startISO) => {
          setSelectedId(null);
          setAddStartISO(startISO);
          setIsAddOpen(true);
        }}
      />

      {isAddOpen && (
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) setAddStartISO(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">Add Booking</DialogTitle>
            </DialogHeader>

            <AddForm
              defaultStartISO={addStartISO ?? undefined}
              onSuccess={() => {
                setIsAddOpen(false);
                setAddStartISO(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {isBlockOpen && (
        <Dialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">Block Time Out</DialogTitle>
            </DialogHeader>
            <BlockTimeForm onSuccess={() => setIsBlockOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

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
            <EditForm event={selectedEvent} onSuccess={() => setSelectedId(null)} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
