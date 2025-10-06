import { z } from "zod";

export const DURATION_OPTIONS = [30, 55, 90, 110] as const;

export const AddBookingSchema = z.object({
  name: z
    .string()
    .min(3, "Please enter a client name")
    .max(100, "Name must be under 100 characters"),

  class: z.enum(["reformer", "mat", "duo"], {
    message: "Please choose a class",
  }),

  classLength: z.coerce
    .number({
      message: "Please choose a class duration",
    })
    .int("Whole minutes only")
    .refine((n) => (DURATION_OPTIONS as readonly number[]).includes(n), {
      message: `Choose one of: ${DURATION_OPTIONS.join(", ")} minutes`,
    }),

  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-MM-dd")
    .min(1, "Start date is required"),

  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:mm")
    .min(1, "Start time is required"),

  weeks: z.coerce
    .number({
      message: "Please enter number of weeks",
    })
    .int()
    .min(1, { message: "Minimum 1 week" })
    .max(52, { message: "Maximum 52 weeks" }),

  status: z.enum(["paid", "unpaid", "hold"], {
    message: "Please choose a payment status",
  }),
});



export const AddBlockedTimeSchema = z.object({
  reason: z.string().min(3, "Enter reason").max(100),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-MM-dd"),

  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Use HH:mm")
    .min(1, "Start time is required"),

  blockLength: z
    .coerce.number({ message: "Please enter duration in minutes" })
    .int("Whole minutes only")
    .min(15, { message: "Minimum 15 minutes" })
    .max(780, { message: "Maximum 13 hours" }),

  weeks: z
    .coerce.number()
    .int("Whole weeks only")
    .min(1, { message: "Min 1 week" })
    .max(52, { message: "Max 52 weeks" }),
});

