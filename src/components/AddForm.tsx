"use client";

import { useMemo, useEffect, useTransition } from "react";
import { useForm, Controller, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddBookingSchema } from "@/lib/validation";
import { z } from "zod";
import {
  createBooking,
  type CreateBookingResult,
} from "@/app/(actions)/createBooking";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";

type FormValues = z.infer<typeof AddBookingSchema>;
type ActionState = CreateBookingResult | null;

// Helper to add minutes to HH:mm
function addMinutesToHHmm(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function AddForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultValues = useMemo<DefaultValues<FormValues>>(
    () => ({
      name: "",
      class: "reformer",
      classLength: 55,
      startDate: "",
      startTime: "",
      weeks: 1,
      status: "unpaid",
    }),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(AddBookingSchema) as any,
    defaultValues,
  });

  // Server Action state (React 19 API)
  const [actionState, formAction] = useActionState<ActionState, FormData>(
    createBooking,
    null
  );

  // Reset + refresh after success
  useEffect(() => {
    if (actionState?.ok) {
      reset(defaultValues);
      router.refresh();
      onSuccess?.()
    }
  }, [actionState?.ok, reset, defaultValues, router, onSuccess]);

  // Handle manual form submission
  const onSubmit = (values: FormValues) => {
    const fd = new FormData();
    const startTime = values.startTime || "09:00";
    const endTime = addMinutesToHHmm(startTime, values.classLength || 55);

    fd.set("dateISO", values.startDate);
    fd.set("startTime", startTime);
    fd.set("endTime", endTime);
    fd.set("person", values.name);
    fd.set("classType", values.class);
    fd.set("status", values.status);
    fd.set("weeks", String(values.weeks));


    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <label htmlFor="name">Client Name</label>
        <Input
          id="name"
          placeholder="Client name"
          autoComplete="name"
          {...register("name")}
        />
        {errors.name && <p className="text-red-600">{errors.name.message}</p>}
      </div>

      {/* Class and Length */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <label htmlFor="class">Class</label>
          <Controller
            control={control}
            name="class"
            render={({ field }) => (
              <Select
                onValueChange={(v) => field.onChange(v ?? undefined)}
                value={field.value}
              >
                <SelectTrigger id="class" className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reformer">Reformer</SelectItem>
                  <SelectItem value="mat">Mat</SelectItem>
                  <SelectItem value="duo">Duo</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.class && (
            <p className="text-red-600">{errors.class.message}</p>
          )}
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <label htmlFor="classLength">Class Duration</label>
          <Controller
            control={control}
            name="classLength"
            render={({ field }) => (
              <Select
                value={field.value?.toString()}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger id="classLength" className="w-full">
                  <SelectValue placeholder="Duration (mins)" />
                </SelectTrigger>
                <SelectContent>
                  {[30, 55, 90, 110].map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.classLength && (
            <p className="text-red-600">{errors.classLength.message}</p>
          )}
        </div>
      </div>

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <label htmlFor="startDate">Start Date</label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <label htmlFor="startTime">Start Time</label>
          <Input
            id="startTime"
            type="time"
            step={300}
            {...register("startTime")}
          />
        </div>
      </div>

      {/* Weeks + Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <label htmlFor="weeks">Number of Sessions</label>
          <Input
            id="weeks"
            type="number"
            min={1}
            max={52}
            {...register("weeks", { valueAsNumber: true })}
          />
          {errors.weeks && (
            <p className="text-red-600">{errors.weeks.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            (Currently creates one booking; recurrence coming soon.)
          </p>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <label htmlFor="status">Booking Status</label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v ?? undefined)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select Session Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Server-side validation */}
      {actionState && !actionState.ok && actionState.error && (
        <div className="text-sm text-red-600">
          {Object.entries(actionState.error).map(([k, v]) => (
            <div key={k}>{Array.isArray(v) ? v.join(", ") : v}</div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-4">
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isSubmitting || isPending ? "Saving..." : "Save Booking"}
        </Button>
      </div>
    </form>
  );
}
