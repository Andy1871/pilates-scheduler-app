"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { CalendarEvent, BookingEvent, BlockEvent } from "@/types/event";
import {
  updateBooking,
  type UpdateBookingResult,
} from "@/app/(actions)/updateBooking";
import {
  updateBlock,
  type UpdateBlockResult,
} from "@/app/(actions)/updateBlock";
import {
  deleteBooking,
  type DeleteBookingResult,
} from "@/app/(actions)/deleteBooking";

// helpers

function toHHmm(d: Date) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function minutesBetween(aISO: string, bISO: string) {
  const a = new Date(aISO).getTime();
  const b = new Date(bISO).getTime();
  return Math.max(1, Math.round((b - a) / 60000));
}

type Scope = "one" | "series";

type BookingForm = {
  scope: Scope;
  dateISO: string;
  startTime: string;
  endTime: string;
  person: string;
  classType: "reformer" | "mat" | "duo";
  status: "paid" | "unpaid" | "hold";
};

type BlockForm = {
  scope: Scope;
  dateISO: string;
  startTime: string;
  blockLength: number;
  reason: string;
};

type Props = {
  event: CalendarEvent;
  onSuccess?: () => void;
};



export default function EditForm({ event, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isBooking = event.kind === "booking";

  // check if this event belongs to a series
  const hasSeries: boolean = useMemo(() => {
    const maybeSeries = (event as any)?.seriesId;
    return !!maybeSeries;
  }, [event]);

  // default values for the forms
  const defaults = useMemo(() => {
    const start = new Date(event.start);
    const end = new Date(event.end);

    if (isBooking) {
      const b = event as BookingEvent;
      return {
        // booking fields
        scope: "one" as Scope,
        dateISO: event.start.slice(0, 10),
        startTime: toHHmm(start),
        endTime: toHHmm(end),
        person: b.person ?? "",
        classType: (b.classType ?? "reformer") as "reformer" | "mat" | "duo",
        status: b.status as "paid" | "unpaid" | "hold",
        // block-only fields (not used in booking form but kept to satisfy defaults)
        reason: "",
        blockLength: minutesBetween(event.start, event.end),
      };
    }
    // block
    const blk = event as BlockEvent;
    const mins = minutesBetween(event.start, event.end);
    return {
      // block fields
      scope: "one" as Scope,
      dateISO: event.start.slice(0, 10),
      startTime: toHHmm(start),
      blockLength: mins,
      reason: blk.reason ?? "",
      // booking-only fields (not used in block form but kept to satisfy defaults)
      endTime: toHHmm(end),
      person: "",
      classType: "reformer" as const,
      status: "unpaid" as const,
    };
  }, [event, isBooking]);

  // React Hook Form instances 

  // Booking form
  const {
    register: registerBooking,
    handleSubmit: handleSubmitBooking,
    formState: { errors: errorsBooking },
    setValue: setBookingValue,
    watch: watchBooking,
  } = useForm<BookingForm>({
    defaultValues: defaults as unknown as BookingForm,
  });

  const applySeriesBooking = watchBooking("scope") === "series";

  // Block form
  const {
    register: registerBlock,
    handleSubmit: handleSubmitBlock,
    formState: { errors: errorsBlock },
    setValue: setBlockValue,
    watch: watchBlock,
  } = useForm<BlockForm>({ defaultValues: defaults as unknown as BlockForm });

  const applySeriesBlock = watchBlock("scope") === "series";

  // server actions with useActionState (accept FormData) 

  const [bookingState, bookingAction] = useActionState<
    UpdateBookingResult | null,
    FormData
  >(updateBooking, null);
  const [blockState, blockAction] = useActionState<
    UpdateBlockResult | null,
    FormData
  >(updateBlock, null);
  const [deleteState, deleteAction] = useActionState<
    DeleteBookingResult | null,
    FormData
  >(deleteBooking, null);

  // Refresh and close form on success
  useEffect(() => {
    const ok = isBooking ? bookingState?.ok || deleteState?.ok : blockState?.ok;
    if (ok) {
      router.refresh();
      onSuccess?.();
    }
  }, [
    bookingState?.ok,
    deleteState?.ok,
    blockState?.ok,
    isBooking,
    router,
    onSuccess,
  ]);

  // Submit handlers 

  const onSubmitBooking = (values: BookingForm) => {
    const fd = new FormData();
    fd.set("id", event.id);
    fd.set("scope", values.scope); // "one" | "series"
    fd.set("dateISO", values.dateISO);
    fd.set("startTime", values.startTime);
    fd.set("endTime", values.endTime);
    fd.set("person", values.person);
    fd.set("classType", values.classType);
    fd.set("status", values.status);



    startTransition(() => bookingAction(fd));
  };

  const onSubmitBlock = (values: BlockForm) => {
    const fd = new FormData();
    fd.set("id", event.id);
    fd.set("scope", values.scope); // "one" | "series"
    fd.set("dateISO", values.dateISO);
    fd.set("startTime", values.startTime);
    fd.set("blockLength", String(values.blockLength));
    fd.set("reason", values.reason);


    startTransition(() => blockAction(fd));
  };

  const onDeleteBooking = () => {
    const scope = applySeriesBooking ? "series" : "one";

    // Confirms through an alert 
    if (
      !window.confirm(
        scope === "series"
          ? "Delete ALL bookings in this series?"
          : "Delete this booking?"
      )
    ) {
      return;
    }

    const fd = new FormData();
    fd.set("id", event.id);
    fd.set("scope", scope);

    startTransition(() => deleteAction(fd));
  };

  // UI

  if (isBooking) {
    return (
      <form
        onSubmit={handleSubmitBooking(onSubmitBooking)}
        className="flex flex-col gap-4"
      >
        {hasSeries && (
          <div className="flex items-center gap-3">
            <Switch
              id="applyToSeries"
              checked={applySeriesBooking}
              onCheckedChange={(checked) =>
                setBookingValue("scope", checked ? "series" : "one", {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            />
            <Label htmlFor="applyToSeries">Apply to all in this series</Label>
          </div>
        )}

        {/* hidden scope field registered with RHF (no fixed value prop) */}
        <input
          id="edit-booking-scope"
          type="hidden"
          {...registerBooking("scope")}
        />

        <div>
          <Label htmlFor="dateISO">Date</Label>
          <Input id="dateISO" type="date" {...registerBooking("dateISO")} />
          {errorsBooking.dateISO && (
            <p className="text-red-600">
              {String(errorsBooking.dateISO.message)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startTime">Start</Label>
            <Input
              id="startTime"
              type="time"
              step={300}
              {...registerBooking("startTime")}
            />
            {errorsBooking.startTime && (
              <p className="text-red-600">
                {String(errorsBooking.startTime.message)}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="endTime">End</Label>
            <Input
              id="endTime"
              type="time"
              step={300}
              {...registerBooking("endTime")}
            />
            {errorsBooking.endTime && (
              <p className="text-red-600">
                {String(errorsBooking.endTime.message)}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="person">Client</Label>
          <Input id="person" {...registerBooking("person")} />
          {errorsBooking.person && (
            <p className="text-red-600">
              {String(errorsBooking.person.message)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="classType">Class</Label>
            <select
              id="classType"
              className="border rounded px-2 py-1 w-full"
              {...registerBooking("classType")}
            >
              <option value="reformer">Reformer</option>
              <option value="mat">Mat</option>
              <option value="duo">Duo</option>
            </select>
            {errorsBooking.classType && (
              <p className="text-red-600">
                {String(errorsBooking.classType.message)}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="border rounded px-2 py-1 w-full"
              {...registerBooking("status")}
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="hold">Hold</option>
            </select>
            {errorsBooking.status && (
              <p className="text-red-600">
                {String(errorsBooking.status.message)}
              </p>
            )}
          </div>
        </div>

        {bookingState && !bookingState.ok && bookingState.error && (
          <div className="text-sm text-red-600">
            {Object.entries(bookingState.error).map(([k, v]) => (
              <div key={k}>{Array.isArray(v) ? v.join(", ") : v}</div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onDeleteBooking}
            disabled={isPending}
          >
            {isPending
              ? "Deleting..."
              : applySeriesBooking
              ? "Delete series"
              : "Delete booking"}
          </Button>
        </div>
      </form>
    );
  }

  // Block form
  return (
    <form
      onSubmit={handleSubmitBlock(onSubmitBlock)}
      className="flex flex-col gap-4"
    >
      {hasSeries && (
        <div className="flex items-center gap-3">
          <Switch
            id="applyToSeries"
            checked={applySeriesBlock}
            onCheckedChange={(checked) =>
              setBlockValue("scope", checked ? "series" : "one", {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
          />
          <Label htmlFor="applyToSeries">Apply to all in this series</Label>
        </div>
      )}

      {/* hidden scope field registered with RHF (no fixed value prop) */}
      <input
        id="edit-block-scope"
        type="hidden"
        {...(registerBlock("scope") as any)}
      />

      <div>
        <Label htmlFor="dateISO">Date</Label>
        <Input id="dateISO" type="date" {...registerBlock("dateISO")} />
        {errorsBlock.dateISO && (
          <p className="text-red-600">{String(errorsBlock.dateISO.message)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="startTime">Start</Label>
          <Input
            id="startTime"
            type="time"
            step={300}
            {...registerBlock("startTime")}
          />
          {errorsBlock.startTime && (
            <p className="text-red-600">
              {String(errorsBlock.startTime.message)}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="blockLength">Duration (mins)</Label>
          <Input
            id="blockLength"
            type="number"
            min={15}
            max={480}
            {...registerBlock("blockLength", { valueAsNumber: true })}
          />
          {errorsBlock.blockLength && (
            <p className="text-red-600">
              {String(
                (errorsBlock.blockLength as any).message ||
                  errorsBlock.blockLength
              )}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" {...registerBlock("reason")} />
        {errorsBlock.reason && (
          <p className="text-red-600">{String(errorsBlock.reason.message)}</p>
        )}
      </div>

      {blockState && !blockState.ok && blockState.error && (
        <div className="text-sm text-red-600">
          {Object.entries(blockState.error).map(([k, v]) => (
            <div key={k}>{Array.isArray(v) ? v.join(", ") : v}</div>
          ))}
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
