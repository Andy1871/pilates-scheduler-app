// app/(routes)/bookings/BlockTimeForm.tsx
"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddBlockedTimeSchema } from "@/lib/validation";
import { z } from "zod";
import { addBlockedTime } from "@/app/actions";

import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

type FormValues = z.input<typeof AddBlockedTimeSchema>;

export default function BlockTimeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(AddBlockedTimeSchema),
    defaultValues: {
      reason: "",
      startDate: "",
      weeks: undefined, 
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await addBlockedTime(values);
      if (res?.ok) reset();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="reason">Reason for Blocking Time</label>
        <Input
          id="reason"
          placeholder="Enter reason"
          {...register("reason")}
          aria-invalid={!!errors.reason}
        />
        {errors.reason && (
          <p className="text-red-600">{errors.reason.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="startDate">Start Date</label>
        <Input
          id="startDate"
          type="date"
          {...register("startDate")}
          aria-invalid={!!errors.startDate}
        />
        {errors.startDate && (
          <p className="text-red-600">{errors.startDate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="weeks">Number of Weeks</label>
        <Input
          id="weeks"
          type="number"
          min={1}
          max={52}
          // NOTE: no valueAsNumber here because schema uses z.coerce.number()
          {...register("weeks")}
          aria-invalid={!!errors.weeks}
        />
        {errors.weeks && (
          <p className="text-red-600">{errors.weeks.message}</p>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isSubmitting || isPending ? "Blocking..." : "Block Time"}
        </Button>
      </div>
    </form>
  );
}
