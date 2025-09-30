import { z } from "zod"

const DURATION_OPTIONS = [30, 55, 90, 110] as const;

export const AddBookingSchema = z.object({
    name: z.string().min(3, "Please enter a client name").max(100, "Name must be under 100 characters"),
    class: z.enum(["1-2-1 reformer", "1-2-1 mat", "duo"], {message: "Please choose a class"}),
    classLength: z
    .coerce.number()
    .int("Whole minutes only")
    .refine((n) => (DURATION_OPTIONS as readonly number[]).includes(n), {
      message: `Choose one of: ${DURATION_OPTIONS.join(", ")} minutes`,
    }),
    startDate: z.string().min(1, "Start date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-MM-dd"),
    weeks: z.coerce.number({message: "Please choose a number of weeks"}).int().min(1).max(52),
    status: z.enum(["paid", "not paid", "hold", "blocked"], {message: "Please choose a paid status"})
})
{/* FInish the schema with the form fields */}


export const AddBlockedTimeSchema = z.object({
    reason: z.string().min(3, "Enter reason").max(100),
    startDate: z.string().min(1, "Start date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-MM-dd"),
    weeks: z
    .coerce.number()
    .int("Whole weeks only")
    .min(1, { message: "Min 1 week"} )
    .max(52, { message: "Max 52 weeks"}),
})


// MAKE SURE TO COME BACK TO ADD TIME IN MINUTES TO THESE FORMS!!!!