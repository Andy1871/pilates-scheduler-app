"use client";

import { useState } from "react";
import CalendarHeader from "./CalendarHeader";
import { getStartOfThisWeek } from "@/lib/date-utils";
import { getWeekRangeLabel } from "@/lib/week-label";
import AddForm from "../AddForm";
import BlockTimeForm from "../BlockTimeForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";

import {
  addWeeks,
  startOfWeek,
  addDays,
  format,
} from "date-fns";

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
    return {
      dateISO: iso,
      isToday: iso === todayISO,
    };
  });
}

export default function WeekView() {
  const [viewDate, setViewDate] = useState(getStartOfThisWeek());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBlockOpen, setisBlockOpen] = useState(false);

  const days = buildWeekMatrix(viewDate)
  const headerTitle = getWeekRangeLabel(viewDate)

  return (
    <>
      <CalendarHeader
        title={headerTitle}
        viewDate={viewDate}
        onPrev={() => setViewDate((d) => addWeeks(d, -1))}
        onNext={() => setViewDate((d) => addWeeks(d, 1))}
        onToday={() => setViewDate(getStartOfThisWeek())}
        onAdd={() => setIsAddOpen(true)}
        onBlock={() => setisBlockOpen(true)}
      />

{isAddOpen && (
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">
                Add Booking
              </DialogTitle>
            </DialogHeader>
            <AddForm />
          </DialogContent>
        </Dialog>
      )}

      {isBlockOpen && (
        <Dialog open={isBlockOpen} onOpenChange={setisBlockOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex justify-center">
                Block Time Out
              </DialogTitle>
            </DialogHeader>
            <BlockTimeForm />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
