"use client";

import { useMemo } from "react";
import { useTransition } from "react";
import { useForm, Controller, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddBookingSchema } from "@/lib/validation";
import { z } from "zod";
import { addBooking } from "@/app/actions";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";

type FormValues = z.input<typeof AddBookingSchema>;

export default function AddForm() {
  const defaultValues = useMemo<DefaultValues<FormValues>>(
    () => ({
      name: "",
      class: undefined,
      classLength: 55,
      startDate: "",
      weeks: undefined,
      status: undefined,
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
    resolver: zodResolver(AddBookingSchema),
    defaultValues,
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await addBooking(values);
      if (res?.ok) reset(defaultValues);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Class (cols 1–6 on md+) */}
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

        {/* Class Length (cols 7–12 on md+) */}
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6">
          <label htmlFor="startDate">Start Date</label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="text-red-600">{errors.startDate.message}</p>
          )}
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <label htmlFor="weeks">Number of Sessions</label>
          <Input
            id="weeks"
            type="number"
            min={1}
            max={52}
            {...register("weeks", { valueAsNumber: true })}
            className="w-full"
          />
          {errors.weeks && (
            <p className="text-red-600">{errors.weeks.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="status">Booking Status</label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              value={field.value ?? undefined}
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

      <div className="flex justify-center mt-4">
        <Button type="submit" disabled={isSubmitting || isPending}>
          {isSubmitting || isPending ? "Saving..." : "Save Booking"}
        </Button>
      </div>
    </form>
  );
}
