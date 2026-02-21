"use client";

import { useEffect, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddBlockedTimeSchema } from "@/lib/validation";
import { z } from "zod";
import {
  createBlockBooking,
  type CreateBlockResult,
} from "@/app/(actions)/createBlockBooking";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof AddBlockedTimeSchema>;
type ActionState = CreateBlockResult | null;

// helper to calculate end time preview
function addMinutesToHHmm(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function BlockTimeForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(AddBlockedTimeSchema) as any,
    defaultValues: {
      reason: "",
      startDate: "",
      startTime: "",
      blockLength: 60,
      weeks: 1,
    },
  });

  const [actionState, formAction] = useActionState<ActionState, FormData>(
    createBlockBooking,
    null
  );

  useEffect(() => {
    if (actionState?.ok) {
      reset();
      router.refresh();
      onSuccess?.();
    }
  }, [actionState?.ok, reset, router, onSuccess]);

  const onSubmit = (values: FormValues) => {
    const fd = new FormData();
    fd.set("reason", values.reason);
    fd.set("startDate", values.startDate);
    fd.set("startTime", values.startTime);
    fd.set("blockLength", String(values.blockLength));
    fd.set("weeks", String(values.weeks));

    startTransition(() => {
      formAction(fd);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Reason */}
      <div>
        <label htmlFor="reason">Reason for Blocking Time</label>
        <Input id="reason" placeholder="Enter reason" {...register("reason")} />
        {errors.reason && (
          <p className="text-red-600">{errors.reason.message}</p>
        )}
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
          <p className="text-xs text-muted-foreground mt-1"></p>
        </div>
      </div>

      {/* Duration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <label htmlFor="blockLength">Duration (minutes)</label>
          <Input
            id="blockLength"
            type="number"
            min={15}
            max={480}
            {...register("blockLength", { valueAsNumber: true })}
          />
          {errors.blockLength && (
            <p className="text-red-600">{errors.blockLength.message}</p>
          )}
        </div>

        {/* Weeks */}
        <div className="md:col-span-6">
          <label htmlFor="weeks">Number of Weeks</label>
          <Input
            id="weeks"
            type="number"
            min={1}
            max={52}
            {...register("weeks")}
          />
          {errors.weeks && (
            <p className="text-red-600">{errors.weeks.message}</p>
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

      {/* Submit */}
      <div className="flex justify-center mt-4">
        <Button type="submit" disabled={isSubmitting || isPending}>
          {(isSubmitting || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting || isPending ? "Blocking..." : "Block Time"}
        </Button>
      </div>
    </form>
  );
}
